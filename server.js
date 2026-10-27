const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // Customer joins a room named after their order number
    socket.on('register-customer', (orderNumber) => {
        const roomName = String(orderNumber).trim();
        socket.join(roomName); // Joins a virtual room just for this order number
        console.log(`🎯 Device ${socket.id} joined Room: ${roomName}`);
    });

    // Barista broadcasts an alert directly to that order's room
    socket.on('order-ready', (orderNumber) => {
        const roomName = String(orderNumber).trim();
        console.log(`📣 Barista buzzing all devices in Room: ${roomName}`);
        
        // Broadcasts to every single device inside that specific room number
        io.to(roomName).emit('notify-ready');
    });
});

server.listen(PORT, () => {
    console.log(`🚀 System Online on Port ${PORT}!`);
});
