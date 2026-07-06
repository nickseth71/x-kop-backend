import express from 'express';
import { findOfficer } from './../controllers/findOfficerController.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/officerFind/getOfficer:
 *   get:
 *     summary: Find Available Officer
 *     description: Search for available officers based on filters
 *     tags: [FindOfficer]
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
