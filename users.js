const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //   const avaUser = getUser(id);
  //   console.log("ava", avaUser);
  //   console.log("users", users);
  let player = "";
  if (users.length === 0) {
    player = "one";
  } else {
    player = "two";
  }

  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  );

  if (!name || !room) return { error: "Username and room are required." };
  if (existingUser) return { error: "Username sudah ada." };

  const user = { id, name, player, room, score: 0 };
  //   console.log(user);
  if (users.length > 2) return { error: "room penuh" };
  users.push(user);
  //   console.log(users);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUserLog = (id) => {
  console.log("get users ", users);
  const get = users.find((user) => {
    console.log(id);
    console.log("get user", user);
    console.log(user.id);
    console.log(user.room);
    user.id === id;
  });
  console.log(get);
  return get;
};
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom, getUserLog };
