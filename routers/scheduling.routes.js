import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createSchedule, deleteSchedule, getScheduleById, getSchedules, getScheduleOfficerList, updateSchedule, findRandomOfficer, getScheduleByDateOfficer, getScheduleAllOnlyCustomer } from "../controllers/scheduling.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/officer_schedule/find-officer:
 *   post:
 *     summary: Find Random Officer
 *     description: Find an available officer based on consultation type and date
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consultationType:
 *                 type: string
 *               preferredDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Officer found successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/find-officer").post(verifyJWT, findRandomOfficer);

/**
 * @swagger
 * /api/v1/officer_schedule/schedules:
 *   post:
 *     summary: Create Schedule
 *     description: Create a new consultation schedule
 *     tags: [Scheduling]
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
 *               customerId:
 *                 type: string
 *               consultationType:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Schedule created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/schedules").post(verifyJWT, createSchedule);

/**
 * @swagger
 * /api/v1/officer_schedule/schedules:
 *   get:
 *     summary: Get All Schedules
 *     description: Retrieve all consultation schedules
 *     tags: [Scheduling]
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
 *         description: Schedules retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/schedules').get(verifyJWT, getSchedules);

/**
 * @swagger
 * /api/v1/officer_schedule/schedules/{id}:
 *   get:
 *     summary: Get Schedule by ID
 *     description: Retrieve a specific schedule by ID
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.route('/schedules/:id').get(verifyJWT, getScheduleById);

/**
 * @swagger
 * /api/v1/officer_schedule/schedules/{id}:
 *   put:
 *     summary: Update Schedule
 *     description: Update an existing consultation schedule
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.route('/schedules/:id').put(verifyJWT, updateSchedule);

/**
 * @swagger
 * /api/v1/officer_schedule/schedules/{id}:
 *   delete:
 *     summary: Delete Schedule
 *     description: Delete a consultation schedule
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.route('/schedules/:id').delete(verifyJWT, deleteSchedule);

/**
 * @swagger
 * /api/v1/officer_schedule/schedule-officer-find:
 *   post:
 *     summary: Get Schedule by Date and Officer
 *     description: Retrieve schedules for a specific officer on a given date
 *     tags: [Scheduling]
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
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Officer schedules retrieved
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/schedule-officer-find').post(verifyJWT, getScheduleByDateOfficer);

/**
 * @swagger
 * /api/v1/officer_schedule/schedule-customer:
 *   get:
 *     summary: Get Customer Schedules Only
 *     description: Retrieve all schedules for the authenticated customer
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer schedules retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/schedule-customer').get(verifyJWT, getScheduleAllOnlyCustomer);

/**
 * @swagger
 * /api/v1/officer_schedule/getSchedule-officer-list:
 *   get:
 *     summary: Get Officer Schedule List
 *     description: Retrieve schedule list for officers
 *     tags: [Scheduling]
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
 *         description: Officer schedule list retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/getSchedule-officer-list').get(verifyJWT, getScheduleOfficerList);

export default router;
