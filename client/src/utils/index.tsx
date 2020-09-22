import io from 'socket.io-client';
let socket: SocketIOClient.Socket;

export const initiateSocket = (room: string) => {
  socket = io('http://localhost:5000');
  if (socket && room) socket.emit('join-room', room);
}

export const disconnectSocket = () => {
  if(socket) socket.disconnect();
}

export const subscribeToChat = (cb: (arg0: null, arg1: any) => any) => {
  if (!socket) return(true);
  socket.on('chat', (msg: string) => {
    return cb(null, msg);
  });
}

export const sendMessage = (room: string, message: string) => {
  if (socket) socket.emit('message', { message, room });
}
