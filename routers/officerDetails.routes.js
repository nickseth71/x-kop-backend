import express from "express";
import {
  createOfficerDetails,
  getAllOfficerDetails,
  getOfficerDetailsById,
  updateOfficerDetails,
  deleteOfficerDetails,
  updateOfficerType,
  getOfficerDetailsByOfficerId,
} from "./../controllers/officerDetails.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/officerDetails/officerDetails:
 *   get:
 *     summary: Get All Officer Details
 *     description: Retrieve details of all officers
 *     tags: [OfficerDetails]
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
 *         description: Officer details retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/officerDetails", verifyJWT, getAllOfficerDetails);

/**
 * @swagger
 * /api/v1/officerDetails/officerDetails/{id}:
 *   get:
 *     summary: Get Officer Details by ID
 *     description: Retrieve details of a specific officer
 *     tags: [OfficerDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Officer ID
 *     responses:
 *       200:
 *         description: Officer details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Officer not found
 *       500:
 *         description: Server error
 */
router.get("/officerDetails/:id", verifyJWT, getOfficerDetailsById);

/**
 * @swagger
 * /api/v1/officerDetails/officerDetails/byOfficer/{officerId}:
 *   get:
 *     summary: Get Officer Details by Officer ID
 *     description: Retrieve officer profile details by officer ID
 *     tags: [OfficerDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: officerId
 *         in: path
 *         required: true
 *         type: string
 *         description: Officer User ID
 *     responses:
 *       200:
 *         description: Officer details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Officer not found
 *       500:
 *         description: Server error
 */
router.get(
  "/officerDetails/byOfficer/:officerId",
  verifyJWT,
  getOfficerDetailsByOfficerId
);

/**
 * @swagger
 * /api/v1/officerDetails/officerDetails/{id}:
 *   put:
 *     summary: Update Officer Details
 *     description: Update information for a specific officer
 *     tags: [OfficerDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Officer Details ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: integer
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Officer details updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Officer not found
 *       500:
 *         description: Server error
 */
router.put("/officerDetails/:id", verifyJWT, updateOfficerDetails);

/**
 * @swagger
 * /api/v1/officerDetails/officerDetails/{id}:
 *   delete:
 *     summary: Delete Officer Details
 *     description: Delete officer profile details
 *     tags: [OfficerDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Officer Details ID
 *     responses:
 *       200:
 *         description: Officer details deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Officer not found
 *       500:
 *         description: Server error
 */
router.delete("/officerDetails/:id", verifyJWT, deleteOfficerDetails);

/**
 * @swagger
 * /api/v1/officerDetails/officerDetails/type:
 *   put:
 *     summary: Update Officer Type
 *     description: Update the officer type or role classification
 *     tags: [OfficerDetails]
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
 *               officerType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Officer type updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Officer not found
 *       500:
 *         description: Server error
 */
router.put("/officerDetails/type", verifyJWT, updateOfficerType);

export default router;
