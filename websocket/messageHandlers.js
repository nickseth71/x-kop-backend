import mongoose from "mongoose";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/messages.model.js";
import { checkIsOnlineUser } from "./userStatusHandle.js";
import { sendPushNotification, sendPushNotificationCall } from "../utils/pushNotificationCall.js";

const ObjectId = mongoose.Types.ObjectId;

export const handleMessages = (socket,io) => {
  socket.on("sendmessage", async (data) => {
    try {
      const { sender, receiver, type, content } = data;
      let chat = await Chat.findOne({ participants: { $all: [sender?.id, receiver?.id] } });
      if (!chat) {
        chat = new Chat({
          participants: [sender?.id, receiver?.id],
          messages: [],
        });
        await chat.save();
      }

      // Create new message
      const message = new Message({
        sender: sender?.id,
        chat: chat._id,
        content,
        type,
      });
      await message.save();

      // Push the message to the chat
      await Chat.findByIdAndUpdate(chat._id, {
        $push: { messages: message._id },
      });

      // Check if receiver is online
      const receiverUser = await checkIsOnlineUser(receiver.mobile);
    
     
      // Prepare response object
      const response = { ...message._doc};

      // Send the message back to the sender
      socket.emit("receiveMessage", { message: response });

      if (receiverUser.isOnline) {
        socket.to(receiver.mobile).emit("receiveMessage", { message: response });
      } 
      else{
        // socket?.userInfo?.name
        // receiverUser?.fcmToken
        // socket?.userInfo?.avatar
        // type, content

        const message = {
          token: receiverUser?.fcmToken,
          notification: {
            title: socket?.userInfo?.name,
            body: content,
            image: socket?.userInfo?.avatar
          }
        };
        sendPushNotification(message);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("errorMessage", { error: "Failed to send message" });
    }
  });

  // Handle message updates
  socket.on("updatemessage", async (data) => {
    try {
      const { messageId, newContent,reciever } = data;

      // Find and update the message
      const updatedMessage = await Message.findByIdAndUpdate(messageId, { content: newContent }, { new: true });

      if (!updatedMessage) {
        return socket.emit("errorMessage", { error: "Message not found" });
      }

      // Notify the sender and receiver about the updated message
      const chat = await Chat.findById(updatedMessage.chat);
      if (!chat) return;

      const response = { ...updatedMessage._doc};

      socket.emit("messageUpdated", { message: response });
      // const receiverUser = await checkIsOnlineUser(receiver);
      // if (receiverUser.isOnline) {
        socket.to(reciever.mobile).emit("messageUpdated", { message: response });
      // }

    } catch (error) {
      console.error("Error updating message:", error);
      socket.emit("errorMessage", { error: "Failed to update message" });
    }
  });

  socket.on("deletemessages", async (data) => {
    try {
      const { messageIds,reciever } = data;

      const deletedMessages = await Message.deleteMany({ _id: { $in: messageIds } });

      if (deletedMessages.deletedCount === 0) {
        return socket.emit("errorMessage", { error: "Messages not found" });
      }

      const chat_dlt =   await Chat.find(
        { messages: { $in: messageIds } }
      );

      await Chat.updateMany(
        { messages: { $in: messageIds } },
        { $pull: { messages: { $in: messageIds } } }
      );

      socket.emit("messageDeleted", { messageIds,chat_id:chat_dlt[0]._id }); 
      socket.to(reciever.mobile).emit("messageDeleted", { messageIds,chat_id:chat_dlt[0]._id });

    } catch (error) {
      console.error("Error deleting messages:", error);
      socket.emit("errorMessage", { error: "Failed to delete messages" });
    }
  });
};
 