const c = 'messages-c'

import './message-insert.js'
import './message-edit.js'
import './message-remove.js'

import { showEditPopup, currentlyEditedMessageId } from './message-update.js'

const response = await fetch('/messages.mjs')
const result = await response.json()

export let messages = $(result.response)

$(c => {
  c.html`
    <style>
      messages-c {
        min-height: 100vh;
        padding: var(--space-scaled);
        display: grid;
        place-content: center;
        font-weight: 500;
        text-align: left;
        & > message-table {
          padding: 4.0rem;
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          & > table {
            width: 100%;
            & > tbody {
              & > tr {
                border-bottom: 1px solid var(--color-border);
                &:last-child {
                  border-bottom: none;
                }
                &:hover {
                  background: rgba(42, 42, 49, 0.5);
                }
                & > th {
                  color: var(--color-muted-foreground);
                }
                & > th,
                & > td {
                  padding: 1.6rem;
                  line-height: 2rem;
                }
              }
            }
          }
        }
      }
    </style>

    <message-insert></message-insert>
    <message-table>
      ${messages().length === 0 ? `<p>Brak wiadomości</p>` : `        
        <table>
          <tbody>
            <tr>
              <th>ID</th>
              <th>Wiadomość</th>
              <th>Akcje</th>
            </tr>
            ${messages().map(({id, message}) => `
              <tr>
                <td>${id}</td>
                <td>${message}</td>
                <td>
                  <message-edit data-id="${id}"></message-edit>
                  <message-remove data-id="${id}"></message-remove>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ${showEditPopup() ? `<message-update data-id="${currentlyEditedMessageId()}"></message-update>` : ``}
    `}
    </message-table>
  `
},c)
