import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  recordingUrl:{
    type:String
 },
  summary:{type:String},
  note:{type:String},
  media:[{type:String,url:String}],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
