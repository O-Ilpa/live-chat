import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./router.js";
import { addUser, getUser } from "./users.js";

const PORT = process.env.PORT || 3000;
const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(router);

server.listen(PORT, () => {
  console.log("Listening on port 3000");
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    const { user } = addUser({ id: socket.id, name, room });
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to: ${user.room}`,
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined`,
    });
    socket.join(user.room);
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });
});
