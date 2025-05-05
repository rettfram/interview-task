const logRequest = request => {
  console.log({ 
    method: request.method,
    url: request.url,
    body: request.body, 
    query: request.query, 
    params: request.params, 
    session: request.session,
    cookies: request.cookies,
    filepath: request.filepath,
    environment: request.environment,
  })
}

export default async (request) => [
  // logRequest(request)
]