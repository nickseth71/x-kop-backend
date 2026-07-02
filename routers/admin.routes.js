import { Router } from "express";
import { addSettings, getSettings } from "./../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createUserRole } from "../controllers/userRole.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/admin/addSettings:
 *   post:
 *     summary: Add Settings
 *     description: Create or add new system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settingKey:
 *                 type: string
 *               settingValue:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/addSettings").post(verifyJWT, addSettings);

/**
 * @swagger
 * /api/v1/admin/getSettings:
 *   get:
 *     summary: Get Settings
 *     description: Retrieve all system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/getSettings").get(verifyJWT, getSettings);

/**
 * @swagger
 * /api/v1/admin/create-user-role:
 *   post:
 *     summary: Create User Role
 *     description: Create a new user role with specific permissions
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User role created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route("/create-user-role").post(createUserRole);

export default router;



