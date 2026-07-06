import dotenv from 'dotenv';
dotenv.config();
import { Router } from "express";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/v1/token/agora_token:
 *   post:
 *     summary: Generate Agora Token
 *     description: Generate a token for Agora RTC communication (audio/video calls)
 *     tags: [AgoraToken]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 description: User ID for Agora
 *               channelName:
 *                 type: string
 *                 description: Channel name for the call
 *     responses:
 *       200:
 *         description: Agora token generated successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             data:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 channelName:
 *                   type: string
 *                 uid:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/agora_token").post(verifyJWT, async (req, res) => {
  const { uid, channelName } = req.body;
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_CERTIFICATE;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log("AGORA_APPID:", appId);
    console.log("AGORA_CERTIFICATE:", appCertificate);
    console.log("Request UID:", uid);
    console.log("Request Channel Name:", channelName);

    const tokenA = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );
    return res.status(200).json({
      success: true,
      data: { token: tokenA, channelName, uid },
      message: "check data",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "check data" + error });
  }
});

export default router;
