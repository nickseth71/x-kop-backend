import { Router } from "express";
import { createConsultationType, getConsultationType, updateConsultationType, deleteConsultationType, getConsultationTypeById } from "../controllers/consultationType.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/consultationType/createConsultationType:
 *   post:
 *     summary: Create Consultation Type
 *     description: Create a new consultation type
 *     tags: [ConsultationType]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consultation type created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/createConsultationType").post(verifyJWT, createConsultationType);

/**
 * @swagger
 * /api/v1/consultationType/getConsultationType:
 *   get:
 *     summary: Get All Consultation Types
 *     description: Retrieve all available consultation types
 *     tags: [ConsultationType]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consultation types retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/getConsultationType").get(verifyJWT, getConsultationType);

/**
 * @swagger
 * /api/v1/consultationType/getConsultationType/{id}:
 *   get:
 *     summary: Get Consultation Type by ID
 *     description: Retrieve a specific consultation type by ID
 *     tags: [ConsultationType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Consultation Type ID
 *     responses:
 *       200:
 *         description: Consultation type retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Consultation type not found
 *       500:
 *         description: Server error
 */
router.route("/getConsultationType/:id").get(verifyJWT, getConsultationTypeById);

/**
 * @swagger
 * /api/v1/consultationType/updateConsultationType/{id}:
 *   put:
 *     summary: Update Consultation Type
 *     description: Update an existing consultation type
 *     tags: [ConsultationType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Consultation Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consultation type updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Consultation type not found
 *       500:
 *         description: Server error
 */
router.route("/updateConsultationType/:id").put(verifyJWT, updateConsultationType);

/**
 * @swagger
 * /api/v1/consultationType/deleteConsultationType/{id}:
 *   delete:
 *     summary: Delete Consultation Type
 *     description: Delete a consultation type
 *     tags: [ConsultationType]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Consultation Type ID
 *     responses:
 *       200:
 *         description: Consultation type deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Consultation type not found
 *       500:
 *         description: Server error
 */
router.route("/deleteConsultationType/:id").delete(verifyJWT, deleteConsultationType);

export default router;