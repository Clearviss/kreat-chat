// index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { emit } = require('process');

const app = express();
app.use(cors())
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
// Socket.io events

let messageHistory = [];


io.on('connection', (socket) => {
    console.log(`New client connected ${socket.id}`);
    let avatarID = Math.floor(Math.random() * 12) + 1
    let username = ''
    function historyUpdate(message) {
        messageHistory.push(message);
        if (messageHistory.length > 200) {
            messageHistory = messageHistory.slice(1)
        }
        socket.emit('messageHistory', messageHistory);
    }

    socket.on('setUsername', (userName) => {
        username = userName
        let data = { avatar: avatarID, name: username, message: "connected", type: 0 }
        io.emit('chat message', data)
        historyUpdate(data)
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        let data = { avatar: avatarID, name: username, message: "disconnected", type: 1 }
        io.emit('chat message', data)
        historyUpdate(data)
    });

    socket.on('chat message', (message) => {
        if (message == '') {
            return
        }
        if (message.length > 300) {
            return
        }
        console.log('Message:', message);
        let data = { avatar: avatarID, name: username, message: message, type: 2 }
        io.emit('chat message', { avatar: avatarID, name: username, message: message, type: 2 });
        historyUpdate(data)
    });
    socket.emit('messageHistory', messageHistory);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
