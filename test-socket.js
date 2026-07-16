import { io } from "socket.io-client"

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YTRkZjYwN2EzMWEyMjQzMzkyZWIxNGIiLCJuYW1lIjoiQXJ5YW4gT2ZmaWNlciIsIm1vYmlsZSI6Ijk4MDcwMTgwMDUiLCJpYXQiOjE3ODM0OTQ3MTQsImV4cCI6MTc4MzU4MTExNH0.VDcpTisCBXvEEnVD6u1euo7-PjF5YgzssKVEYTqKPks"
const callerId = "9807018005"

const socket = io("https://x-kop-backend.onrender.com/websocket", {
  transports: ["websocket"],
  query: { callerId, token },
  extraHeaders: { Authorization: `Bearer ${token}` },
})

socket.on("connect", () => {
  console.log("connected", socket.id)
  socket.emit("onLive", { status: true, fcmToken: "test-fcm-token" })
})

socket.on("connect_error", (err) => console.error("connect_error", err.message))
socket.on("error", (err) => console.error("socket error", err))
socket.on("disconnect", () => console.log("disconnected"))
