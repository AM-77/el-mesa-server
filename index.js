const socketio = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");
const {
  addUser,
  removeUser,
  getUser,
  getUsersFromRoom,
  getRooms,
} = require("./users");

const PORT = process.env.PORT || 3300;
const router = require("./router");

const app = express();
app.use(cors());
app.use(router);

const server = http.createServer(app);
const io = socketio(server);

const writters = {};

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, name, room });
    const members = getUsersFromRoom(room);
    if (error) return callback(error);
    socket.emit("message", {
      user: "admin",
      text: `'${user.name}' welcome to '${user.room}'`,
      members,
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `'${user.name}' has joined the conversation.`,
      members,
    });
    socket.join(user.room);
    writters[user.room] = [];
    callback();
  });

  socket.on("send-message", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  socket.on("get-rooms", () => {
    io.emit("rooms", { rooms: getRooms() });
  });

  socket.on("isWritting", ({ name, room }) => {
    writters[room].push(name);
    io.to(room).emit("writters", { writters: writters[room] });
  });

  socket.on("stoppedWritting", ({ name, room }) => {
    writters[room] = writters[room].filter((n) => n !== name);
    io.to(room).emit("writters", { writters: writters[room] });
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      const members = getUsersFromRoom(user.room);
      io.to(user.room).emit("message", {
        user: "admin",
        text: `'${user.name}' has left the conversation.`,
        members,
      });
      io.emit("rooms", { rooms: getRooms() });
    }
  });
});

server.listen(PORT);
