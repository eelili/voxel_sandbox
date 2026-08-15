// GameWorld.js - 沙盒世界核心对象
// 提供地图基础信息（只读）并驱动全局 tick 事件（code=1）
// 依赖：全局 events 对象（由 EventSystem 提供）

const fs = require('fs');
const path = require('path');

// 引擎内部业务事件秘钥（硬编码）
const ENGINE_SECRET = '5f3c9a2e8d1b7f4a6c0e9d2b8f4a7c1e3d5f9b2a4c6e8d0f1a3b5c7d9e0f2a4c';

class GameWorld {
    constructor() {
        // ---------- 只读属性存储 ----------
        this._info = this._loadInfo();
        this._tick = 0;

        // ---------- 引擎内部属性 ----------
        this._timer = null;

        // 注册 tick 业务事件（内部号段 code=1）
        this._registerTickEvent();
        // 启动 tick 循环
        this._startTickLoop();
    }

    /**
     * 从 temp/inf.json 加载地图元数据
     * 若文件不存在或解析失败，使用默认值
     */
    _loadInfo() {
        const infoPath = path.join(__dirname, 'temp', 'inf.json');
        try {
            const content = fs.readFileSync(infoPath, 'utf-8');
            const data = JSON.parse(content);
            return {
                name: data.name || '未命名地图',
                id: data.id || 'unknown',
                version: data.version || '1.0.0',
                author: data.author || '',
                description: data.description || ''
            };
        } catch (e) {
            console.warn('[GameWorld] 无法读取 inf.json，使用默认信息');
            return {
                name: '未命名地图',
                id: 'unknown',
                version: '1.0.0',
                author: '',
                description: ''
            };
        }
    }

    /**
     * 通过全局 events 注册 tick 事件
     */
    _registerTickEvent() {
        if (typeof globalThis.events === 'undefined') {
            console.error('[GameWorld] 事件系统未就绪，无法注册 tick 事件');
            return;
        }
        try {
            globalThis.events.register('tick', 1, {
                description: '世界每帧触发',
                secret: ENGINE_SECRET,
                trigger: () => true // 始终满足触发条件，由定时器手动触发
            });
        } catch (e) {
            console.warn('[GameWorld] tick 事件注册失败，可能已存在:', e.message);
        }
    }

    /**
     * 启动定时器，每 64ms 触发一次 tick
     * 更新内部计数器并触发全局事件 'tick'
     */
    _startTickLoop() {
        const interval = 64; // 毫秒
        this._timer = setInterval(() => {
            this._tick++;
            // 手动触发 tick 事件（需传入秘钥）
            if (typeof globalThis.events !== 'undefined') {
                globalThis.events.trigger('tick', { tick: this._tick }, null, ENGINE_SECRET);
            } else {
                console.warn('[GameWorld] 事件系统未就绪，无法触发 tick');
            }
        }, interval);
    }

    // ---------- 公开只读属性（通过 get 访问） ----------
    get tick() {
        return this._tick;
    }

    get name() {
        return this._info.name;
    }

    get id() {
        return this._info.id;
    }

    get version() {
        return this._info.version;
    }

    get author() {
        return this._info.author;
    }

    get description() {
        return this._info.description;
    }

    // ---------- 可选的销毁方法（用于服务器关闭时清理） ----------
    destroy() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        console.log('[GameWorld] 已销毁');
    }
}

// 实例化并挂载到全局
const world = new GameWorld();
globalThis.world = world;

// 导出实例（供其他模块使用）
module.exports = world;