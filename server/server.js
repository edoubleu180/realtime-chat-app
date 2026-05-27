import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const users = new Map(); // socket.id -> username

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users.set(socket.id, username);
    socket.broadcast.emit("system_message", `${username} joined the chat`);
    io.emit("online_users", Array.from(users.values()));
  });

  socket.on("chat_message", (message) => {
    const username = users.get(socket.id) || "Anonymous";
    const payload = {
      username,
      message,
      timestamp: new Date().toISOString(),
    };
    io.emit("chat_message", payload);
  });

  socket.on("disconnect", () => {
    const username = users.get(socket.id);
    if (username) {
      socket.broadcast.emit("system_message", `${username} left the chat`);
      users.delete(socket.id);
      io.emit("online_users", Array.from(users.values()));
    }
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (_req, res) => {
  res.send("Realtime Chat Server is running");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
