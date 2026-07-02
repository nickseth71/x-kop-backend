import { Router } from "express";
import {
  signInUser,
  signUpUser,
  refreshAccessToken,
  verifyPhoneOtp,
  logoutUser,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserDetailsAdmin,
  getAllUser,
  updateWallet,
  GetSingleUser,
  updateOfficerIdProofDoc
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import configureUploadMiddleware from "../helper/index.js";

const router = Router();

const { singleFileUpload, multipleFileUpload } = configureUploadMiddleware();

/**
 * @swagger
 * /api/v1/users/signin:
 *   post:
 *     summary: User Sign In
 *     description: Authenticate user with credentials and obtain access token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User signed in successfully
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.route("/signin").post(signInUser);

/**
 * @swagger
 * /api/v1/users/signup:
 *   post:
 *     summary: User Sign Up
 *     description: Create a new user account with phone number and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User account created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route("/signup").post(signUpUser);

/**
 * @swagger
 * /api/v1/users/verify:
 *   post:
 *     summary: Verify Phone OTP
 *     description: Verify OTP sent to user's phone number
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */
router.route("/verify").post(verifyPhoneOtp);

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     description: Generate a new access token using refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Unauthorized - Invalid refresh token
 *       500:
 *         description: Server error
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: User Logout
 *     description: Logout the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /api/v1/users/current-user:
 *   get:
 *     summary: Get Current User
 *     description: Retrieve the profile information of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /api/v1/users/get-all-user:
 *   get:
 *     summary: Get All Users
 *     description: Retrieve list of all users in the system
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/get-all-user").get(verifyJWT, getAllUser);

/**
 * @swagger
 * /api/v1/users/update-account:
 *   patch:
 *     summary: Update Account Details
 *     description: Update the authenticated user's account information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account details updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

/**
 * @swagger
 * /api/v1/users/update-user:
 *   patch:
 *     summary: Update User Details by Admin
 *     description: Update user details with admin privileges
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User details updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/update-user").patch(verifyJWT, updateUserDetailsAdmin);

/**
 * @swagger
 * /api/v1/users/wallet:
 *   post:
 *     summary: Update User Wallet
 *     description: Update the wallet balance for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               transactionType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/wallet").post(verifyJWT, updateWallet);

/**
 * @swagger
 * /api/v1/users/singleUser/{id}:
 *   get:
 *     summary: Get Single User
 *     description: Retrieve details of a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.route("/singleUser/:id").get(verifyJWT, GetSingleUser);

/**
 * @swagger
 * /api/v1/users/uploadIdProofDoc:
 *   patch:
 *     summary: Upload ID Proof Document
 *     description: Upload ID proof documents for officer verification
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idProof:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/uploadIdProofDoc").patch(verifyJWT, multipleFileUpload, updateOfficerIdProofDoc);

/**
 * @swagger
 * /api/v1/users/avatar:
 *   patch:
 *     summary: Update User Avatar
 *     description: Upload and update user profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/avatar").patch(verifyJWT, singleFileUpload, updateUserAvatar);

export default router;



