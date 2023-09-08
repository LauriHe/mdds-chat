const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

const users = [];
const messagesLimit = 15;
let messages = [];

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (users.includes(username)) {
    console.log('username taken');
    return next(new Error('username taken'));
  }
  if (!username) {
    console.log('no username');
    return next(new Error('invalid username'));
  }
  socket.username = username;
  users.push(username);
  next();
});

io.on('connection', (socket) => {
  const username = socket.handshake.auth.username;
  console.log('a user connected.', 'name: ' + username, 'id: ' + socket.id);

  socket.on('disconnect', () => {
    console.log('a user disconnected', socket.id);
  });

  socket.on('chat messages', (msg) => {
    if (msg !== '') {
      messages.unshift({ msg, username });
      messages.length > messagesLimit && (messages = messages.slice(0, messagesLimit));
    }

    io.emit('chat messages', messages);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
