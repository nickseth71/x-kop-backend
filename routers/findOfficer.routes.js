import express from 'express';
import { findOfficer } from './../controllers/findOfficerController.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/findOfficer/getOfficer:
 *   get:
 *     summary: Find Available Officer
 *     description: Search for available officers based on filters
 *     tags: [FindOfficer]
 *     parameters:
 *       - name: consultationType
 *         in: query
 *         type: string
 *         description: Type of consultation required
 *       - name: date
 *         in: query
 *         type: string
 *         format: date
 *         description: Preferred date for consultation
 *       - name: time
 *         in: query
 *         type: string
 *         description: Preferred time for consultation
 *     responses:
 *       200:
 *         description: Available officers found
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.route('/getOfficer').get(findOfficer);

export default router;
