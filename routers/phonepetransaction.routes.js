import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  initiateTransaction,
  verifyTransaction,
  phonepeWebhook,
  listTransactions,
} from "../controllers/phonepeTransaction.controller.js"

const router = Router()

// iOS calls these — must be logged in
router.route("/initiate").post(verifyJWT, initiateTransaction)
router.route("/verify/:merchantOrderId").get(verifyJWT, verifyTransaction)
router.route("/transactions").get(verifyJWT, listTransactions)

// PhonePe calls this — no user JWT available, protected by webhook
// signature validation inside the controller instead.
router.route("/webhook").post(phonepeWebhook)

export default router
