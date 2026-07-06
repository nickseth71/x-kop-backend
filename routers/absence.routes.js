import express from 'express';
import { createAbsence, getAllAbsences, getAbsenceById, updateAbsence, deleteAbsence } from './../controllers/absence.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/officer-available/absences:
 *   post:
 *     summary: Create Absence Record
 *     description: Create a new absence record for an officer
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               officerId:
 *                 type: string
 *               reason:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Absence record created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/absences').post(verifyJWT, createAbsence);

/**
 * @swagger
 * /api/v1/officer-available/absences:
 *   get:
 *     summary: Get All Absences
 *     description: Retrieve all absence records with pagination
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of absences retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/absences').get(verifyJWT, getAllAbsences);

/**
 * @swagger
 * /api/v1/officer-available/absences/{id}:
 *   get:
 *     summary: Get Absence by ID
 *     description: Retrieve a specific absence record by ID
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Absence ID
 *     responses:
 *       200:
 *         description: Absence record retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Absence not found
 *       500:
 *         description: Server error
 */
router.route('/absences/:id').get(verifyJWT, getAbsenceById);

/**
 * @swagger
 * /api/v1/officer-available/absences/{id}:
 *   put:
 *     summary: Update Absence Record
 *     description: Update an existing absence record
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Absence ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Absence record updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Absence not found
 *       500:
 *         description: Server error
 */
router.route('/absences/:id').put(verifyJWT, updateAbsence);

/**
 * @swagger
 * /api/v1/officer-available/absences/{id}:
 *   delete:
 *     summary: Delete Absence Record
 *     description: Delete an absence record
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Absence ID
 *     responses:
 *       200:
 *         description: Absence record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Absence not found
 *       500:
 *         description: Server error
 */
router.route('/absences/:id').delete(verifyJWT, deleteAbsence);

export default router;
