// EventManager.js - 全局事件管理器（完整支持面向对象事件）
const GameEvent = require('./GameEvent.js');

// 内部事件秘钥（仅引擎内部使用）
const INTERNAL_SECRET = '5f3c9a2e8d1b7f4a6c0e9d2b8f4a7c1e3d5f9b2a4c6e8d0f1a3b5c7d9e0f2a4c';

class EventManager {
    constructor() {
        this._eventsByCode = new Map();
        this._nameToCode = new Map();
        this._maxCode = 10000;          // 自定义事件起始编号
        this._listenersByTarget = new WeakMap();
    }

    /**
     * 注册事件（业务事件与自定义事件共用此方法）
     * @param {string} name - 事件名称
     * @param {number|Object} codeOrOptions - 编号或配置对象
     * @param {Object} options - 配置（若第二个参数为编号）
     * @param {string} options.secret - 业务事件秘钥（内部号段必须提供）
     * @param {Function} options.targetType - 对象事件的目标类型构造函数（仅内部号段可用）
     * @returns {GameEvent} 事件实例
     */
    register(name, codeOrOptions, options = {}) {
        let code, secret, trigger, description, targetType;
        if (typeof codeOrOptions === 'number') {
            code = codeOrOptions;
            secret = options.secret || null;
            trigger = options.trigger || null;
            description = options.description || '';
            targetType = options.targetType || null;
        } else {
            // 自动分配编号
            options = codeOrOptions || {};
            code = this._maxCode + 1;
            while (this._eventsByCode.has(code)) {
                code++;
            }
            secret = options.secret || null;
            trigger = options.trigger || null;
            description = options.description || '';
            targetType = options.targetType || null;
        }

        // 检查名称唯一性
        if (this._nameToCode.has(name)) {
            throw new Error(`事件名称 "${name}" 已被占用`);
        }
        // 检查编号唯一性
        if (this._eventsByCode.has(code)) {
            throw new Error(`事件编号 ${code} 已被占用`);
        }

        // 内部号段（<10000）必须提供正确的 secret
        if (code < 10000) {
            if (secret !== INTERNAL_SECRET) {
                throw new Error(`注册内部号段事件 (code=${code}) 必须提供正确的 secret`);
            }
            // 内部号段允许指定 targetType（面向对象事件）
        } else {
            // 自定义事件禁止使用 secret 和 targetType
            if (secret) {
                throw new Error(`自定义事件 (code=${code}) 不允许指定 secret`);
            }
            if (targetType) {
                throw new Error(`自定义事件 (code=${code}) 不允许指定 targetType（仅内部号段可用）`);
            }
        }

        const event = new GameEvent(name, code, {
            description,
            trigger,
            secret,
            targetType
        });
        this._eventsByCode.set(code, event);
        this._nameToCode.set(name, code);
        if (code > this._maxCode) {
            this._maxCode = code;
        }
        return event;
    }

    /**
     * 注销事件（只能注销自定义事件）
     * @param {string|number} nameOrCode
     * @param {string} secret - 业务事件需提供密钥
     * @returns {boolean}
     */
    unregister(nameOrCode, secret) {
        const code = this._resolveCode(nameOrCode);
        if (code === null) return false;
        const event = this._eventsByCode.get(code);
        if (!event) return false;
        if (event._isBusiness && secret !== event._secret) {
            throw new Error('无权注销业务事件');
        }
        this._eventsByCode.delete(code);
        this._nameToCode.delete(event.name);
        return true;
    }

    /**
     * 检查事件是否存在
     * @param {string|number} nameOrCode
     * @returns {boolean}
     */
    has(nameOrCode) {
        return this._resolveCode(nameOrCode) !== null;
    }

    /**
     * 获取事件实例（仅供内部使用）
     * @param {string|number} nameOrCode
     * @returns {GameEvent|null}
     */
    _getEvent(nameOrCode) {
        const code = this._resolveCode(nameOrCode);
        return code !== null ? this._eventsByCode.get(code) : null;
    }

    /**
     * 监听事件
     * @param {string|number} nameOrCode
     * @param {Function} callback
     * @param {object|null} target
     * @returns {Object} 令牌 { cancel, resume, active }
     */
    on(nameOrCode, callback, target = null) {
        const event = this._getEvent(nameOrCode);
        if (!event) {
            throw new Error(`事件 ${nameOrCode} 不存在`);
        }
        return event._addListener(callback, target, this);
    }

    /**
     * 异步等待下一次事件触发
     * @param {string|number} nameOrCode
     * @param {object|null} target
     * @param {number} timeout
     * @returns {Promise<any>}
     */
    next(nameOrCode, target = null, timeout = 0) {
        const event = this._getEvent(nameOrCode);
        if (!event) {
            return Promise.reject(new Error(`事件 ${nameOrCode} 不存在`));
        }
        return new Promise((resolve) => {
            event._addNext(resolve, target);
            if (timeout > 0) {
                setTimeout(() => {
                    const idx = event._nextResolvers.findIndex(
                        item => item.resolve === resolve
                    );
                    if (idx !== -1) {
                        event._nextResolvers.splice(idx, 1);
                        resolve(null);
                    }
                }, timeout);
            }
        });
    }

    /**
     * 手动触发事件
     * @param {string|number} nameOrCode
     * @param {*} data
     * @param {object|null} target
     * @param {string} secret
     * @returns {boolean}
     */
    trigger(nameOrCode, data, target = null, secret = null) {
        const event = this._getEvent(nameOrCode);
        if (!event) return false;
        return event._trigger(data, target, secret);
    }

    /**
     * 自动轮询所有全局事件（由 world.onTick 调用）
     */
    poll() {
        for (const [code, event] of this._eventsByCode) {
            if (event._checkTrigger()) {
                event._trigger(null, null, event._secret);
            }
        }
    }

    /**
     * 移除目标对象上的所有监听器
     * @param {object} target
     */
    offTarget(target) {
        const targetMap = this._listenersByTarget.get(target);
        if (!targetMap) return;
        for (const [event, entrySet] of targetMap) {
            for (const entry of entrySet) {
                const idx = event._listeners.indexOf(entry);
                if (idx !== -1) {
                    event._listeners.splice(idx, 1);
                }
            }
        }
        this._listenersByTarget.delete(target);
    }

    _addListenerToTarget(target, event, entry) {
        if (!target) return;
        let targetMap = this._listenersByTarget.get(target);
        if (!targetMap) {
            targetMap = new Map();
            this._listenersByTarget.set(target, targetMap);
        }
        let entrySet = targetMap.get(event);
        if (!entrySet) {
            entrySet = new Set();
            targetMap.set(event, entrySet);
        }
        entrySet.add(entry);
    }

    _removeListenerFromTarget(target, event, entry) {
        if (!target) return;
        const targetMap = this._listenersByTarget.get(target);
        if (!targetMap) return;
        const entrySet = targetMap.get(event);
        if (!entrySet) return;
        entrySet.delete(entry);
        if (entrySet.size === 0) {
            targetMap.delete(event);
        }
        if (targetMap.size === 0) {
            this._listenersByTarget.delete(target);
        }
    }

    _resolveCode(nameOrCode) {
        if (typeof nameOrCode === 'number') {
            return this._eventsByCode.has(nameOrCode) ? nameOrCode : null;
        }
        if (typeof nameOrCode === 'string') {
            return this._nameToCode.get(nameOrCode) || null;
        }
        return null;
    }
}

globalThis.EventManager = EventManager;
module.exports = EventManager;