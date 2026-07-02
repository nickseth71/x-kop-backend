import dotenv from "dotenv"
dotenv.config({ path: "./.env" })

import Agenda from "agenda"
import { DB_NAME } from "./../constants.js"

const getAgendaMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI
  }

  return `mongodb://127.0.0.1:27017/${DB_NAME}`
}

const agenda = new Agenda({
  db: {
    address: getAgendaMongoUri(),
    collection: "agendaJobs",
  },
  processEvery: "30 seconds",
})

export default agenda
