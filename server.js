const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store room memory partition
let readyOrders = {};

// 1. Endpoint for customers checking their order status
app.get('/api/check-status', (req, res) => {
    const loc = String(req.query.loc || '1').trim().toLowerCase();
    const num = String(req.query.num || '').trim();
    const uniqueKey = `${loc}-${num}`;

    if (num && readyOrders[uniqueKey]) {
        delete readyOrders[uniqueKey]; // Clear from memory loop once called
        return res.json({ ready: true });
    }
    res.json({ ready: false });
});

// 2. Endpoint for baristas dispatching an alert
app.post('/api/buzz-order', (req, res) => {
    const loc = String(req.body.location || '1').trim().toLowerCase();
    const num = String(req.body.orderNumber || '').trim();
    
    if (!num) {
        return res.status(400).json({ success: false, error: 'Missing order number' });
    }

    const uniqueKey = `${loc}-${num}`;
    readyOrders[uniqueKey] = true;
    console.log(`🚀 Store #${loc} marked Order #${num} as READY!`);
    
    res.json({ success: true });
});

server = app.listen(PORT, () => {
    console.log(`🚀 Qamaria Core Alert Engine Live on port ${PORT}!`);
});
