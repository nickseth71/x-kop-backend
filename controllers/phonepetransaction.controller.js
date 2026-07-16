import crypto from "crypto"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import PhonePeTransaction from "../models/phonepeTransaction.model.js"
import User from "../models/user.model.js"
import {
  createSdkOrder,
  checkOrderStatus,
  validateWebhookSignature,
} from "../utils/phonepe.util.js"

/**
 * Credits the wallet exactly once for a given transaction, no matter how
 * many times this gets called (webhook retries + manual verify hitting the
 * same order). This is the single choke point that actually moves money
 * into user.wallet — the iOS app never touches this directly.
 */
const settleTransaction = async (transaction, phonePeState, rawResponse) => {
  transaction.rawStatusResponse = rawResponse

  if (transaction.walletCredited) {
    // Already settled earlier — just keep status/audit trail fresh, don't re-credit.
    await transaction.save()
    return transaction
  }

  if (phonePeState === "COMPLETED") {
    const user = await User.findById(transaction.userId)
    if (user) {
      user.wallet = parseFloat((user.wallet + transaction.amount).toFixed(2))
      user.walletTransactions.push({
        amount: transaction.amount,
        type: "credit",
        description: `PhonePe wallet top-up (${transaction.merchantOrderId})`,
      })
      await user.save()
    }
    transaction.status = "COMPLETED"
    transaction.walletCredited = true
  } else if (phonePeState === "FAILED") {
    transaction.status = "FAILED"
  } else if (phonePeState === "CANCELLED") {
    transaction.status = "CANCELLED"
  } else {
    transaction.status = "PENDING"
  }

  await transaction.save()
  return transaction
}

/**
 * 1. POST /api/v1/phonepe/initiate
 *    iOS sends { amount } (rupees). We create a local PENDING record,
 *    ask PhonePe for an order token, and hand that token back to iOS
 *    so the PhonePe SDK can launch checkout. No money moves here.
 */
export const initiateTransaction = asyncHandler(async (req, res) => {
  const { amount } = req.body
  const userId = req.user._id

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json(new ApiError(400, "Invalid amount"))
  }

  const merchantOrderId = `WALLET_${userId}_${Date.now()}_${crypto
    .randomBytes(3)
    .toString("hex")}`
  const amountInPaise = Math.round(Number(amount) * 100)

  // Write PENDING record first — this is our source of truth even if the
  // PhonePe call below fails or times out.
  const transaction = await PhonePeTransaction.create({
    userId,
    merchantOrderId,
    amount: Number(amount),
    amountInPaise,
    status: "PENDING",
  })

  try {
    const order = await createSdkOrder({ merchantOrderId, amountInPaise })

    transaction.phonepeOrderId = order.orderId
    transaction.rawStatusResponse = order
    await transaction.save()

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          merchantOrderId,
          orderId: order.orderId,
          token: order.token, // hand this to the PhonePe iOS SDK
          expireAt: order.expireAt,
        },
        "Order created",
      ),
    )
  } catch (error) {
    transaction.status = "FAILED"
    transaction.rawStatusResponse = error?.response?.data || {
      message: error.message,
    }
    await transaction.save()
    console.error(
      "PhonePe create order failed:",
      error?.response?.data || error.message,
    )
    return res
      .status(502)
      .json(new ApiError(502, "Failed to create PhonePe order"))
  }
})

/**
 * 2. GET /api/v1/phonepe/verify/:merchantOrderId
 *    Called by iOS after the SDK checkout screen closes. We DO NOT trust
 *    whatever iOS claims happened — we call PhonePe's status API ourselves
 *    and settle based on that response only.
 */
export const verifyTransaction = asyncHandler(async (req, res) => {
  const { merchantOrderId } = req.params
  const userId = req.user._id

  const transaction = await PhonePeTransaction.findOne({
    merchantOrderId,
    userId,
  })
  if (!transaction) {
    return res.status(404).json(new ApiError(404, "Transaction not found"))
  }

  if (transaction.walletCredited) {
    return res
      .status(200)
      .json(new ApiResponse(200, transaction, "Already settled"))
  }

  try {
    const statusResponse = await checkOrderStatus(merchantOrderId)
    const updated = await settleTransaction(
      transaction,
      statusResponse.state,
      statusResponse,
    )
    return res.status(200).json(new ApiResponse(200, updated, "Status synced"))
  } catch (error) {
    console.error(
      "PhonePe status check failed:",
      error?.response?.data || error.message,
    )
    return res
      .status(502)
      .json(new ApiError(502, "Failed to fetch payment status"))
  }
})

/**
 * 3. POST /api/v1/phonepe/webhook
 *    PhonePe calls this server-to-server when an order reaches a terminal
 *    state. Deliberately NOT behind verifyJWT (PhonePe has no user JWT to
 *    send) — instead it's protected by validateWebhookSignature below.
 *    Must ack 200 within 5s or PhonePe retries up to 3 times.
 */
export const phonepeWebhook = async (req, res) => {
  try {
    const authorizationHeader = req.headers["authorization"]

    if (!validateWebhookSignature(authorizationHeader)) {
      console.warn("PhonePe webhook: signature mismatch, rejecting")
      return res
        .status(401)
        .json({ status: "error", message: "Invalid signature" })
    }

    const payload = req.body
    const data = payload.payload || payload.data || payload
    const merchantOrderId = data.merchantOrderId || data.merchantTransactionId
    const state = data.state || data.paymentState

    if (!merchantOrderId) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing merchantOrderId" })
    }

    const transaction = await PhonePeTransaction.findOne({ merchantOrderId })
    if (!transaction) {
      // Unknown order — ack anyway so PhonePe stops retrying it at us.
      return res.status(200).json({ status: "ok" })
    }

    await settleTransaction(transaction, state, payload)

    return res.status(200).json({ status: "ok" })
  } catch (error) {
    console.error("PhonePe webhook error:", error.message)
    // Ack regardless so a transient bug on our side doesn't trigger a
    // pointless retry storm; the failure is logged for investigation, and
    // verifyTransaction remains available as the fallback reconciliation path.
    return res.status(200).json({ status: "ok" })
  }
}

/**
 * 4. GET /api/v1/phonepe/transactions
 *    List the logged-in user's own PhonePe transactions with filters.
 *    Query params: status, from, to, page, limit
 */
export const listTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { status, from, to, page = 1, limit = 10 } = req.query

  const filter = { userId }

  if (status) {
    filter.status = String(status).toUpperCase()
  }

  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = new Date(from)
    if (to) filter.createdAt.$lte = new Date(to)
  }

  const currentPage = parseInt(page)
  const perPage = parseInt(limit)
  const skip = (currentPage - 1) * perPage

  const [transactions, total] = await Promise.all([
    PhonePeTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage),
    PhonePeTransaction.countDocuments(filter),
  ])

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions,
        pagination: {
          page: currentPage,
          limit: perPage,
          totalPages: Math.ceil(total / perPage),
          totalTransactions: total,
        },
      },
      "success",
    ),
  )
})
