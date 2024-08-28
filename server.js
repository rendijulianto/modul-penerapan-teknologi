const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});



// Simpan informasi pengguna yang bergabung dengan channel
const channelUsers = {};

io.on('connection', (socket) => {
  console.log('a user connected');
  

  // Klien bergabung dengan channel dengan nama dan koordinat
  socket.on('joinChannel', ({ channelId, name, coordinates }) => {
    socket.join(channelId);

    // Simpan informasi pengguna
    if (!channelUsers[channelId]) {
      channelUsers[channelId] = [];
    }
    channelUsers[channelId].push({ id: socket.id, name, coordinates });

    console.log(`User ${name} joined channel ${channelId} with coordinates ${coordinates}`);
    // kirim balik informasi pengguna yang bergabung
    io.to(channelId).emit('notification', `${name} joined the channel`);
    // daftar pengguna yang bergabung dan koordinatnya 
    io.to(channelId).emit('channelUsers', channelUsers[channelId]);
  });

  // Kirim notifikasi ke channel tertentu
  socket.on('sendNotification', ({ channelId, message }) => {
    io.to(channelId).emit('notification', message);
    console.log(`Notification sent to channel ${channelId}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    // Hapus informasi pengguna saat mereka terputus
    for (const [channelId, users] of Object.entries(channelUsers)) {
      const userIndex = users.findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        console.log(`User disconnected from channel ${channelId}`);
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
