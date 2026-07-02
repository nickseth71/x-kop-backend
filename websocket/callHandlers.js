
import { checkIsOnlineUser } from "./userStatusHandle.js";
import { sendPushNotificationCall } from "./../utils/pushNotificationCall.js";
import ConsultaionType from "../models/consultationType.model.js";
import Consultation from "../models/Consultation.model.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import SettingsModel from "../models/settings.model.js";
const ObjectId = mongoose.Types.ObjectId;

// Store active call timers
const activeCallTimers = new Map();

// Helper function to safely get user with defaults
const getUserWithDefaults = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    return {
      ...user.toObject(),
      freeMinutesUsed: user.freeMinutesUsed ?? 0,
      hasFreeMinutes: user.hasFreeMinutes ?? true,
      freeMinutesLimit: user.freeMinutesLimit ?? 15,
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Helper function to clear call timer
const clearCallTimer = (consultationId) => {
  const timer = activeCallTimers.get(consultationId);
  if (timer) {
    clearTimeout(timer);
    activeCallTimers.delete(consultationId);
    console.log(
      `⏰ [clearCallTimer] Timer cleared for consultation: ${consultationId}`
    );
  }
};

// Helper function to trigger auto-hangup
const triggerAutoHangup = async (
  io,
  consultationId,
  customerMobile,
  officerMobile
) => {
  try {
    console.log(
      `⏰ [AUTO-HANGUP] Free minutes expired for consultation: ${consultationId}`
    );

    // Emit hangup event to both users
    io.to(customerMobile).emit("freeMinutesExpired", {
      status: true,
      message: "Your free 15 minutes have been used",
      consultationId: consultationId,
    });

    io.to(officerMobile).emit("freeMinutesExpired", {
      status: true,
      message: "Customer's free minutes have been used",
      consultationId: consultationId,
    });

    // Trigger the handsup logic
    io.to(customerMobile).emit("appyHandsup", {
      status: true,
      type: "free_minutes_expired",
      autoHangup: true,
    });

    io.to(officerMobile).emit("appyHandsup", {
      status: true,
      type: "free_minutes_expired",
      autoHangup: true,
    });

    console.log(`✅ [AUTO-HANGUP] Hangup signals sent to both users`);

    // Clean up the timer
    clearCallTimer(consultationId);
  } catch (error) {
    console.error("❌ [AUTO-HANGUP] Error:", error);
  }
};

export const handleCallEvents = (socket, io) => {
  socket.on("call", async (data) => {
    try {
      console.log("📞 [call] Event triggered:", data);

      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      const userInfo = await User.findOne({ mobile: socket.user });
      if (!userInfo) {
        console.error("❌ [call] User not found:", socket.user);
        socket.emit("call_error", { message: "User not found" });
        return;
      }

      const receiverUser = await checkIsOnlineUser(calleeId);
      if (!receiverUser) {
        console.error("❌ [call] Receiver not found:", calleeId);
        socket.emit("call_error", { message: "Receiver not found" });
        return;
      }

      const customer = userInfo._id;
      const officer = receiverUser._id;
      let chatId = null;

      const existingChat = await Chat.findOne({
        participants: { $all: [customer, officer] },
      });

      if (!existingChat) {
        console.log("💬 [call] Creating new chat");
        const createChat = new Chat({
          participants: [customer, officer],
        });
        const res_chat = await createChat.save();
        chatId = res_chat._id;

        await User.findByIdAndUpdate(customer, {
          $addToSet: { chats: chatId },
        });
        await User.findByIdAndUpdate(officer, {
          $addToSet: { chats: chatId },
        });
      } else {
        chatId = existingChat._id;
        console.log("💬 [call] Using existing chat:", chatId);
      }

      const officerWithDetails = await User.findById(officer).populate({
        path: "officerDetails",
        strictPopulate: false,
        populate: {
          path: "ConsultationTypeID",
          model: "ConsultaionType",
          select: "ConsultationTypeName",
        },
      });

      const consultationTypeName =
        officerWithDetails?.officerDetails?.ConsultationTypeID
          ?.ConsultationTypeName || "General Consultation";

      const customerUser = await getUserWithDefaults(customer);
      const isFreeCall =
        customerUser &&
        customerUser.hasFreeMinutes &&
        customerUser.freeMinutesUsed < customerUser.freeMinutesLimit &&
        userInfo.userRoleId?.toString() === CUSTOMER_ROLE_ID;

      const freeMinutesRemaining = isFreeCall
        ? customerUser.freeMinutesLimit - customerUser.freeMinutesUsed
        : 0;

      console.log("💰 [call] Free call info:", {
        isFreeCall,
        freeMinutesRemaining,
      });

      if (receiverUser.isOnline) {
        console.log("✅ [call] Receiver is online, emitting newCall");
        socket.to(calleeId).emit("newCall", {
          callerId: socket.user,
          rtcMessage: rtcMessage,
          userInfo: userInfo,
          chatId: chatId,
          isFreeCall: isFreeCall,
          freeMinutesRemaining: freeMinutesRemaining,
          consultationTypeName: consultationTypeName,
        });
      } else {
        console.log("📤 [call] Receiver offline, sending push notification");

        const CUSTOMER_ROLE_ID = "66b46462e8b154c1f89d6699";
        const project =
          receiverUser.userRoleId?.toString() === CUSTOMER_ROLE_ID
            ? "customer"
            : "officer";

        const pushData = {
          callerId: socket.user,
          rtcMessage: rtcMessage,
          userInfo: {
            _id: userInfo._id.toString(),
            name: userInfo.name || "User",
            mobile: userInfo.mobile,
            profileImage: userInfo.profileImage || "",
          },
          consultationTypeName: consultationTypeName,
          chatId: chatId.toString(),
          isFreeCall: isFreeCall,
          freeMinutesRemaining: freeMinutesRemaining,
          type: "incoming_call",
          title: "Incoming Call",
          body: isFreeCall
            ? `${
                userInfo.name || "User"
              } is calling (Free: ${freeMinutesRemaining} min remaining)`
            : `${userInfo.name || "User"} is calling`,
          sound: "default",
          priority: "high",
          vibrate: true,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          channelId: "call_channel",
        };

        console.log("📤 [call] Sending push with project:", project);
        console.log("📦 [call] Push data:", JSON.stringify(pushData, null, 2));

        await sendPushNotificationCall(
          receiverUser.fcmToken,
          pushData,
          project
        );
      }
    } catch (error) {
      console.error("❌ [call] Error:", error);
      console.error("Stack trace:", error.stack);
      socket.emit("call_error", {
        message: "Failed to initiate call",
        error: error.message,
      });
    }
  });

  socket.on("syncCallDuration", async (data) => {
    try {
      console.log("⏱️ [syncCallDuration] Event triggered:", data);
      const calleeId = data.receiverUser;
      const callDuration = data.duration;
      socket.emit("updateCallDuration", { callDuration });
      socket.to(calleeId).emit("updateCallDuration", { callDuration });
    } catch (error) {
      console.error("❌ [syncCallDuration] Error:", error);
    }
  });

  socket.on("answerCall", async (data) => {
    try {
      console.log("📞 [answerCall] Event triggered:", data);

      let callerId = data.callerId;
      let rtcMessage = data.rtcMessage;
      let customer = data.customer;
      let officer = data.officer;
      let chatId = null;

      const customerUser = await getUserWithDefaults(customer);
      if (!customerUser) {
        console.error("❌ [answerCall] Customer not found:", customer);
        socket.emit("call_error", { message: "Customer not found" });
        return;
      }

      const isFreeCall =
        customerUser.hasFreeMinutes &&
        customerUser.freeMinutesUsed < customerUser.freeMinutesLimit;

      console.log("💰 [answerCall] Free call status:", {
        isFreeCall,
        hasFreeMinutes: customerUser.hasFreeMinutes,
        freeMinutesUsed: customerUser.freeMinutesUsed,
        freeMinutesLimit: customerUser.freeMinutesLimit,
      });

      const newCall = new Consultation({
        customer: new ObjectId(customer),
        officer: new ObjectId(officer),
        startCallTime: new Date().toISOString(),
        isFreeCall: isFreeCall,
        freeMinutesUsed: 0,
      });

      const savedCalling = await newCall.save();
      console.log("✅ [answerCall] Consultation created:", savedCalling._id);

      // **NEW: Set up auto-hangup timer for free calls**
      if (isFreeCall) {
        const freeMinutesRemaining =
          customerUser.freeMinutesLimit - customerUser.freeMinutesUsed;
        const timeoutMs = freeMinutesRemaining * 60 * 1000; // Convert minutes to milliseconds

        console.log(
          `⏰ [answerCall] Setting up auto-hangup timer for ${freeMinutesRemaining} minutes`
        );

        // Get mobile numbers for both users
        const customerDoc = await User.findById(customer).select("mobile");
        const officerDoc = await User.findById(officer).select("mobile");

        const timer = setTimeout(() => {
          triggerAutoHangup(
            io,
            savedCalling._id.toString(),
            customerDoc.mobile,
            officerDoc.mobile
          );
        }, timeoutMs);

        activeCallTimers.set(savedCalling._id.toString(), timer);
        console.log(
          `✅ [answerCall] Auto-hangup timer set for consultation: ${savedCalling._id}`
        );
      }

      const existingChat = await Chat.findOne({
        participants: { $all: [customer, officer] },
      });

      if (!existingChat) {
        console.log("💬 [answerCall] Creating new chat");
        const createChat = new Chat({
          participants: [customer, officer],
        });
        const res_chat = await createChat.save();
        chatId = res_chat._id;

        await User.findByIdAndUpdate(customer, {
          isCalling: true,
          currentConsult: savedCalling._id,
          $addToSet: { consultations: savedCalling._id, chats: res_chat._id },
        });

        await User.findByIdAndUpdate(officer, {
          isCalling: true,
          currentConsult: savedCalling._id,
          $addToSet: { consultations: savedCalling._id, chats: res_chat._id },
        });
      } else {
        chatId = existingChat._id;
        console.log("💬 [answerCall] Using existing chat:", chatId);

        await User.findByIdAndUpdate(customer, {
          isCalling: true,
          currentConsult: savedCalling._id,
          $addToSet: { consultations: savedCalling._id },
        });

        await User.findByIdAndUpdate(officer, {
          isCalling: true,
          currentConsult: savedCalling._id,
          $addToSet: { consultations: savedCalling._id },
        });
      }

      const officerWithDetails = await User.findById(officer).populate({
        path: "officerdetails",
        strictPopulate: false,
      });

      const freeMinutesRemaining = isFreeCall
        ? customerUser.freeMinutesLimit - customerUser.freeMinutesUsed
        : 0;

      console.log(
        `✅ [answerCall] Call answered by ${socket.user}. Customer: ${customer}, Officer: ${officer}, Chat: ${chatId}, Consultation: ${savedCalling._id}, Free: ${isFreeCall}, Remaining: ${freeMinutesRemaining}min`
      );

      const responseData = {
        callee: socket.user,
        rtcMessage: rtcMessage,
        userInfo: socket.userInfo,
        consultationData: newCall,
        chatId,
        isFreeCall: isFreeCall,
        freeMinutesRemaining: freeMinutesRemaining,
      };

      socket.to(callerId).emit("callAnswered", responseData);
      socket.emit("callAnswered", responseData);
    } catch (error) {
      console.error("❌ [answerCall] Error:", error);
      socket.emit("call_error", {
        message: "Failed to answer call",
        error: error.message,
      });
    }
  });

  socket.on("videocall", (data) => {
    try {
      console.log("📹 [videocall] Event triggered:", data);
      let calleeId = data.calleeId;
      socket.to(calleeId).emit("newVideoCall", {});
    } catch (error) {
      console.error("❌ [videocall] Error:", error);
    }
  });

  socket.on("VideoCallanswerCall", (data) => {
    try {
      console.log("📹 [VideoCallanswerCall] Event triggered:", data);
      let callerId = data.callerId;
      socket.to(callerId).emit("VideoCallAnswered", {});
    } catch (error) {
      console.error("❌ [VideoCallanswerCall] Error:", error);
    }
  });

  socket.on("handsup", async (data) => {
    try {
      console.log("✋ [handsup] Event triggered:", JSON.stringify(data));

      if (data?.type == "call_reject") {
        console.log("🚫 [handsup] Handling call rejection");
        socket
          .to(data.otherUserId)
          .emit("appyHandsup", { status: true, type: "any" });
        socket.emit("appyHandsup", { status: true, type: "call_reject" });
        return;
      }

      console.log("💼 [handsup] Processing wallet logic");

      let user = await User.findOne({ mobile: data.otherUserId });
      if (!user) {
        console.error("❌ [handsup] User not found:", data.otherUserId);
        return;
      }

      if (!user?.currentConsult) {
        console.error(
          "❌ [handsup] User currentConsult is null. Skipping wallet logic."
        );
        return;
      }

      // **NEW: Clear the auto-hangup timer when call ends manually**
      clearCallTimer(user.currentConsult.toString());

      if (user?.isCalling == false) {
        console.log(
          "ℹ️ [handsup] User not in calling state, updating consultation"
        );
        const consultation = await Consultation.findById(user.currentConsult);
        if (consultation) {
          await Consultation.findByIdAndUpdate(
            user.currentConsult,
            {
              status: "completed",
              endCallTime: new Date().toISOString(),
            },
            { new: true }
          );
        }
        return;
      }

      let callFetch = await Consultation.findByIdAndUpdate(
        user.currentConsult,
        { status: "completed", endCallTime: new Date().toISOString() },
        { new: true }
      );

      if (!callFetch) {
        console.error(
          "❌ [handsup] Consultation not found:",
          user.currentConsult
        );
        return;
      }

      if (!callFetch?.startCallTime) {
        console.log(
          "ℹ️ [handsup] Call was never started, skipping wallet deduction."
        );
        return;
      }

      const officerType = await User.findById(callFetch.officer)
        .select("_id officerDetails wallet")
        .populate({
          path: "officerDetails",
          strictPopulate: false,
          select: "JobTitle OfficerCode EmergencyContact ConsultationTypeID",
          populate: {
            path: "ConsultationTypeID",
            model: "ConsultaionType",
            select: "ConsultationTypeName FeePerMinute",
          },
        });

      if (!officerType) {
        console.error("❌ [handsup] Officer not found:", callFetch.officer);
        return;
      }

      const userCustomer = await getUserWithDefaults(callFetch.customer);
      if (!userCustomer) {
        console.error("❌ [handsup] Customer not found:", callFetch.customer);
        return;
      }

      const startCallTime = new Date(callFetch.startCallTime);
      const endCallTime = new Date(callFetch.endCallTime);
      const timeDifference = endCallTime - startCallTime;
      const totalSeconds = timeDifference / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const exactDurationInMinutes = minutes + seconds / 60;

      console.log("⏱️ [handsup] Call duration:", {
        startCallTime,
        endCallTime,
        timeDifference,
        totalSeconds,
        minutes,
        seconds,
        exactDurationInMinutes,
      });

      const feePerMinute = parseFloat(
        officerType.officerDetails?.ConsultationTypeID?.FeePerMinute || 0
      );
      console.log("💵 [handsup] Fee per minute:", feePerMinute);

      let freeMinutesApplied = 0;
      let paidMinutes = 0;
      let detectPrice = 0;

      if (callFetch.isFreeCall && userCustomer.hasFreeMinutes) {
        const remainingFreeMinutes =
          userCustomer.freeMinutesLimit - userCustomer.freeMinutesUsed;

        console.log("🎁 [handsup] Processing free call:", {
          remainingFreeMinutes,
          exactDurationInMinutes,
          freeMinutesUsed: userCustomer.freeMinutesUsed,
          freeMinutesLimit: userCustomer.freeMinutesLimit,
        });

        if (exactDurationInMinutes <= remainingFreeMinutes) {
          freeMinutesApplied = exactDurationInMinutes;
          paidMinutes = 0;
          detectPrice = 0;
          console.log("✅ [handsup] Entire call is free");
        } else {
          freeMinutesApplied = remainingFreeMinutes;
          paidMinutes = exactDurationInMinutes - remainingFreeMinutes;
          detectPrice = paidMinutes * feePerMinute;
          console.log("⚠️ [handsup] Partial free call:", {
            freeMinutesApplied,
            paidMinutes,
            detectPrice,
          });
        }

        const totalFreeMinutesUsed =
          userCustomer.freeMinutesUsed + freeMinutesApplied;
        await User.findByIdAndUpdate(callFetch.customer, {
          freeMinutesUsed: totalFreeMinutesUsed,
          hasFreeMinutes: totalFreeMinutesUsed < userCustomer.freeMinutesLimit,
        });

        await Consultation.findByIdAndUpdate(user.currentConsult, {
          freeMinutesUsed: freeMinutesApplied,
        });

        console.log(
          `🎁 [handsup] Free Minutes Applied: ${freeMinutesApplied}, Paid Minutes: ${paidMinutes}`
        );
      } else {
        paidMinutes = exactDurationInMinutes;
        detectPrice = exactDurationInMinutes * feePerMinute;
        console.log("💰 [handsup] Full paid call:", {
          paidMinutes,
          detectPrice,
        });
      }

      let commissionPrice = 0;
      const settings = await SettingsModel.findOne({});
      if (settings) {
        commissionPrice = settings.commissionPrice;
      }
      console.log("💼 [handsup] Commission Price:", commissionPrice);

      const resultPercent =
        (parseFloat(commissionPrice) * parseFloat(detectPrice)) / 100;
      const walletBalanceOfficer =
        parseFloat((officerType.wallet || 0).toFixed(2)) +
        (parseFloat(detectPrice.toFixed(2)) -
          parseFloat(resultPercent.toFixed(2)));

      console.log("💰 [handsup] Calculations:", {
        detectPrice,
        resultPercent,
        walletBalanceOfficer,
        officerCurrentWallet: officerType.wallet,
      });

      if (detectPrice > 0) {
        const customerUserDoc = await User.findById(callFetch.customer);
        if (customerUserDoc) {
          const deduction = parseFloat(detectPrice.toFixed(2)) || 0;
          const newBalance = Math.max(
            0,
            (customerUserDoc.wallet || 0) - deduction
          );

          const updatedUser = await User.findByIdAndUpdate(
            callFetch.customer,
            { isCalling: false, wallet: newBalance },
            { new: true }
          );

          console.log("💳 [handsup] Customer wallet updated:", {
            previousBalance: customerUserDoc.wallet,
            deduction,
            newBalance: updatedUser.wallet,
          });
        }
      } else {
        await User.findByIdAndUpdate(
          callFetch.customer,
          { isCalling: false },
          { new: true }
        );
        console.log("🎁 [handsup] Free call - no wallet deduction");
      }

      await Consultation.findByIdAndUpdate(
        user.currentConsult,
        {
          totalCallPrice: parseFloat(detectPrice.toFixed(2)),
          payOfficer: parseFloat(
            (
              parseFloat(detectPrice.toFixed(2)) -
              parseFloat(resultPercent.toFixed(2))
            ).toFixed(2)
          ),
          adminCommission: parseFloat(resultPercent.toFixed(2)),
        },
        { new: true }
      );

      if (detectPrice > 0) {
        console.log(
          "💰 [handsup] Updating officer wallet:",
          walletBalanceOfficer
        );
        await User.findByIdAndUpdate(
          callFetch.officer,
          {
            isCalling: false,
            wallet: parseFloat(walletBalanceOfficer.toFixed(2)),
          },
          { new: true }
        );
      } else {
        await User.findByIdAndUpdate(
          callFetch.officer,
          { isCalling: false },
          { new: true }
        );
        console.log("🎁 [handsup] Free call - no officer payment");
      }

      socket.to(data.otherUserId).emit("appyHandsup", { status: true });
      console.log("✅ [handsup] Emitting appyHandsup to:", data.otherUserId);
      socket.emit("appyHandsup", { status: true });
      socket.to(data.otherUserId).emit("updateUser", {});
      socket.emit("updateUser", {});

      console.log("✅ [handsup] Call ended successfully");
    } catch (error) {
      console.error("❌ [handsup] Error:", error);
      console.error("Stack trace:", error.stack);
      socket.emit("call_error", {
        message: "Failed to process call end",
        error: error.message,
      });
    }
  });

  const CUSTOMER_ROLE_ID = "66b46462e8b154c1f89d6699";
  socket.on("join_meeting", async (data) => {
    console.log("📞 [join_meeting] Event triggered with data:", data);

    try {
      const receiverUser = await checkIsOnlineUser(data.to_user);
      console.log(
        "👤 [join_meeting] Receiver user lookup result:",
        receiverUser
      );

      if (!receiverUser) {
        throw new Error("Receiver user not found");
      }

      if (receiverUser.isOnline) {
        console.log(
          `✅ [join_meeting] Receiver ${data.to_user} is online. Sending via WebSocket...`
        );
        socket.to(data.to_user).emit("meeting_receiver", data);
        return;
      }

      console.log(
        `❌ [join_meeting] Receiver ${data.to_user} is offline. Sending push notification...`
      );

      const project =
        receiverUser.userRoleId.toString() === CUSTOMER_ROLE_ID
          ? "customer"
          : "officer";

      const pushData = {
        callerId: data.officer.mobile,
        rtcMessage: data.rtcMessage || {},
        userInfo: data.officer,
        consultationTypeName: data.ConsultationTypeName || "",
        chatId: data.chatId || "",
        type: "incoming_call",
        title: "Incoming Meeting",
        body: `${data.officer.name || "Officer"} is inviting you to a meeting.`,
        sound: "default",
        priority: "high",
        vibrate: true,
      };

      console.log("📤 [join_meeting] Push notification payload:", pushData);
      console.log("📦 [join_meeting] Push notification project:", project);

      await sendPushNotificationCall(receiverUser.fcmToken, pushData, project);
    } catch (error) {
      console.error("❗ [join_meeting] Error:", error);
      console.error("Stack trace:", error.stack);

      if (error.code === "messaging/mismatched-credential") {
        console.error(
          "Critical: Firebase credential mismatch. Check service account configuration."
        );
      }

      socket.emit("call_error", {
        error: "Failed to initiate call",
        details: error.message,
      });
    }
  });

  // **NEW: Handle socket disconnect - clean up any active timers**
  socket.on("disconnect", async () => {
    try {
      const user = await User.findOne({ mobile: socket.user });
      if (user?.currentConsult) {
        clearCallTimer(user.currentConsult.toString());
        console.log(
          `🔌 [disconnect] Cleaned up timer for user: ${socket.user}`
        );
      }
    } catch (error) {
      console.error("❌ [disconnect] Error cleaning up timer:", error);
    }
  });
};
