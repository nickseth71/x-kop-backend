import { Router } from "express";
import { createConsultationFeeType, getConsultationFeeType, deleteConsultationFeeType, updateConsultationFeeTypeStatus } from "../controllers/consultationFeeType.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/consultationFeeType/createConsultationFeeType:
 *   post:
 *     summary: Create Consultation Fee Type
 *     description: Create a new consultation fee type
 *     tags: [ConsultationFeeType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeTypeName:
 *                 type: string
 *               amount:
 *                 type: number
 *               duration:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Consultation fee type created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route("/createConsultationFeeType").post(createConsultationFeeType);

/**
 * @swagger
 * /api/v1/consultationFeeType/getConsultationFeeType:
 *   get:
 *     summary: Get Consultation Fee Types
 *     description: Retrieve all consultation fee types
 *     tags: [ConsultationFeeType]
 *     responses:
 *       200:
 *         description: Consultation fee types retrieved
 *       500:
 *         description: Server error
 */
router.route("/getConsultationFeeType").get(getConsultationFeeType);

/**
 * @swagger
 * /api/v1/consultationFeeType/updateConsultationFeeTypeStatus/{id}:
 *   put:
 *     summary: Update Consultation Fee Type Status
 *     description: Update the status of a consultation fee type
 *     tags: [ConsultationFeeType]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Fee Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Fee type status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Fee type not found
 *       500:
 *         description: Server error
 */
router.route("/updateConsultationFeeTypeStatus/:id").put(updateConsultationFeeTypeStatus);

/**
 * @swagger
 * /api/v1/consultationFeeType/deleteConsultationFeeType/{id}:
 *   delete:
 *     summary: Delete Consultation Fee Type
 *     description: Delete a consultation fee type
 *     tags: [ConsultationFeeType]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Fee Type ID
 *     responses:
 *       200:
 *         description: Fee type deleted successfully
 *       404:
 *         description: Fee type not found
 *       500:
 *         description: Server error
 */
router.route("/deleteConsultationFeeType/:id").delete(deleteConsultationFeeType);

export default router;