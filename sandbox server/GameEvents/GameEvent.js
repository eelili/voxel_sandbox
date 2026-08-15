// GameEvent.js - 事件类
class GameEvent {
    constructor(name, code, options = {}) {
        this.name = name;
        this.code = code;
        this.description = options.description || '';
        this.trigger = options.trigger || null;
        this._secret = options.secret || null;
        this._isBusiness = !!options.secret;
        this._targetType = options.targetType || null;
        this._listeners = [];
        this._nextResolvers = [];
    }

    _addListener(callback, target, manager) {
        if (typeof callback !== 'function') {
            throw new Error('监听器必须是函数');
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
        if (this._targetType && !target) {
            console.warn(`对象事件 ${this.name} 触发时必须提供 target`);
            return false;
        }
        for (const entry of this._listeners) {
            if (entry.target !== null && entry.target !== target) {
                continue;
            }
            try {
                entry.callback(data);
            } catch (e) {
                console.error(`事件 ${this.name} 监听器出错:`, e);
            }
        }
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
        this._nextResolvers.push({ resolve, target });
    }

    _hasListeners() {
        return this._listeners.length > 0 || this._nextResolvers.length > 0;
    }
}

globalThis.GameEvent = GameEvent;
module.exports = GameEvent;