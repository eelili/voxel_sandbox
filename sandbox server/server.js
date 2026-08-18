// server.js (开头部分)
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// server.js - 服务入口（仅加载已重构的核心模块）
// 所有引用使用相对于脚本文件的路径

// 1. 数学库
require('./GameMath/GameMath.js');

// 2. 事件系统（自动挂载全局 events）
require('./GameEvents/GameEvents.js');

// 3. 世界核心（自动注册 tick 事件并启动循环）
require('./GameWorld.js');

// server.js 中原本引用 cdn 的位置改为：
const CDN = require('./cdn.js');
const cdn = new CDN(__dirname).load();   // 在启动时加载并压缩
cdn.register(app);

console.log('[server] 核心模块加载完成，等待 tick 事件...');

// 5. 读取 RPC 映射（仅用于测试）
const mappingsPath = path.join(__dirname, 'rpc_mappings.json');
let rpcMappings = {};
if (fs.existsSync(mappingsPath)) {
    rpcMappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));
    console.log('📋 已加载 RPC 映射:', Object.keys(rpcMappings));
}

// 6. 创建 HTTP 服务
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

// 7. WebSocket 服务
const wss = new WebSocket.Server({ server: httpServer });

// 暴露广播方法供外部模块调用
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

    // 发送资产清单
    ws.send(JSON.stringify({
        type: 'asset_manifest',
        data: {
            building: '/assets/building.gz',
            manifest: '/assets/manifest.json',
            cdn_base: `http://localhost:${PORT}`
        }
    }));

    // RPC 消息透传（回显测试）
    ws.on('message', (raw) => {
        console.log(`📩 门户收到 RPC: ${raw}`);
        ws.send(JSON.stringify({
            type: 'rpc_echo',
            data: `门户已收到: ${raw}`
        }));
    });

    ws.on('close', () => console.log('🔴 客户端断开'));
});

// 8. 启动两个同步模块
renderSync.init();   // 启动渲染数据同步
weatherSync.init();  // 启动天气数据同步

console.log('🚀 门户已启动，等待客户端...');