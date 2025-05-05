// Import required modules
const { createServer } = await import('node:http')
const { extname } = await import('node:path')
const { createReadStream } = await import('node:fs')
const { readFile, stat } = await import('node:fs/promises')

// Set constants
const isrInterval = 0 // 60 * 1000
const cachedFileMaxSize = 1024 * 1024

const serverPaths = ['module', 'package', '.env', '.mjs', '.db', '.sqlite']
const fixedPaths = {
  db: './db.mjs',
  middleware: './middleware.mjs',
  notFound: './not-found.html',
}

// Map file extensions to MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
}

// Try to determine content type
const setContentType = async (body, headers) => {
  if (!headers['content-type']) {
    if (!body.pipe && !Buffer.isBuffer(body) && typeof body === 'object') return headers['content-type'] = 'application/json'
    if (body.trim().startsWith('<?xml') && body.trim().endsWith('?>')) return headers['content-type'] = 'text/xml'
    if (body.trim().startsWith('<') && body.trim().endsWith('>')) return headers['content-type'] = 'text/html'
    if (body.includes('const') && body.includes('=>')) return headers['content-type'] = 'application/javascript'
    if (body.includes('display') && body.includes('%;')) return headers['content-type'] = 'text/css'
    if (body.includes('Content-Disposition: form-data')) return headers['content-type'] = 'multipart/form-data'
    if (body.includes('=') && body.includes('&')) return headers['content-type'] = 'application/x-www-form-urlencoded'
    if (typeof body === 'string') return headers['content-type'] = 'text/plain'
    if (typeof body.pipe === 'function') return headers['content-type'] = 'application/octet-stream'
    if (Buffer.isBuffer(body)) return headers['content-type'] = 'application/octet-stream'
    return headers['content-type'] = 'text/plain'
  }
}

// Add request utility
global.Request = class Request {
  constructor(request) {
    this.raw = request
    this.method = request.method
    this.url = request.url
    this.headers = request.headers
    this.env = null
    this.filepath = null
    this.query = {}
    this.body = null
    this.cookies = {}
    this.session = {}
  }

  async resolveEnv() {
    const url = new URL(this.url, `https://${this.headers.host}`)
    if (serverPaths.some(serverPath => url.pathname.includes(serverPath))) return this.env = 'server'
    return this.env = 'client'
  }

  async resolvePath() {
    const url = new URL(this.url, `https://${this.headers.host}`)
    this.query = Object.fromEntries(url.searchParams.entries())
    
    if (url.pathname.endsWith('/')) return this.filepath = `./${url.pathname}index.html`
    if (!url.pathname.includes('.')) return this.filepath = `./${url.pathname}.html`
    return this.filepath = `./${url.pathname}`
  }

  async parseBody() {
    const bodyChunks = []
    return new Promise((resolve, reject) => {
      this.raw
        .on('data', (chunk) => bodyChunks.push(chunk))
        .on('end', async () => {
          const body = Buffer.concat(bodyChunks).toString()
          this.body = body.trim().startsWith('{') || body.trim().startsWith('[') ? JSON.parse(body) || body : body
          if (typeof this.body === 'string') this.body = this.body.replace(/<script.*?>.*?<\/script>/gi, '').replace(/on\w+=".*?"/g, '')
          await setContentType(this.body, this.headers)
          resolve(this.body)
        })
        .on('error', reject)
    })
  }

  async parseCookies() {
    this.cookies = Object.fromEntries(
      this.headers.cookie?.split(';').map((cookie) => {
        const [key, ...value] = cookie.split('=')
        return [key.trim(), value.join('=').trim()]
      }) || []
    )
  }
}

