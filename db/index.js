import mongoose from "mongoose";
import { DB_NAME } from "./../constants.js";

const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      // `${process.env.MONGODB_URI}/${DB_NAME}`
      `mongodb://localhost:27017`,
    );
    // , connectionInstance.connection.host
    console.log("db connected==host");
  } catch (error) {
    console.log("mongodb connection failed!!", error);
  }
};

export default dbConnection;
