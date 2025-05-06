const c = 'message-remove'

import { messages } from "./messages.js"

$(c => {
  const { id } = c.dataset

  c.html`<button>&#10006;</button>`

  c.onclick = async event => {
    event.preventDefault()

    await fetch('/messages.mjs', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    })
    messages(messages().filter(message => message.id !== id))
  }
},c)