// Add response utility
global.Response = class Response {
  constructor( body = null, { status = 200, statusText = 'OK', headers = {}, url = '', redirected = false, type = 'default' } = {}) {
    this.body = body
    this.bodyUsed = false
    this.ok = status >= 200 && status < 300
    
    this.status = status
    this.statusText = statusText
    this.headers = new Map(Object.entries(headers))
    this.url = url
    this.redirected = redirected
    this.type = type
  }
  
  async text() { return this._getBody().toString() }
  async json() { return JSON.parse(await this.text()) }
  async arrayBuffer() { return (await this._getBody()).buffer }

  static error() { return new Response(null, { status: 0, statusText: 'Error' }) }
  static redirect(url) { return new Response(null, { status: 302, headers: { "Location": url } }) }
  static json(data, init = {}) { return new Response(JSON.stringify(data), { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } }) }

  async send(response) {
    if (this.body) await setContentType(this.body, this.headers)
    response.writeHead(this.status, { ...Object.fromEntries(this.headers) })
    response.end(this.body)
  }

  async stream(response, filepath) {
    try {
      response.writeHead(this.status, { ...Object.fromEntries(this.headers) })
      createReadStream(filepath).pipe(response).on('error', (error) => console.error(error) && response.end('Streaming Error'))
    } catch (error) {
      console.error(error) && response.writeHead(500, { ...Object.fromEntries(this.headers) }).end('Streaming Error')
    }
  }
}

// Handle imports
const importMiddleware = async () => {
  try { return (await import(fixedPaths.middleware)).default } 
  catch (error) { error.code === 'ERR_MODULE_NOT_FOUND' ? console.warn('middleware.mjs not found - skipping import...') : console.error(error) }
}

const importDB = async () => {
  try { return (await import(fixedPaths.db)).default } 
  catch (error) { error.code === 'ERR_MODULE_NOT_FOUND' ? console.warn('db.mjs not found - skipping import...') : console.error(error) }
}

const importModule = async (request) => {
  try { return (await import(request.filepath))[request.method] } 
  catch (error) { error.code === 'ERR_MODULE_NOT_FOUND' ? console.warn('module not found - skipping import...') : console.error(error) }
}

const importFile = async (request) => {
  try { return (await readFile(request.filepath, 'utf-8')) } 
  catch (error) { error.code === 'ENOENT' ? console.warn('file not found - skipping import...') : console.error(error) }
}

// Cache files
let cache = {}
const cacheFile = async (request) => cache[request.filepath] && Date.now() - cache[request.filepath].timestamp < cache[request.filepath].cacheDuration ? 
cache[request.filepath] : cache[request.filepath] = {
  content: await importFile(request),
  mime: mimeTypes[extname(request.filepath)] || 'text/plain',
  timestamp: Date.now(),
  cacheDuration: isrInterval || 0
}

// Create server
const nodeServer = createServer(async (req, res) => {
  try {
    const request = new Request(req)
    await request.parseBody()
    await request.parseCookies()
    await request.resolveEnv()
    await request.resolvePath()

    // Import middleware
    const middlewareHandler = await importMiddleware()
    for (const middleware of await middlewareHandler(request)) {
      if (middleware) return middleware.send(res)
    }

    const fileStats = await stat(request.filepath)
    if (request.env === 'server') {
      const methodHandler = await importModule(request)
      return methodHandler ? (await methodHandler(request)).send(res) : 
      new Response(`Method ${request.method} Not Allowed`, { status: 405 }).send(res)
    } else if (request.env === 'client' && fileStats.size < cachedFileMaxSize) {
      const cached = await cacheFile(request)
      return !cached ? new Response('File not cached', { status: 500 }).send(res) : 
      new Response(cached.content, { status: 200, headers: { 'Content-Type': cached.mime, 'Cache-Control': `public, max-age=${cached.cacheDuration / 1000}` } }).send(res)
    } else {
      return new Response('Streaming File', { 'Content-Type': mimeTypes[extname(request.filepath)] || 'text/html' }).stream(res, request.filepath)
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      const notFoundContent = await readFile(fixedPaths.notFound, 'utf-8')
      return new Response(notFoundContent, { status: 404, headers: { 'Content-Type': 'text/html' } }).send(res)
    } else {
      console.error(error)
      return new Response('Internal Server Error', { status: 500, headers: { 'Content-Type': 'text/plain' } }).send(res)
    }
  }
})

// Import DB
await importDB()

// Start server
nodeServer.listen(8080, () => console.log('Server is running on http://localhost:8080'))