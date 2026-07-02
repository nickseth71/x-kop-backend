import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Chat from '../models/chat.model.js';
import Message from '../models/messages.model.js';
import User from '../models/user.model.js';

// Create a new chat
export const createChat = asyncHandler(async (req, res) => {
  const { participants } = req.body;

  if (!participants || participants.length < 2) {
    return res.status(400).json(new ApiError(400, "A chat requires at least two participants."));
  }

  try {
    const chat = new Chat({ participants });
    await chat.save();

    // Update each participant's chats array
    for (const participantId of participants) {
      await User.findByIdAndUpdate(participantId, {
        $push: { chats: chat._id }
      });
    }

    res.status(201).json(new ApiResponse(201, chat, "Created new chat successfully."));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

// Send a message
export const sendMessage = asyncHandler(async (req, res) => {
  const { sender, chatId, type, content } = req.body;

  try {
    const message = new Message({ sender, chat: chatId, type, content });
    await message.save();

    const chat = await Chat.findById(chatId);
    chat.messages.push(message._id);
    chat.updatedAt = Date.now();
    await chat.save();

    res.status(201).json(new ApiResponse(201, message, "Created new message."));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export const getConversationChatsPagination = asyncHandler(async (req, res) => {
  const { conversationId, page = 1,limit = 10 } = req.query; 
  try {
    const messageAll = await Chat.findById(conversationId)
    .populate({
        path: 'messages',
        options: {
          sort: { createdAt: -1 }, 
          limit: limit,            
          skip: (page - 1) * limit, 
      },
    });

   
    const totalMessages = await Chat.findById(conversationId).populate({
        path: 'messages',
    
    }).exec();

    

    const totalCount = totalMessages.messages.length; 
    const totalPages = Math.ceil(totalCount / limit);       

    res.status(200).json(new ApiResponse(200, {
      messages: messageAll.messages,
      currentPage: page,
      totalPages: totalPages,
      totalMessages: totalCount,
    }, "Messages retrieved with pagination."));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

// export const getConversationChatsPagination = asyncHandler(async (req, res) => {
//   const { conversationId, page = 1 } = req.query; 
//   const pageSize = 10;

//   // Convert page to integer and ensure it's a valid number
//   const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

//   // Fetch conversation and populate sender details in messages
//   const conversation = await Chat.findById(conversationId)
//     .populate({
//       path: 'messages.sender',
//     })
//     .exec();

//   if (!conversation) {
//     throw new ApiError(404, 'Conversation not found');
//   }

//   // Filter non-deleted messages
//   const validMessages = conversation.messages.filter(
//     (message) =>
//       !message.isDeleted && !message.deletedFor.includes(req.user.id)
//   );

//   // Calculate total messages and pages
//   const totalMessages = validMessages.length;
//   const totalPages = Math.ceil(totalMessages / pageSize);

//   // Paginate the messages
//   const paginatedMessages = validMessages
//     .slice(pageSize * (pageNumber - 1), pageSize * pageNumber);

//   // Sort the paginated messages by creation date (newest first)
//   const sortedMessages = paginatedMessages
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//     .map((message) => ({
//       id: message._id,
//       type: message.type,
//       content: message.isDeleted ? 'This message was deleted' : message.content,
//       isRead: message.isRead,
//       sender: message.sender,
//       createdAt: message.createdAt,
//     }));

//   // Respond with paginated messages
//   return res.status(200).json(new ApiResponse(200, {
//     messages: sortedMessages,
//     currentPage: pageNumber,
//     totalPages,
//     totalMessages,
//   }, 'Messages retrieved with pagination.'));
// });


export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId, chatId } = req.body;
  
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json(new ApiError(404, "Chat not found"));
      }
  
      chat.messages = chat.messages.filter(id => id.toString() !== messageId);
      await chat.save();
      await Message.findByIdAndDelete(messageId);
  
      res.status(200).json(new ApiResponse(200, null, "Message deleted successfully."));
    } catch (error) {
      res.status(500).json(new ApiError(500, error.message));
    }
  });

 // Edit a message
export const editMessage = asyncHandler(async (req, res) => {
    const { messageId, newContent } = req.body;
  
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json(new ApiError(404, "Message not found"));
      }
  
      message.content = newContent;
      await message.save();
  
      res.status(200).json(new ApiResponse(200, message, "Message updated successfully."));
    } catch (error) {
      res.status(500).json(new ApiError(500, error.message));
    }
  });


  export const uploadMessageData = asyncHandler(async (req, res) => {
    try {
 
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(new ApiError(400, "No files uploaded!"));
      }
      const fileUrls = req.files.map((file) => file.location);

      res.status(201).json(new ApiResponse(200, fileUrls, "file upload successfully."));
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  });


  export const uploadMediaData = asyncHandler(async (req, res) => {
    console.log("req.body====>",req.body)
    try {
      const { chatId } = req.body;
  
      // Ensure a chat ID is provided
      if (!chatId) {
        return res.status(400).json(new ApiError(400, "Chat ID is required!"));
      }
  
      // Ensure files are uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(new ApiError(400, "No files uploaded!"));
      }
  
      // Extract file URLs from uploaded files
      const fileUrls = req.files.map((file) => file.location
      //   ({
      //   type: file.mimetype, 
      //   url: file.location, 
      // })
    );
  
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { media: { $each: fileUrls } } }, 
        { new: true, timestamps: false } 
      );
  
      if (!updatedChat) {
        return res.status(404).json(new ApiError(404, "Chat not found!"));
      }
  
      res.status(201).json(new ApiResponse(201, updatedChat.media, "Files uploaded and media updated successfully."));
    } catch (error) {
      console.error("Error uploading media:", error);
      return res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  });
  

  export const getConversation = asyncHandler(async (req, res) => {
    try {
      const userData = await User.findById(req.user._id);
      
      if (userData && userData.chats.length) {
        const chatsUsers = await Chat.find({ _id: { $in: userData.chats } }).select("participants")
          .populate({
            path: 'participants',
            select: 'name email mobile id avatar officerDetails isOnline',
            populate: {
              path: 'officerDetails',
              select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
              populate: {
                path: 'ConsultationTypeID',
                model: 'ConsultaionType',
                select: 'ConsultationTypeName FeePerMinute',
              },
            },
          })
          .exec();
        
        return res.status(200).json(new ApiResponse(200,chatsUsers,"success"));
      } else {
        return res.status(404).json(new ApiError(404,"No chats found for this user."));
      }
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  });
  


  export const updateChatDetails = asyncHandler(async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const updateData = req.body;
  
      const updateOps = { ...updateData };
  
      if ('media' in updateData) {
        updateOps.media = updateData.media; 
      }
  
      const chat = await Chat.findOneAndUpdate(
        { _id: chatId },
        { $set: updateOps }, 
        { new: true }
      );
  
      if (!chat) {
        return res.status(404).json(new ApiError(404, "Chat not found"));
      }
  
      return res.status(200).json(new ApiResponse(200, chat, "Chat updated successfully"));
    } catch (error) {
      console.error("Error updating chat details:", error);
      return res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  });

  export const getSingleConversation = asyncHandler(async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const chat = await Chat.findById(chatId);
      return res.status(200).json(new ApiResponse(200, chat, "success"));
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  });
  

