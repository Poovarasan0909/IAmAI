const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
        userId : { type: String, required: true },
        userName : { type: String },
        message : { type: String, required: true },
        color : { type: String},
        timeStamp : { type: Date, default: Date.now},
        type: { type: String, default: 'message'}
})

const chatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = chatMessage;