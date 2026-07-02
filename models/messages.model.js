import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  type: { type: String, enum: ['text', 'image', 'audio', 'video', 'file'], required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
