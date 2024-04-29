// index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { emit } = require('process');

const app = express();
app.use(cors())
const server = http.createServer(app);
const io = socketIo(server, {cors: {origin: '*'}});
// Socket.io events

let messageHistory = [];


io.on('connection', (socket) => {
    function historyUpdate(message) {
        messageHistory.push(message);
        if (messageHistory.length > 50) {
            messageHistory = messageHistory.slice(1)
        }
        socket.emit('messageHistory', messageHistory);
    }


    let username = ''
    console.log(`New client connected ${socket.id}`);
    socket.emit('messageHistory', messageHistory);
    socket.on('setUsername', (userName) => {
        io.emit('chat message', `${userName} connected`)
        username = userName
        historyUpdate(`${userName} connected`)
    })
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        io.emit('chat message', `${username} disconnected`)
        historyUpdate(`${username} disconnected`)
    });

    socket.on('chat message', (message) => {
        if (message == '') {
            return
        }
        console.log('Message:', message);
        io.emit('chat message', `${username}: ${message}`);
        historyUpdate(`${username}: ${message}`)
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
