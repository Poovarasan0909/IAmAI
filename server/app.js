const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const ChatMessage = require('./models/chatMessageModel');
const PrivateMessage = require('./models/privateMessageModel');

const testRoutes = require('./routes/testRoutes');
const geminiApiRoutes = require('./routes/GeminiApiRoutes');
const chatRoutes = require('./routes/chatRoutes')

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    },
});
const onlineUsers = new Map();
const socketIdsUser = new Map();

function findSocketIdsByUserId(userId) {
    const socketIds = [];
    for (const [socketId, storedUserId] of socketIdsUser.entries()) {
        if (socketId && storedUserId === userId) {
            socketIds.push(socketId);
        }
    }
    return socketIds;
}

const setUpSocket = () => {
    io.on('connection', async (socket) => {
        socket.on('error', (err) => {
            console.error('Socket error:', err.message);
        });

        socket.on('close', () => {
            console.log('Client disconnected');
        });

        const chatHistory = await ChatMessage.find().sort({ timeStamp: 1 }).limit(50);
        socket.emit("chat_history", chatHistory);

        socket.on("private_room", (data) => {
            onlineUsers.set(data.userId, data);
            socketIdsUser.set(data.socketId, data.userId);
            io.emit('online_users', Array.from(onlineUsers.values()));
        });

        socket.on("send_message", async (data) => {
            const chatMessage = new ChatMessage({
                userId: data.userId,
                userName: data.userName,
                message: data.message,
                color: data.color,
                timeStamp: Date.now(),
            });

            await chatMessage.save();
            io.emit("receive_message", chatMessage);
        })

        socket.on("send_private_message", async (data) => {
            if(data.receiverId) {
                const recipient = onlineUsers.get(data.receiverId);
                if(recipient) {
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
                    const findAllMessages = await PrivateMessage.find({ $or: [
                            {senderId: data.senderId, receiverId: data.receiverId},
                            {senderId: data.receiverId, receiverId: data.senderId}
                        ]}).sort({ timeStamp: 1 });
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
        });
        socket.on("disconnect", () => {
            console.log("User Disconnected:", socket.id);
            for (const [userId, socketId] of onlineUsers.entries()) {
                console.log(userId, socketId, socketId.socketId);
                if(socketId.socketId === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit('online_users', Array.from(onlineUsers.values()));
                    break;
                }
            }
        });
    });
}

// MongoDB connection
const uri = 'mongodb+srv://poovarasan_0909:poov09092002@gemini-api.ka3hnmn.mongodb.net/?retryWrites=true&w=majority&appName=gemini-api';
mongoose.connect(uri).then(() => {
    console.log('Connected to MongoDB')
    setUpSocket();
    server.listen(port, () => {
        console.log(`Server running at ${port}`);
    });
}).catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
});
mongoose.connection.on('error', (err) => {
    console.error('Database connection error:', err);
});
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//     console.log('Connected to MongoDB');
// });

app.use('/', testRoutes);
app.use('/', geminiApiRoutes);
app.use('/', chatRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});