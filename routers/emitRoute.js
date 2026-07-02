// // routes/emitRoute.js
// import express from "express";
// import { getWebsocketNamespace } from "../socketServer.js";
// const router = express.Router();

// router.post("/reject-call", async (req, res) => {
//   const { userId, callerId, callId, reason } = req.body;

//   const namespace = getWebsocketNamespace();
//   if (!namespace)
//     return res.status(500).json({ error: "WebSocket not initialized" });
//   if (!userId || !callId || !callerId)
//     return res.status(400).json({ error: "Missing fields" });

//   const sockets = await namespace.in(callerId).fetchSockets();
//   console.log(`Found ${sockets.length} socket(s) for callerId: ${callerId}`);

//   namespace.to(callerId).emit("handsup", {
//     type: "call_reject",
//     otherUserId: userId,
//     callId,
//     reason: reason || "User rejected the call",
//   });

//   console.log(`Call rejection emitted to ${callerId} for call ${callId}`);
//   return res.status(200).json({ message: `Call rejected event emitted` });
// });

// export default router;



// import express from "express";
// import { getWebsocketNamespace } from "../socketServer.js";
// import User from "../models/user.model.js";
// import Consultation from "../models/Consultation.model.js";

// const router = express.Router();

// router.post("/reject-call", async (req, res) => {
//   const { userId, callerId, callId, reason } = req.body;

//   if (!userId || !callerId || !callId) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   const namespace = getWebsocketNamespace();
//   if (!namespace) {
//     return res.status(500).json({ error: "WebSocket not initialized" });
//   }

//   try {
//     // Emit to caller that the call was rejected
//     namespace.to(callerId).emit("handsup", {
//       type: "call_reject",
//       otherUserId: userId,
//       callId,
//       reason: reason || "User rejected the call",
//     });

//     console.log(`Emitted call_reject to ${callerId}`);

//     // Optional: clean-up consultation if any
//     const user = await User.findOne({ mobile: userId });
//     if (user?.currentConsult && !user.isCalling) {
//       await Consultation.findByIdAndUpdate(
//         user.currentConsult,
//         {
//           status: "completed",
//           endCallTime: new Date().toISOString(),
//         },
//         { new: true }
//       );
//     }

//     return res.status(200).json({ message: "Call rejected and event emitted" });
//   } catch (error) {
//     console.error("Reject call error:", error);
//     return res.status(500).json({ error: "Failed to reject call" });
//   }
// });

// export default router;



import express from "express";
import { getWebsocketNamespace } from "../socketServer.js";
import User from "../models/user.model.js";
import Consultation from "../models/Consultation.model.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/reject-call:
 *   post:
 *     summary: Reject Call
 *     description: Reject an incoming consultation call and notify the caller
 *     tags: [Emit]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user rejecting the call
 *               callerId:
 *                 type: string
 *                 description: ID of the user who initiated the call
 *               callId:
 *                 type: string
 *                 description: Unique call identifier
 *               reason:
 *                 type: string
 *                 description: Reason for rejecting the call
 *     responses:
 *       200:
 *         description: Call rejection event emitted successfully
 *       400:
 *         description: Missing required fields (userId, callerId, callId)
 *       500:
 *         description: Server error or WebSocket not initialized
 */
router.post("/reject-call", async (req, res) => {
  const { userId, callerId, callId, reason } = req.body;

  if (!userId || !callerId || !callId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const namespace = getWebsocketNamespace();
  if (!namespace) {
    return res.status(500).json({ error: "WebSocket not initialized" });
  }

  try {
    // Emit "call_reject" event to the caller
    namespace.to(callerId).emit("handsup", {
      type: "call_reject",
      otherUserId: userId,
      callId,
      reason: reason || "User rejected the call",
    });

    // Also emit "appyHandsup" to notify both sides
    namespace.to(callerId).emit("appyHandsup", { status: true, type: "any" });
    namespace.to(userId).emit("appyHandsup", { status: true, type: "call_reject" });

    console.log(`Emitted call_reject and appyHandsup to ${callerId} and ${userId}`);

    // Optional: Clean-up consultation
    const user = await User.findOne({ mobile: userId });
    if (user?.currentConsult && user.isCalling === false) {
      await Consultation.findByIdAndUpdate(
        user.currentConsult,
        {
          status: "completed",
          endCallTime: new Date().toISOString(),
        },
        { new: true }
      );
    }

    return res.status(200).json({ message: "Call rejected and events emitted" });
  } catch (error) {
    console.error("Reject call error:", error);
    return res.status(500).json({ error: "Failed to reject call" });
  }
});

export default router;
