import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import dbConnection from "./db/index.js";
import { app } from "./app.js";
import { createServer } from "http";
import { initializeSocket } from "./socketServer.js";

console.log("Loaded env vars:", {
  AGORA_APPID: process.env.AGORA_APP_ID,
  AGORA_CERTIFICATE: process.env.AGORA_CERTIFICATE,
});
dbConnection()
  .then(() => {
    app.get("/hello", (req, res) => {
      return res.send("hello server!");
    });
    const httpServer = createServer(app);
    httpServer.listen(process.env.PORT || 8001, () => {
      console.log(
        `Server running at http://localhost:${process.env.PORT || 8001}`
      );
      console.log("WebSocket endpoint: http://localhost/websocket");
    });

    initializeSocket(httpServer);
  })

  .catch((error) => {
    console.log("db connection failed!!", error);
  });
