// GameEnvironment.js - 环境、天气、光照控制器
// 通过全局对象 environment 访问
// 依赖：events（tick 事件），world（用于获取 tick 值）

const fs = require('fs');
const path = require('path');

// 广播函数（由 server.js 提供）
let broadcast = null;

class GameEnvironment {
    constructor() {
        // ---------- 静态配置 ----------
        this._config = this._loadConfig();
        this._state = this._initState();

        // ---------- 监听 tick 事件 ----------
        this._tickToken = null;
        this._registerTick();
    }

    _loadConfig() {
        const configPath = path.join(__dirname, 'temp', 'env.json');
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.warn('[GameEnvironment] 无法读取 env.json，使用默认配置');
            return this._defaultConfig();
        }
    }

    _defaultConfig() {
        return {
            fog: { color: [1,1,1], density: 0.5, heightOffset: 0, heightFalloff: 0.8, startDistance: 0, maxFog: 1 },
            light: { mode: 'natural', sunFrequency: 0.001, sunPhase: 0.25, sunDirection: [0,-1,0], sunLight: [1000,1000,1000], ambient: { left:[0,0,0], right:[0,0,0], bottom:[0,0,0], top:[0,0,0], front:[0,0,0], back:[0,0,0] } },
            precipitation: { type: 'none', density: 0, speed: 1, size: 0.5, color: [1,1,1,1], texture: '', direction: [0,1,0] },
            wind: { speed: 0, direction: [1,0,0] }
        };
    }

    _initState() {
        const cfg = this._config;
        return {
            fog: {
                color: cfg.fog.color.slice(),
                density: cfg.fog.density,
                heightOffset: cfg.fog.heightOffset,
                heightFalloff: cfg.fog.heightFalloff,
                startDistance: cfg.fog.startDistance,
                maxFog: cfg.fog.maxFog
            },
            light: {
                mode: cfg.light.mode,
                sunFrequency: cfg.light.sunFrequency,
                sunPhase: cfg.light.sunPhase,
                sunDirection: cfg.light.sunDirection.slice(),
                sunLight: cfg.light.sunLight.slice(),
                ambient: {
                    left: cfg.light.ambient.left.slice(),
                    right: cfg.light.ambient.right.slice(),
                    bottom: cfg.light.ambient.bottom.slice(),
                    top: cfg.light.ambient.top.slice(),
                    front: cfg.light.ambient.front.slice(),
                    back: cfg.light.ambient.back.slice()
                }
            },
            precipitation: {
                type: cfg.precipitation.type,
                density: cfg.precipitation.density,
                speed: cfg.precipitation.speed,
                size: cfg.precipitation.size,
                color: cfg.precipitation.color.slice(),
                texture: cfg.precipitation.texture,
                direction: cfg.precipitation.direction.slice()
            },
            wind: {
                speed: cfg.wind.speed,
                direction: cfg.wind.direction.slice()
            }
        };
    }

    _registerTick() {
        if (typeof globalThis.events === 'undefined') {
            console.error('[GameEnvironment] 事件系统未就绪');
            return;
        }
        this._tickToken = globalThis.events.on('tick', () => {
            this._update();
            this._broadcast();
        });
        console.log('[GameEnvironment] 已启动，每帧更新并广播状态');
    }

    _update() {
        // 更新太阳相位（仅 natural 模式）
        if (this._state.light.mode === 'natural') {
            const freq = this._state.light.sunFrequency || 0;
            const phase = this._state.light.sunPhase || 0;
            // 每 tick 增加 sunFrequency，范围 0~1
            this._state.light.sunPhase = (phase + freq) % 1;
        }
        // 其他动态属性可在此扩展（例如风力随机变化等）
    }

    _broadcast() {
        if (typeof globalThis.broadcast === 'function') {
            const payload = {
                type: 'environment_state',
                data: {
                    fog: this._state.fog,
                    light: {
                        mode: this._state.light.mode,
                        sunPhase: this._state.light.sunPhase,
                        sunDirection: this._state.light.sunDirection,
                        sunLight: this._state.light.sunLight,
                        ambient: this._state.light.ambient
                    },
                    precipitation: this._state.precipitation,
                    wind: this._state.wind
                }
            };
            globalThis.broadcast(payload);
        }
    }

    // ---------- 公开只读属性 ----------
    get fog() { return this._state.fog; }
    get light() { return this._state.light; }
    get precipitation() { return this._state.precipitation; }
    get wind() { return this._state.wind; }

    // ---------- 可选：销毁 ----------
    destroy() {
        if (this._tickToken) {
            this._tickToken.cancel();
            this._tickToken = null;
        }
        console.log('[GameEnvironment] 已销毁');
    }
}

// 实例化并挂载到全局
const environment = new GameEnvironment();
globalThis.environment = environment;

// 暴露广播设置方法（由 server.js 调用）
environment._setBroadcast = function(fn) {
    globalThis.broadcast = fn;
};

module.exports = environment;