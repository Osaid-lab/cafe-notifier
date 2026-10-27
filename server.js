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

    // Customer joins a room combining location and order number
    socket.on('register-customer', (data) => {
        const location = String(data.location).trim().toLowerCase();
        const orderNum = String(data.orderNumber).trim();
        const uniqueRoomName = `${location}-${orderNum}`;
        
        socket.join(uniqueRoomName); 
        console.log(`🎯 Device ${socket.id} joined Room: ${uniqueRoomName}`);
    });

    // Barista broadcasts an alert specifically to their store's room
    socket.on('order-ready', (data) => {
        const location = String(data.location).trim().toLowerCase();
        const orderNum = String(data.orderNumber).trim();
        const uniqueRoomName = `${location}-${orderNum}`;
        
        console.log(`📣 Barista at [${location}] buzzing Room: ${uniqueRoomName}`);
        
        // Broadcasts ONLY to phones registered at this specific location with this order number
        io.to(uniqueRoomName).emit('notify-ready');
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Multi-Location System Online on Port ${PORT}!`);
});
