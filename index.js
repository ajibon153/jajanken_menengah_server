var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
// let io = require("socket.io")(server, {
//   // path: "/",
//   serveClient: true,
//   transports: ["websocket", "polling"],
//   // below are engine.IO options
//   pingInterval: 10000,
//   pingTimeout: 5000,
//   cookie: true,
// }).listen(server);
// io.listen(server);
let users = [];
connections = [];
choices = [];
temp_choices = [];
var score = 0;
const router = require("./router");

server.listen(process.env.PORT || 5000);
console.log("Sever running...");

app.use(router);

io.sockets.on("connection", function (socket) {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);

  socket.on("disconnect", function (data) {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    io.emit("disconnected", socket.username);
    // users = [];
    console.log("Disconnected: %s sockets connected", connections.length);
  });

  socket.on("send message", function (data, callback) {
    // const result = JSON.parse(message.utf8Data);
    const { method } = data;

    if (method === "add user") {
      socket.username = data;
      if (users.indexOf(socket.username) > -1) {
        callback(false);
        return false;
      } else {
        let payload;
        if (Object.keys(users).length < 1) {
          payload = {
            name: data.name,
            player: "one",
            score: data.score,
          };
        } else if (Object.keys(users).length == 1) {
          if (users[0].name != data.name) {
            payload = {
              name: data.name,
              player: "two",
              score: data.score,
            };
          } else {
            callback({
              error: "nama user sudah di pakai, mohon gunakan nama yang lain",
            });
            return false;
          }
        } else {
          callback(false);
          return false;
        }

        users.push(payload);
        updateUsernames();
        callback(users);

        if (Object.keys(users).length == 2) {
          io.emit("connected", socket.username);
          io.emit("game start");
        }
      }
      console.log("after add ", users);

      // });
    }
    if (method === "player choice") {
      console.log("start choice", data);
      const { name, choice, player } = data;
      temp_choices.push(data);

      const swapPositions = (array, a, b) => {
        return ([array[a], array[b]] = [array[b], array[a]]);
      };
      console.log(temp_choices);

      if (temp_choices.length == 2) {
        if (temp_choices[0]["player"] == "two") {
          let ar = swapPositions(temp_choices, 0, 1);
          choices.push(ar);
        } else if (temp_choices[1]["player"] == "one") {
          let ar = swapPositions(temp_choices, 0, 1);
          choices.push(ar);
        } else {
          choices.push(temp_choices);
        }
        // console.log("all choices", choices);
        // console.log("==============================================");
        // console.log("%s chose %s.", name, choice);
        // console.log('choices[0][0]["choice"]', choices[0][0]["choice"]);
        // console.log('choices[0][1]["choice"]', choices[0][1]["choice"]);
        switch (choices[0][0]["choice"]) {
          case "batu":
            switch (choices[0][1]["choice"]) {
              case "batu":
                io.emit("tie", choices);
                callback(choices);
                console.log("set", choices);
                choices = [];
                temp_choices = Array();
                break;

              case "kertas":
                callback(choices);
                io.emit("player 2 win", choices);
                console.log("set", choices);
                choices = [];
                temp_choices = Array();
                break;

              case "gunting":
                callback(choices);
                io.emit("player 1 win", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
                break;

              default:
                break;
            }
            break;

          case "kertas":
            switch (choices[0][1]["choice"]) {
              case "batu":
                callback(choices);
                io.emit("player 1 win", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
                break;

              case "kertas":
                callback(choices);
                io.emit("tie", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
                break;

              case "gunting":
                callback(choices);
                io.emit("player 2 win", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
                break;

              default:
                break;
            }
            break;

          case "gunting":
            switch (choices[0][1]["choice"]) {
              case "batu":
                callback(choices);
                io.emit("player 2 win", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
                break;

              case "kertas":
                callback(choices);
                io.emit("player 1 win", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
                break;

              case "gunting":
                callback(choices);
                io.emit("tie", choices);
                console.log("set", choices);

                choices = [];
                temp_choices = Array();
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
    }
  });

  // socket.on("player choice", function (username, choice) {
  // });
  socket.on("uncaughtException", function (err) {
    console.info(util.inspect(err, { colors: true }));
  });
});

function updateUsernames() {
  io.sockets.emit("get user", users);
  // console.log("update users", users);
}
