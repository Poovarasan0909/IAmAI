const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
        userId : { type: String, required: true },
        userName : { type: String, required: true },
        message : { type: String, required: true },
        color : { type: String},
        timeStamp : { type: Date, default: Date.now}

})

const chatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = chatMessage;