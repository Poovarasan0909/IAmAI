const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
    message: { type: String},
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    color: { type: String},
    timeStamp : { type: Date, default: Date.now}
});

const privateMessage = mongoose.model('PrivateMessage', privateMessageSchema);
module.exports = privateMessage;