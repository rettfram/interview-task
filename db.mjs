import { DatabaseSync } from 'node:sqlite'

export const db = new DatabaseSync('./db.sqlite')

export const createMessagesTable = db.exec(/*sql*/`
  create table if not exists "Messages" (
    "id" text primary key,
    "message" text
  )
`)

export const insertMessage = db.prepare(/*sql*/`
  insert into "Messages" ("id", "message") values (?, ?) returning *
`)

export const selectMessages = db.prepare(/*sql*/`
  select * from "Messages"
`)

export const deleteMessageById = db.prepare(/*sql*/`
  delete from "Messages" where "id" = ?
`)

export const updateMessageById = db.prepare(/*sql*/`
  update "Messages" set "message" = ? where "id" = ?
`)