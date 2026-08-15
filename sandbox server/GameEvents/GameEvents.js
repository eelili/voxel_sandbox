const EventManager = require('./EventManager.js');
const GameEvent = require('./GameEvent.js');

// 创建全局事件管理器实例
const events = new EventManager();

// 挂载到 globalThis，并保持引用
globalThis.events = events;

// 同时将 GameEvent 类暴露（可选）
globalThis.GameEvent = GameEvent;

module.exports = { events, EventManager, GameEvent };