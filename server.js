const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// FIXED SECURITY PARAMETERS: Opening the gateway channels completely 
// This forces Socket.io to accept connection pings from any external phone or tablet browser
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`🔌 Link connected successfully: ${socket.id}`);

    // Customer logs in with their location payload
    socket.on('register-customer', (data) => {
        if (!data || !data.location || !data.orderNumber) return;
        
        const loc = String(data.location).trim().toLowerCase();
        const num = String(data.orderNumber).trim();
        const uniqueRoom = `${loc}-${num}`;
        
        socket.join(uniqueRoom); 
        console.log(`🎯 Customer joined isolated room grid: ${uniqueRoom}`);
    });

    // Barista dispatches alert specifically to their store room boundary walls
    socket.on('order-ready', (data) => {
        if (!data || !data.location || !data.orderNumber) return;
        
        const loc = String(data.location).trim().toLowerCase();
        const num = String(data.orderNumber).trim();
        const uniqueRoom = `${loc}-${num}`;
        
        console.log(`📣 Store #${loc} dispatched a buzz alert directly to Room: ${uniqueRoom}`);
        
        // Emits strictly to the matching location-order number partition layout
        io.to(uniqueRoom).emit('notify-ready');
    });

    socket.on('disconnect', () => {
        console.log(`❌ Device disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Multi-Store Alert Switchboard Active on Port ${PORT}!`);
});
