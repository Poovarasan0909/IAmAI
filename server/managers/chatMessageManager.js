const ChatMessage = require("../models/chatMessageModel");

async function storeChatMessage(data, io) {
    const now = new Date();
    const messageDate = now.toISOString().split("T")[0];
    const existingDateFromThisDay = await ChatMessage.findOne({
        type: "date",
        timeStamp: {
            $gte: new Date(messageDate),
            $lt: new Date(new Date(messageDate).setDate(new Date(messageDate).getDate() + 1)),
        },
    })
    if(!existingDateFromThisDay) {
        const dateSeparator = new ChatMessage({
            userId: 'system',
            type: "date",
            message: messageDate,
            timeStamp: now,
        })
        await dateSeparator.save();
        io.emit("receive_message", dateSeparator);
    }

    const chatMessage = new ChatMessage({
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        color: data.color,
        type: "message",
        timeStamp: Date.now(),
    });

    await chatMessage.save();

    return chatMessage;
}

module.exports = {storeChatMessage}