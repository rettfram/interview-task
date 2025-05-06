const c = 'message-update'

import { messages } from './messages.js'

export let showEditPopup = $(false)
export let currentlyEditedMessageId = $('')
let validationError = $('')

$(() => console.log(showEditPopup()))

$(c => {
  let message = messages().find(message => message.id === currentlyEditedMessageId())?.message ?? ''

  c.html`
    <style>
      message-update {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        min-height: 100vh;
        & > dialog {
          width: 100%;
          height: 100%;
          padding: var(--space-scaled);
          display: grid;
          place-content: center;
          font-weight: 500;
          text-align: left;
          background: var(--color-background);
          & > form {
            min-width: 50vw;
            padding: var(--space-scaled) 0;
            display: grid;
            grid-template-columns: 1fr auto;
            & > input {
              &:focus {
                border: 1px solid var(--color-foreground);
              }
            }
            & > output {
              padding: 1rem;
              color: var(--color-error);
            }
          }
        }
      }
    </style>
    
    <dialog ${showEditPopup() ? 'open' : ''}>
      <form name="updateMessage">
        <input type="text" name="message" placeholder="message" value="${message ?? ''}">
        <button>&#10003;</button>
        <output>${validationError()}</output>
      </form>
    </dialog>
  `

  c.onsubmit = async event => {
    event.preventDefault()
    validationError('')

    const id = currentlyEditedMessageId()
    const message = event.target.elements['message'].value ?? ''
    if (!message) return validationError('Wiadomość nie może być pusta')
  
    if (event.target.name === 'updateMessage') {
      await fetch('/messages.mjs', {
        method: 'PATCH',
        body: JSON.stringify({ id, message })
      })
      messages(messages().map(m => m.id === id ? { ...m, message } : m))
    }
    showEditPopup(false)
  }

  c.querySelector('dialog form input').focus()
},c)