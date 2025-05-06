const c = 'message-edit'

import './message-update.js'

import { showEditPopup, currentlyEditedMessageId } from './message-update.js'

$(c => {
  const { id } = c.dataset

  c.html`<button>&#x270E;</button>`

  c.querySelector('button').onclick = () => {
    showEditPopup(true)
    currentlyEditedMessageId(id)
  }
},c)