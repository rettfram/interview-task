import { insertMessage, selectMessages, updateMessageById, deleteMessageById } from './db.mjs'

export const POST = async request => {
  try {
    const { id, message } = request.body

    const response = await insertMessage.run(id, message)

    return new Response(JSON.stringify({ response, message: 'Message was inserted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Something went wrong' }), { status: 500 })
  }
}

export const GET = async () => {
  try {
    const response = await selectMessages.all()

    return new Response(JSON.stringify({ response, message: 'Message was inserted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Something went wrong' }), { status: 500 })
  }
}

export const PATCH = async request => {
  try {
    const { id, message } = request.body

    const response = await updateMessageById.run(message, id)

    return new Response(JSON.stringify({ response, message: 'Message was updated' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Something went wrong' }), { status: 500 })
  }
}

export const DELETE = async request => {
  try {
    const { id } = request.body

    const response = await deleteMessageById.run(id)

    return new Response(JSON.stringify({ response, message: 'Message was removed' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Something went wrong' }), { status: 500 })
  }
}