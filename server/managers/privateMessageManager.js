const PrivateMessage = require("../models/privateMessageModel");

async function storePrivateMessage(data, io, findSocketIdsByUserId, onlineUsers) {
    const now = new Date();
    const messageDate = now.toISOString().split("T")[0];
    if(data.receiverId) {
        const recipient = onlineUsers.get(data.receiverId);
        if(recipient) {
            const existingDateFromThisDay = await PrivateMessage.find({
                $or: [
                    {senderId: data.senderId, receiverId: data.receiverId},
                    {senderId: data.receiverId, receiverId: data.senderId}
                ]
            }).findOne({
                type: "date",
                timeStamp: {
                    $gte: new Date(messageDate),
                    $lt: new Date(new Date(messageDate).setDate(new Date(messageDate).getDate() + 1)),
                }});

            if(!existingDateFromThisDay) {
                const dateSeparator = new PrivateMessage({
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    senderName: 'system',
                    receiverName: 'system',
                    type: "date",
                    message: messageDate,
                    timeStamp: now,
                })
                await dateSeparator.save();
            }

            const privateMessage = new PrivateMessage({
                message: data.message,
                senderId: data.senderId,
                senderName: data.senderName,
                receiverId: data.receiverId,
                receiverName: data.receiverName,
                color: data.color,
                timeStamp: Date.now(),
            })
            await privateMessage.save();
            const findAllMessages = await PrivateMessage.find({
                $or: [
                    {senderId: data.senderId, receiverId: data.receiverId},
                    {senderId: data.receiverId, receiverId: data.senderId}
                ]
            }).sort({timeStamp: 1});
            findSocketIdsByUserId(data.receiverId).forEach(socketId => {
                if(socketId)
                    io.to(socketId).emit("receive_private_message", findAllMessages);
            })
            findSocketIdsByUserId(data.senderId).forEach(socketId => {
                if(socketId)
                    io.to(socketId).emit("receive_private_message", findAllMessages);
            })
        }
    }
}

module.exports = {storePrivateMessage}