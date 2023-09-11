const express = require('express');
const app = express();
const http = require('http').createServer(app);
io = require('socket.io')(http);
//const server = http.createServer(app);
/*const { Server } = require('socket.io');*/

/*const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});*/

app.use(express.static('public'));

const users = [];
const messagesLimit = 20;
let messages1 = [];
let messages2 = [];
let messages3 = [];

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
  let currentRoom = 'room1';
  console.log('a user connected.', 'name: ' + username, 'id: ' + socket.id);

  socket.on('disconnect', () => {
    console.log('a user disconnected', socket.id);
  });

  socket.on('join', (room) => {
    socket.join(room);
    currentRoom = room;
    if (room === 'room1') {
      io.to(socket.id).emit('chat messages', messages1);
    }
    if (room === 'room2') {
      io.to(socket.id).emit('chat messages', messages2);
    }
    if (room === 'room3') {
      io.to(socket.id).emit('chat messages', messages3);
    }
    console.log('user joined room', room);
  });

  socket.on('chat messages', (msg) => {
    if (msg !== '') {
      if (currentRoom === 'room1') {
        messages1.unshift({ msg, username });
        messages1.length > messagesLimit && (messages1 = messages1.slice(0, messagesLimit));
      }
      if (currentRoom === 'room2') {
        messages2.unshift({ msg, username });
        messages2.length > messagesLimit && (messages2 = messages2.slice(0, messagesLimit));
      }
      if (currentRoom === 'room3') {
        messages3.unshift({ msg, username });
        messages3.length > messagesLimit && (messages3 = messages3.slice(0, messagesLimit));
      }
    }

    if (currentRoom === 'room1') io.to('room1').emit('chat messages', messages1);
    if (currentRoom === 'room2') io.to('room2').emit('chat messages', messages2);
    if (currentRoom === 'room3') io.to('room3').emit('chat messages', messages3);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
