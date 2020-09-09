const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');

let socket;

const fun = () => {
    socket = io('http://localhost:5000');
    socket.emit('join-room', 'A');
    socket.emit('message', { message: 'BB', room: 'A' });
    socket.disconnect();
};

fun();