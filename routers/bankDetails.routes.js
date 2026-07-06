import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOrUpdateBankDetails, deleteBankDetails, getBankDetails } from "../controllers/bankDetails.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/bank/createUpdateBankDetails:
 *   post:
 *     summary: Create or Update Bank Details
 *     description: Create new bank details or update existing bank account information
 *     tags: [BankDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountHolderName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               bankName:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bank details created/updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/createUpdateBankDetails', verifyJWT, createOrUpdateBankDetails);

/**
 * @swagger
 * /api/v1/bank/deleteBankDetails:
 *   delete:
 *     summary: Delete Bank Details
 *     description: Delete bank account details
 *     tags: [BankDetails]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank details not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteBankDetails', verifyJWT, deleteBankDetails);

/**
 * @swagger
 * /api/v1/bank/getBankDetails:
 *   get:
 *     summary: Get Bank Details
 *     description: Retrieve bank account details for the authenticated user
 *     tags: [BankDetails]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank details not found
 *       500:
 *         description: Server error
 */
router.get("/getBankDetails", verifyJWT, getBankDetails);

export default router;