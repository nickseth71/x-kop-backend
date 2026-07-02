import { createChat, sendMessage, deleteMessage, editMessage, uploadMessageData, getConversationChatsPagination, getConversation, updateChatDetails, getSingleConversation, uploadMediaData } from "./../controllers/chat.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import configureUploadMiddleware from "../helper/index.js";

const router = Router();
const { singleFileUpload, multipleFileUpload } = configureUploadMiddleware();

/**
 * @swagger
 * /api/v1/chats:
 *   post:
 *     summary: Create Chat
 *     description: Create a new chat conversation
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route('/chats').post(createChat);

/**
 * @swagger
 * /api/v1/chats/messages:
 *   post:
 *     summary: Send Message
 *     description: Send a message in a chat conversation
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               messageText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route('/messages').post(sendMessage);

/**
 * @swagger
 * /api/v1/chats/get:
 *   get:
 *     summary: Get Conversation Chats with Pagination
 *     description: Retrieve chat messages with pagination support
 *     tags: [Chat]
 *     parameters:
 *       - name: page
 *         in: query
 *         type: integer
 *       - name: limit
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: Chat messages retrieved
 *       500:
 *         description: Server error
 */
router.route('/get').get(getConversationChatsPagination);

/**
 * @swagger
 * /api/v1/chats/messages:
 *   delete:
 *     summary: Delete Message
 *     description: Delete a specific message from chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route('/messages').delete(deleteMessage);

/**
 * @swagger
 * /api/v1/chats/messages:
 *   put:
 *     summary: Edit Message
 *     description: Edit an existing chat message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               newMessageText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message edited successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.route('/messages').put(editMessage);

/**
 * @swagger
 * /api/v1/chats/uploadChat:
 *   post:
 *     summary: Upload Chat Message with Files
 *     description: Upload files and send as message in chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Message with files uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/uploadChat").post(verifyJWT, multipleFileUpload, uploadMessageData);

/**
 * @swagger
 * /api/v1/chats/uploadMedia:
 *   post:
 *     summary: Upload Media to Chat
 *     description: Upload media files (images, videos) to chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/uploadMedia").post(verifyJWT, multipleFileUpload, uploadMediaData);

/**
 * @swagger
 * /api/v1/chats/conversations:
 *   get:
 *     summary: Get All Conversations
 *     description: Retrieve all active conversations for the user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/conversations").get(verifyJWT, getConversation);

/**
 * @swagger
 * /api/v1/chats/chat-update/{chatId}:
 *   put:
 *     summary: Update Chat Details
 *     description: Update chat conversation details
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat details updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.route("/chat-update/:chatId").put(verifyJWT, updateChatDetails);

/**
 * @swagger
 * /api/v1/chats/singleConversation/{chatId}:
 *   get:
 *     summary: Get Single Conversation
 *     description: Retrieve a specific chat conversation with all messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Conversation retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.route("/singleConversation/:chatId").get(verifyJWT, getSingleConversation);

export default router;