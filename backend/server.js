const express = require('express')
const http = require('http')
const app = express()
const cors = require('cors');

const { Server } = require('socket.io')
const server = http.createServer(app)

const allowedOrigins = [
    "http://localhost:5173",
    "https://sockets-practice-chat.vercel.app"
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: allowedOrigins
}));

const PORT = 5000

app.get("/", (req, res) => {
    res.send("Server running");
});

const users = {}

io.on("connection", (socket) => {
    console.log("user connected: ", socket.id);

    socket.on("set_user", (usrName) => {
        users[socket.id] = usrName
    })

    socket.on("send_message", (msg) => {
        io.emit("receive_message", {
            msg,
            senderId: socket.id,
            usrName: users[socket.id]
        })
    })

    socket.on("show_typing", () => {
        socket.broadcast.emit("show_typing")
    })

    socket.on("stop_typing", () => {
        socket.broadcast.emit("stop_typing")
    })
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
})


server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});