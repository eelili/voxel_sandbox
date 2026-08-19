const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
require('./GameMath/GameMath.js');
require('./GameEvents/GameEvents.js');
require('./GameWorld.js');
require('./GameEntities/GameEntities.js');
const CDN = require('./cdn.js');
const cdn = new CDN(__dirname).load();
const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
cdn.register(app);
const PORT = 3000;
const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 门户服务启动: http://localhost:${PORT}`);
});
const wss = new WebSocket.Server({ server: httpServer });
global.broadcast = (message) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    for (const ws of wss.clients) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
        }
    }
};
wss.on('connection', (ws) => {
    console.log('🟢 客户端已连接');
    ws.send(JSON.stringify({
        type: 'asset_manifest',
        data: {
            building: '/assets/building.gz',
            manifest: '/assets/manifest.json',
            cdn_base: `http://localhost:${PORT}`
        }
    }));
    ws.on('message', (raw) => {
        console.log(`📩 门户收到 RPC: ${raw}`);
        ws.send(JSON.stringify({ type: 'rpc_echo', data: `门户已收到: ${raw}` }));
    });
    ws.on('close', () => console.log('🔴 客户端断开'));
});
console.log('🚀 门户已启动，等待客户端...');