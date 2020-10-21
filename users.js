const users = [];

const addUser = ({ id, name, room }) => {
  const userName = name.trim().toLowerCase();
  const userRoom = room.trim().toLowerCase();

  const exists = users.find(
    (user) => user.name === userName && user.room === userRoom
  );
  if (exists) {
    return { error: "Name is taken, please retry with a different name." };
  }
  users.push({ id, name: userName, room: userRoom });
  return { user: { id, name: userName, room: userRoom } };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersFromRoom = (room) => users.filter((user) => user.room === room);

const getRooms = () => {
  const rooms = [];
  users.forEach((user) => {
    if (rooms.indexOf(user.room) === -1) {
      rooms.push(user.room);
    }
  });
  return rooms;
};

module.exports = { addUser, removeUser, getUser, getUsersFromRoom, getRooms };
