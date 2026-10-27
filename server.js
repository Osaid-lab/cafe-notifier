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
    console.log(`🔌 Link connected: ${socket.id}`);

    // Customer joins a custom store room: e.g., "1-50" or "2-50"
    socket.on('register-customer', (data) => {
        if (!data || !data.location || !data.orderNumber) return;
        
        const loc = String(data.location).trim().toLowerCase();
        const num = String(data.orderNumber).trim();
        const uniqueRoom = `${loc}-${num}`;
        
        socket.join(uniqueRoom); 
        console.log(`🎯 Customer linked directly to Room: ${uniqueRoom}`);
    });

    // Barista targets ONLY their store's custom room partition
    socket.on('order-ready', (data) => {
        if (!data || !data.location || !data.orderNumber) return;
        
        const loc = String(data.location).trim().toLowerCase();
        const num = String(data.orderNumber).trim();
        const uniqueRoom = `${loc}-${num}`;
        
        console.log(`📣 Store #${loc} dispatched buzz tracking to Room: ${uniqueRoom}`);
        
        // Emits exclusively to the specific store room partition boundary walls
        io.to(uniqueRoom).emit('notify-ready');
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Multi-Location System Live on Port ${PORT}!`);
});
