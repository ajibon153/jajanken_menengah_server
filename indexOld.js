const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
  getUserLog,
} = require("./users");
const PORT = process.env.PORT || 5000;

const router = require("./router");
const users = [];
const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("Sudah terhubung dengan socket io");

  socket.on("join", ({ name, room }, callback) => {
    // console.log(name, room);
    // const error = true;
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log(user);
    if (error) {
      callback({ error: "error" });
    }

    // message keplayer yang join
    socket.emit("message", {
      user: user.name,
      player: user.palyer,
      score: score,
      userData: user,
    });

    // message ke semua player
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} telah bergabung`,
    });

    socket.join(user.room);

    callback;
  });

  socket.on("sendMessage", (card, callback) => {
    // const getuserlog = getUserLog(socket.id);
    const getuser = getUser(socket.id);
    // let player;
    // if (users.length === 0) {
    //   const playerOne = getUser(socket.id);
    //   users.push(playerOne);
    // } else {
    //   const playerTwo = getUser(socket.id);
    //   users.push(playerTwo);
    // }
    // if (playerOne && playerTwo) {
    // }
    io.to(getuser.room).emit("message", {
      id: getuser.id,
      user: getuser.name,
      card: `${card}`,
      player: getuser.player,
      score: getuser.score,
    });
  });

  socket.on("disconnect", () => {
    // console.log("user logout");
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} Has Left`,
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => {
  console.log("server start " + PORT);
});
