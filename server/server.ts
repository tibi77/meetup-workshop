/**
 * Meetup in the pandemic
 */

import express from 'express';
import morgan from 'morgan';
import sockIO from 'socket.io';

import { ExpressPeerServer } from 'peer';


const app = express();
app.use(morgan('tiny'));

const http = require('http').createServer(app);
const peerServer = ExpressPeerServer(http);
const port = 5000;
const io = sockIO(http);

app.get('/', (_req, res) => {
    res.send(); // server file
});


app.use('/peerjs', peerServer);

io.on('connection', socket => {
    console.log('connection');

    socket.on("*",function(event,data) {
        console.log(event);
        console.log(data);
    });

    socket.on('join-room', (roomId, userId) => {
        console.log('join')
        console.log(roomId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        // messages
        socket.on('message', (message) => {
            console.log(message);
            io.to(roomId).emit('createMessage', message)
        });

        socket.on('disconnect', () => {
            console.log('disconnected');
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        });
    });
})


http.listen(port, () => {
    console.log('Server is running \u{1F91F}');
});