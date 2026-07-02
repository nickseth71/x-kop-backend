import { Router } from "express";
import { getPaymentDetailUser, phonePePayment, storeUserInfo, transactionDownload } from "../controllers/consultationPaymentDetails.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/consultationPaymentDetails/callback:
 *   post:
 *     summary: Payment Callback Handler
 *     description: Handle payment callback from PhonePe payment gateway
 *     tags: [ConsultationPaymentDetails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 */
router.route("/callback").all(phonePePayment);

/**
 * @swagger
 * /api/v1/consultationPaymentDetails/store-user-info:
 *   post:
 *     summary: Store User Payment Information
 *     description: Store user payment information for consultation
 *     tags: [ConsultationPaymentDetails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               consultationId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: User payment information stored successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route('/store-user-info').post(storeUserInfo);

/**
 * @swagger
 * /api/v1/consultationPaymentDetails/download/{transaction_id}:
 *   get:
 *     summary: Download Transaction Receipt
 *     description: Download transaction receipt for a specific transaction
 *     tags: [ConsultationPaymentDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transaction_id
 *         in: path
 *         required: true
 *         type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Receipt downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.route('/download/:transaction_id').get(verifyJWT, transactionDownload);

/**
 * @swagger
 * /api/v1/consultationPaymentDetails/getbankPayment:
 *   get:
 *     summary: Get Payment Details
 *     description: Retrieve payment details for the authenticated user
 *     tags: [ConsultationPaymentDetails]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment details not found
 *       500:
 *         description: Server error
 */
router.route('/getbankPayment').get(verifyJWT, getPaymentDetailUser);

export default router;
