import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import commentRouter from './routes/comment.route.js';
import notificationRouter from './routes/notification.route.js';
//import { arcjetMiddleware } from './middleware/arcjet.middleware.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// app.use(arcjetMiddleware);

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.use("/api/posts", postRouter);

app.use("/api/comments", commentRouter);

app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => {
    res.send("Welcome to my social media");
});

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectToDatabase();
})