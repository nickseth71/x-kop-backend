import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import agenda from "./utils/agenda.js"
import defineReminderJob from "./jobs/meetingReminderJob.js"
const app = express()

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  }),
)

//////////////////////////// Agenda Jobs for reminder ////////////////////////////

defineReminderJob(agenda)
;(async function () {
  await agenda.start()
  console.log("Agenda started")
})()

// process.env.CORS_ORIGIN
app.use(express.json({ limit: "2gb" }))
app.use(express.urlencoded({ extended: true, limit: "2gb" }))
app.use(express.static("public"))
app.use(cookieParser())
// routes import
import userRouter from "./routers/user.routes.js"
import adminRouter from "./routers/admin.routes.js"
import consultationTypeRouter from "./routers/consultationType.routes.js"
import consultationFeeTypeRouter from "./routers/consultationFeeType.routes.js"
import consultationPaymentDetails from "./routers/consultationPaymentDetails.routers.js"
import agoraTokenGen from "./routers/agoraTokenGen.routes.js"

import chatRouter from "./routers/chat.routes.js"

import OfficerRouter from "./routers/officerDetails.routes.js"
import officerAbsence from "./routers/absence.routes.js"

import scheduleingRouter from "./routers/scheduling.routes.js"
import { sendPushNotificationCall } from "./utils/pushNotificationCall.js"
import officerFindRouter from "./routers/findOfficer.routes.js"

import bankDetailsRouter from "./routers/bankDetails.routes.js"
import consultationRoute from "./routers/consultation.routes.js"
import emitRoute from "./routers/emitRoute.js"
import phonepeRouter from "./routers/phonepetransaction.routes.js"

import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "X-Kop Backend API",
      version: "1.0.0",
      description: "API documentation for X-Kop backend",
    },
    servers: [
      {
        url: "http://localhost:8001",
        description: "Local development",
      },
      {
        url: "https://xkop.in",
        description: "Production",
      },
      {
        url: "https://x-kop-backend.onrender.com",
        description: "Render deployment",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routers/*.js"],
}

const specs = swaggerJsdoc(options)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/consultationType", consultationTypeRouter)
app.use("/api/v1/consultationFeeType", consultationFeeTypeRouter)
app.use("/api/v1/payment", consultationPaymentDetails)
app.use("/api/v1/token", agoraTokenGen)

app.use("/api/v1/officer_schedule", scheduleingRouter)

app.use("/api/v1/chats", chatRouter)
app.use("/api/v1/officer-available", officerAbsence)
app.use("/api/v1/officer", OfficerRouter)
app.use("/api/v1/officerFind", officerFindRouter)
app.use("/api/v1/bank", bankDetailsRouter)

app.use("/api/v1/consultation", consultationRoute)

app.use("/api/v1/", emitRoute)

app.use("/api/v1/phonepe", phonepeRouter)

app.use("/api/v1/", async (req, res) => {
  return res.json({ data: "cron job run" })

  // try {
  //   const notification = await sendPushNotificationCall(
  //     "e92dkrXiQLCoLKQ2g2CyI7:APA91bFE_8WAYXt56S4RI2oXaHalfth_0Sv5sLhFhpo9MspgmCgovBV3QyBXOEcyJTuk2o1wRSHyZTyL73Qeg_g22OSiMjsxw29cVgBOQg0YIc77ulbbJYA",
  //     {
  //       title: "x-kop",
  //       body: "check send notigication Bhupendra Singh",
  //       data: {},
  //     }
  //   );

  //   return res
  //     .status(200)
  //     .json({ message: "send notification", status: notification });
  // } catch (error) {
  //   return res.status(500).json({ message: "server error", status: error });
  // }
})

app.use("/api", emitRoute)

export { app }
