const express = require('express');

const app = express();
const server = require('http').createServer(app);
app.use('/', express.static('public'));

const io = require('socket.io')(server);
let count = 0;
io.on('connection', (socket) => {
    socket.on('join', () => {
        const name = "room_" + count;
        const clients = io.sockets.adapter.rooms.get(name) || { length: 0 };
        if (clients.length === 0) {
            console.log(`Creating room ${name} and emitting room_created socket event`);
            socket.join(name);
            socket.emit('room_created', name);
        } else {
            console.log(`Joining room ${name} and emitting room_joined socket event`);
            socket.join(name);
            socket.emit('room_joined', name);
            count += 1;
        }
    });
    socket.on('start_call', (roomId) => {
        console.log(`Broadcasting start_call event to peers in room ${roomId}`);
        socket.broadcast.to(roomId).emit('start_call');
    });
    socket.on('webrtc_offer', (event) => {
        console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`);
        socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp);
    });
    socket.on('webrtc_answer', (event) => {
        console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`);
        socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp);
    });
    socket.on('webrtc_ice_candidate', (event) => {
        console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`);
        socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event);
    });
});

const port = process.env.PORT || 80;
server.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});