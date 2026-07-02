import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getConsultaionHistoryByDate, getConsultaionHistoryPaginatedList } from "../controllers/Consultaion.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/consultations/get-consultation-by-date:
 *   post:
 *     summary: Get Consultation History by Date
 *     description: Retrieve consultation records filtered by date
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               officerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consultation history retrieved
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/get-consultation-by-date').post(verifyJWT, getConsultaionHistoryByDate);

/**
 * @swagger
 * /api/v1/consultations/consultList:
 *   get:
 *     summary: Get Consultation List with Pagination
 *     description: Retrieve paginated list of consultations
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         type: integer
 *       - name: limit
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: Consultation list retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/consultList').get(verifyJWT, getConsultaionHistoryPaginatedList);

export default router;