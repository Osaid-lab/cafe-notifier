const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow any device to talk to the server safely
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory tracker: { "storeNumber-orderNumber": true/false }
let readyOrders = {};

// 1. Customer checks if their order is ready (Runs every 2 seconds)
app.get('/api/check-status', (req, res) => {
    const loc = String(req.query.loc).trim().toLowerCase();
    const num = String(req.query.num).trim();
    const uniqueKey = `${loc}-${num}`;

    if (readyOrders[uniqueKey]) {
        // If it's ready, clear it out of memory and tell the phone to buzz!
        delete readyOrders[uniqueKey];
        return res.json({ ready: true });
    }

    res.json({ ready: false });
});

// 2. Barista marks an order as ready
app.post('/api/buzz-order', (req, res) => {
    const loc = String(req.body.location).trim().toLowerCase();
    const num = String(req.body.orderNumber).trim();
    const uniqueKey = `${loc}-${num}`;

    readyOrders[uniqueKey] = true;
    console.log(`🚀 Store #${loc} marked Order #${num} as READY!`);
    
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Qamaria Core Alert Engine Live on port ${PORT}!`);
});
