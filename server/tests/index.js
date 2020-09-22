const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');

let socket;

const fun = () => {
    let room = 'A';
    socket = io('http://localhost:5000');
    if (socket && room) socket.emit('join-room', room);
    socket.emit('message', { message: 'BB', room: 'A' });

    setTimeout(() => {
        socket.disconnect();
    }, 500); 
};

fun();