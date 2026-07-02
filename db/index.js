import dotenv from "dotenv"
import mongoose from "mongoose"
import { DB_NAME } from "./../constants.js"

dotenv.config({ path: "./.env" })

const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI
  }

  return `mongodb://127.0.0.1:27017/${DB_NAME}`
}

const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(getMongoUri(), {
      serverSelectionTimeoutMS: 10000,
    })

    console.log(`db connected ==> ${connectionInstance.connection.host}`)
  } catch (error) {
    console.error("mongodb connection failed!!", error.message)
    throw error
  }
}

export default dbConnection
