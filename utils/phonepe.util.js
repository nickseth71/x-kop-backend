import axios from "axios"
import crypto from "crypto"

/**
 * PhonePe PG v2 (OAuth-based / "Standard Checkout") integration helper.
 *
 * Required env vars (see .env.example section in the README):
 *   PHONEPE_ENV                 = "SANDBOX" | "PRODUCTION"
 *   PHONEPE_CLIENT_ID           = from PhonePe Business Dashboard -> Developer Settings
 *   PHONEPE_CLIENT_SECRET       = from PhonePe Business Dashboard -> Developer Settings
 *   PHONEPE_CLIENT_VERSION      = usually "1"
 *   PHONEPE_WEBHOOK_USERNAME    = username YOU set on the PhonePe dashboard for webhooks
 *   PHONEPE_WEBHOOK_PASSWORD    = password YOU set on the PhonePe dashboard for webhooks
 */

const isProd = process.env.PHONEPE_ENV === "PRODUCTION"

// OAuth token endpoint base
const AUTH_BASE_URL = isProd
  ? "https://api.phonepe.com/apis/identity-manager"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox"

// Payment Gateway API base (create order / status)
const PG_BASE_URL = isProd
  ? "https://api.phonepe.com/apis/pg"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox"

// Simple in-memory token cache (fine for a single-instance/Render deployment;
// move to Redis if you ever run multiple instances).
let cachedToken = null
let cachedTokenExpiry = 0 // epoch seconds

/**
 * Fetch (and cache) an OAuth access token from PhonePe.
 * Refreshes 5 minutes before actual expiry, as PhonePe recommends.
 */
export const getAuthToken = async () => {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedTokenExpiry - now > 300) {
    return cachedToken
  }

  const params = new URLSearchParams()
  params.append("client_id", process.env.PHONEPE_CLIENT_ID)
  params.append("client_version", process.env.PHONEPE_CLIENT_VERSION || "1")
  params.append("client_secret", process.env.PHONEPE_CLIENT_SECRET)
  params.append("grant_type", "client_credentials")

  const { data } = await axios.post(`${AUTH_BASE_URL}/v1/oauth/token`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })

  cachedToken = data.access_token
  // PhonePe returns expires_at (epoch seconds) on some flows; fall back to expires_in.
  cachedTokenExpiry = data.expires_at || now + (data.expires_in || 3300)

  return cachedToken
}

/**
 * Create an order and get back the SDK token that gets handed to the
 * PhonePe iOS/Android SDK to actually launch the checkout screen.
 */
export const createSdkOrder = async ({
  merchantOrderId,
  amountInPaise,
  redirectUrl,
}) => {
  const token = await getAuthToken()

  const { data } = await axios.post(
    `${PG_BASE_URL}/payments/v2/sdk/order`,
    {
      merchantOrderId,
      amount: amountInPaise,
      paymentFlow: { type: "PG" },
      ...(redirectUrl ? { redirectUrl } : {}),
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    },
  )

  // { orderId, state, expireAt, token }
  return data
}

/**
 * Server-to-server status check — the ONLY thing that should be trusted
 * to decide whether a payment actually succeeded.
 */
export const checkOrderStatus = async (merchantOrderId) => {
  const token = await getAuthToken()

  const { data } = await axios.get(
    `${PG_BASE_URL}/checkout/v2/order/${merchantOrderId}/status`,
    {
      params: { details: false, errorContext: true },
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    },
  )

  // { orderId, state: "PENDING"|"COMPLETED"|"FAILED", amount, ... }
  return data
}

/**
 * Validate the Authorization header PhonePe sends on webhook calls.
 * PhonePe v2 webhooks use a username/password pair YOU configure on the
 * dashboard; the header value they send is SHA256("username:password") hex.
 * We recompute it and compare — this is what makes the webhook trustworthy
 * instead of blindly accepting whatever hits the endpoint.
 */
export const validateWebhookSignature = (authorizationHeader) => {
  const username = process.env.PHONEPE_WEBHOOK_USERNAME
  const password = process.env.PHONEPE_WEBHOOK_PASSWORD

  if (!username || !password || !authorizationHeader) return false

  const expected = crypto
    .createHash("sha256")
    .update(`${username}:${password}`)
    .digest("hex")

  // constant-time compare to avoid timing attacks
  const a = Buffer.from(expected)
  const b = Buffer.from(authorizationHeader)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
