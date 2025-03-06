const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const mongoose = require('mongoose');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const ChatMessage = require('./models/chatMessageModel');
const PrivateMessage = require('./models/privateMessageModel');

const testRoutes = require('./routes/testRoutes');
const geminiApiRoutes = require('./routes/GeminiApiRoutes');
const chatRoutes = require('./routes/chatRoutes')
const userCredentialRoutes = require('./routes/userCredentialRoutes')

const authenticationToken = require('./authentications/authenticationToken');

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

// Middleware
app.use(cors({
        origin: function (origin, callback) {
            console.log(origin, allowedOrigins, allowedOrigins.includes(origin))
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        allowedHeaders: ["Authorization", "Content-Type", "Id"],
        exposedHeaders: ["Authorization", "Id"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

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
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error("Authentication error"));
        }
        try {
            const rawToken = token.split(" ")[1];
            const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            console.error("Invalid token:", error.message);
            return next(new Error("Authentication error"));
        }
    })
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

app.use('/', userCredentialRoutes);

app.get('/', (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_test_1234";
    const header = req.headers;
    const token = jwt.sign({id: `${header?.id && header?.id !== 'null' ? header?.id : 'stranger_is_here'}`}, JWT_SECRET, {expiresIn: '1d'});
    res.setHeader("Authorization", `Bearer ${token}`);
    res.send('Hello World!');
});
app.use('/api', authenticationToken, geminiApiRoutes);
app.use('/api', authenticationToken, testRoutes);
app.use('/api', authenticationToken, chatRoutes);