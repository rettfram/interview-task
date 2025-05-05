const c = 'message-insert'

import { messages } from "./messages.js"

let validationError = $('')

$(c => {
  c.html`
    <style>
      message-insert form {
        min-width: 50vw;
        padding: var(--space-scaled) 0;
        display: grid;
        grid-template-columns: 1fr auto;
        & > output {
          padding: 1rem;
          color: var(--color-error);
        }
      }
    </style>

    <form name="insertMessage">
      <input type="text" name="message" placeholder="message">
      <button>&#10010;</button>
      <output>${validationError()}</output>
    </form>
  `

  c.onsubmit = async event => {
    event.preventDefault()
    validationError('')

    const id = crypto.randomUUID()
    const message = event.target.elements['message'].value ?? ''
    if (!message) return validationError('Wiadomość nie może być pusta')
  
    if (event.target.name === 'insertMessage') {
      await fetch('/messages.mjs', {
        method: 'POST',
        body: JSON.stringify({ id, message })
      })
      messages([{ id, message }, ...messages()])
    }
  }
},c)