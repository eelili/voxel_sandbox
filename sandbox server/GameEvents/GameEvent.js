// GameEvent.js - 事件类（完整支持面向对象事件）
class GameEvent {
    constructor(name, code, options = {}) {
        this.name = name;
        this.code = code;
        this.description = options.description || '';
        this.trigger = options.trigger || null;
        this._secret = options.secret || null;
        this._isBusiness = !!options.secret;
        this._targetType = options.targetType || null;   // 对象事件的目标类型构造函数
        this._listeners = [];
        this._nextResolvers = [];
    }

    _addListener(callback, target, manager) {
        if (typeof callback !== 'function') {
            throw new Error('监听器必须是函数');
        }
        // 如果事件是对象事件，检查 target 类型
        if (this._targetType && target !== null && !(target instanceof this._targetType)) {
            throw new Error(`目标对象不是事件 "${this.name}" 要求的类型`);
        }
        const entry = { callback, target };
        const token = {
            cancel: () => {
                const idx = this._listeners.indexOf(entry);
                if (idx !== -1) {
                    this._listeners.splice(idx, 1);
                    if (target && manager) {
                        manager._removeListenerFromTarget(target, this, entry);
                    }
                }
            },
            resume: () => {
                if (!this._listeners.includes(entry)) {
                    this._listeners.push(entry);
                    if (target && manager) {
                        manager._addListenerToTarget(target, this, entry);
                    }
                }
            },
            active: () => this._listeners.includes(entry)
        };
        this._listeners.push(entry);
        if (target && manager) {
            manager._addListenerToTarget(target, this, entry);
        }
        return token;
    }

    _trigger(data, target, secret) {
        if (this._isBusiness && secret !== this._secret) {
            return false;
        }
        // 对象事件必须提供 target，且类型匹配
        if (this._targetType) {
            if (!target) {
                console.warn(`对象事件 ${this.name} 触发时必须提供 target`);
                return false;
            }
            if (!(target instanceof this._targetType)) {
                console.warn(`对象事件 ${this.name} 的 target 类型不匹配`);
                return false;
            }
        }
        // 通知监听器
        for (const entry of this._listeners) {
            if (entry.target !== null && entry.target !== target) {
                continue;   // 只匹配指定目标或全局监听（entry.target === null）
            }
            try {
                entry.callback(data);
            } catch (e) {
                console.error(`事件 ${this.name} 监听器出错:`, e);
            }
        }
        // 处理 next 等待器
        const resolvers = this._nextResolvers.slice();
        this._nextResolvers = [];
        for (const item of resolvers) {
            if (item.target !== null && item.target !== target) {
                continue;
            }
            try {
                item.resolve(data);
            } catch (e) {
                console.error(`next 回调出错:`, e);
            }
        }
        return true;
    }

    _checkTrigger() {
        if (this.trigger && !this._targetType) {
            try {
                return this.trigger() === true;
            } catch (e) {
                console.error(`事件 ${this.name} trigger 出错:`, e);
                return false;
            }
        }
        return false;
    }

    _addNext(resolve, target) {
        if (this._targetType && target !== null && !(target instanceof this._targetType)) {
            throw new Error(`目标对象不是事件 "${this.name}" 要求的类型`);
        }
        this._nextResolvers.push({ resolve, target });
    }

    _hasListeners() {
        return this._listeners.length > 0 || this._nextResolvers.length > 0;
    }
}

globalThis.GameEvent = GameEvent;
module.exports = GameEvent;