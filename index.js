var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
users = [];
connections = [];
choices = [];
const router = require("./router");

server.listen(process.env.PORT || 5000);
console.log("Sever running...");

app.use(router);

// app.get("/", function (rer, res) {
//   res.sendFile(__dirname + "/index.html");
// });

io.sockets.on("connection", function (socket) {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);

  socket.on("disconnect", function (data) {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    io.emit("disconnected", socket.username);
    console.log("Disconnected: %s sockets connected", connections.length);
  });

  socket.on("send message", function (data) {
    io.sockets.emit("new message", { msg: data, user: socket.username });
  });

  socket.on("add user", function (data, callback) {
    socket.username = data;

    if (users.indexOf(socket.username) > -1) {
      callback(false);
    } else {
      users.push(socket.username);
      updateUsernames();
      callback(true);

      if (Object.keys(users).length == 2) {
        io.emit("connected", socket.username);
        io.emit("game start");
      }
    }
  });

  socket.on("player choice", function (username, choice) {
    choices.push({ user: username, choice: choice });
    console.log("%s chose %s.", username, choice);

    if (choices.length == 2) {
      //   console.log("[socket.io] Both players have made choices.");
      //   console.log("masuk ke kondisi");
      //   console.log("choices[0]", choices[0]);
      //   console.log('choices[0]["choice"]', choices[0]["choice"]);
      //   console.log("choices[1]", choices[1]);
      //   console.log('choices[1]["choice"]', choices[1]["choice"]);
      //   if (choices[0]["choice"] === "batu") {
      //       if (choices[1]["choice"] === "batu") {
      //           io.emit("tie", choices);
      //           console.log("tie");
      //       } else if (choices[1]["choice"] === "kertas") {
      //           console.log("player 2 win");
      //           io.emit("player 2 win", choices);
      //       } else if (choices[1]["choice"] === "gunting") {
      //           console.log("player 1 win");
      //           io.emit("player 1 win", choices);
      //     }
      //   } else if (choices[0]["choice"] === "kertas") {
      //     if (choices[1]["choice"] === "batu") {
      //     } else if (choices[1]["choice"] === "kertas") {
      //     } else if (choices[1]["choice"] === "gunting") {
      //     }
      //   } else if (choices[0]["choice"] === "gunting") {
      //     if (choices[1]["choice"] === "batu") {
      //       //
      //     } else if (choices[1]["choice"] === "kertas") {
      //       //
      //     } else if (choices[1]["choice"] === "gunting") {
      //       //
      //     }
      //   }
      switch (choices[0]["choice"]) {
        case "batu":
          switch (choices[1]["choice"]) {
            case "batu":
              io.emit("tie", choices);
              console.log("tie");
              break;

            case "kertas":
              console.log("player 1win");
              io.emit("player 2 win", choices);
              break;

            case "gunting":
              console.log("player 2win");
              io.emit("player 1 win", choices);
              break;

            default:
              break;
          }
          break;

        case "kertas":
          switch (choices[1]["choice"]) {
            case "batu":
              console.log("p1win");
              io.emit("player 1 win", choices);
              break;

            case "kertas":
              console.log("tie");
              io.emit("tie", choices);
              break;

            case "gunting":
              console.log("p2win");
              io.emit("player 2 win", choices);
              break;

            default:
              break;
          }
          break;

        case "gunting":
          switch (choices[1]["choice"]) {
            case "batu":
              console.log("p2in");
              io.emit("player 2 win", choices);
              break;

            case "kertas":
              console.log("p1win");
              io.emit("player 1 win", choices);
              break;

            case "gunting":
              console.log("tie");
              io.emit("tie", choices);
              break;

            default:
              break;
          }
          break;

        default:
          break;
      }

      choices = [];
    }
  });

  function updateUsernames() {
    io.sockets.emit("get user", users);
  }
});
