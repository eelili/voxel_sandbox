// GameEntities.js - 全局实体管理器
const GameEntity = require('./GameEntity.js');

// 内部事件秘钥（与 EventManager 保持一致）
const INTERNAL_SECRET = '5f3c9a2e8d1b7f4a6c0e9d2b8f4a7c1e3d5f9b2a4c6e8d0f1a3b5c7d9e0f2a4c';

class GameEntities {
    constructor() {
        this._entities = [];
        this._nextId = 1;
        this._maxQuota = 1000;
        this._registerInternalEvents();
    }

    // ---------- 内部事件注册 ----------
    _registerInternalEvents() {
        if (typeof globalThis.events === 'undefined') {
            console.warn('GameEntities: 事件系统未就绪，内部事件将不会注册');
            return;
        }
        const events = globalThis.events;
        const targetType = GameEntity;

        // 定义所有内部事件：名称、编号、描述
        const eventDefs = [
            ['entity_create', 3101, '实体创建时触发'],
            ['entity_destroy', 3102, '实体销毁时触发'],
            ['entity_damage', 3103, '实体受到伤害时触发'],
            ['entity_die', 3104, '实体死亡时触发'],
            ['entity_click', 3105, '实体被点击时触发'],
            ['entity_interact', 3106, '实体被互动时触发'],
            ['entity_speak', 3107, '实体说话时触发'],
            ['entity_contact_start', 3108, '实体开始接触其他实体时触发'],
            ['entity_contact_end', 3109, '实体结束接触其他实体时触发'],
            ['entity_voxel_contact', 3110, '实体开始接触方块时触发'],
            ['entity_voxel_separate', 3111, '实体结束接触方块时触发'],
            ['entity_fluid_enter', 3112, '实体进入流体时触发'],
            ['entity_fluid_leave', 3113, '实体离开流体时触发']
        ];

        for (const [name, code, description] of eventDefs) {
            try {
                events.register(name, code, {
                    secret: INTERNAL_SECRET,
                    targetType,
                    description
                });
            } catch (e) {
                console.warn(`GameEntities: 注册事件 ${name} 失败 (可能已存在)`, e.message);
            }
        }
    }

    // ---------- 内部删除（由 GameEntity.destroy 调用） ----------
    _remove(entity) {
        const idx = this._entities.indexOf(entity);
        if (idx !== -1) {
            this._entities.splice(idx, 1);
        }
    }

    // ---------- 核心 API ----------
    create(config = {}) {
        if (this.getQuota() <= 0) {
            console.warn('实体数量已达到上限');
            return null;
        }
        const entity = new GameEntity();
        entity.id = `entity_${this._nextId++}`;
        // 合并配置
        if (config.position) entity.position.copy(config.position);
        if (config.velocity) entity.velocity.copy(config.velocity);
        if (config.name !== undefined) entity.name = config.name;
        if (config.tags) entity.tags = config.tags.slice();
        if (config.model !== undefined) entity.model = config.model;
        if (config.rotation) entity.rotation.copy(config.rotation);
        if (config.scale) entity.scale.copy(config.scale);
        if (config.color) entity.color.copy(config.color);
        if (config.visible !== undefined) entity.visible = config.visible;
        if (config.emissive !== undefined) entity.emissive = config.emissive;
        if (config.metalness !== undefined) entity.metalness = config.metalness;
        if (config.shininess !== undefined) entity.shininess = config.shininess;
        if (config.modelOffset) entity.modelOffset.copy(config.modelOffset);
        if (config.bounds) entity.bounds.copy(config.bounds);
        if (config.collides !== undefined) entity.collides = config.collides;
        if (config.fixed !== undefined) entity.fixed = config.fixed;
        if (config.friction !== undefined) entity.friction = config.friction;
        if (config.gravity !== undefined) entity.gravity = config.gravity;
        if (config.mass !== undefined) entity.mass = config.mass;
        if (config.restitution !== undefined) entity.restitution = config.restitution;
        if (config.enableInteract !== undefined) entity.enableInteract = config.enableInteract;
        if (config.interactRadius !== undefined) entity.interactRadius = config.interactRadius;
        if (config.interactHint !== undefined) entity.interactHint = config.interactHint;
        if (config.interactColor) entity.interactColor.copy(config.interactColor);
        if (config.enableDamage !== undefined) entity.enableDamage = config.enableDamage;
        if (config.showHealthBar !== undefined) entity.showHealthBar = config.showHealthBar;
        if (config.hp !== undefined) entity.hp = config.hp;
        if (config.maxHp !== undefined) entity.maxHp = config.maxHp;

        this._entities.push(entity);

        // 触发创建事件
        if (typeof globalThis.events !== 'undefined') {
            const tick = globalThis.world ? globalThis.world.tick : 0;
            globalThis.events.trigger('entity_create', { entity, tick }, entity);
        }
        return entity;
    }

    destroy(entity) {
        if (!(entity instanceof GameEntity)) {
            console.warn('entities.destroy: 参数必须是 GameEntity 实例');
            return false;
        }
        if (entity.destroyed) return false;
        entity.destroy();
        return true;
    }

    // ---------- 查询 API ----------
    findAll() {
        return this._entities.slice();
    }

    findById(id) {
        return this._entities.find(e => e.id === id) || null;
    }

    findByTag(tag) {
        return this._entities.filter(e => e.tags.includes(tag));
    }

    findByName(name) {
        return this._entities.filter(e => e.name === name);
    }

    findByType(type) {
        if (type === 'player') {
            return this._entities.filter(e => e.isPlayer === true);
        }
        return this._entities.filter(e => e.isPlayer !== true);
    }

    // 通用查询：支持字符串选择器（#id, .tag, player, *）或对象过滤器
    query(selector) {
        if (typeof selector === 'string') {
            const trimmed = selector.trim();
            if (trimmed === '*') return this._entities.slice();
            if (trimmed === 'player') return this.findByType('player');
            if (trimmed.startsWith('#')) {
                const id = trimmed.slice(1);
                const found = this.findById(id);
                return found ? [found] : [];
            }
            if (trimmed.startsWith('.')) {
                const tag = trimmed.slice(1);
                return this.findByTag(tag);
            }
            // 未匹配的选择器返回空数组
            console.warn(`entities.query: 未知选择器 "${selector}"`);
            return [];
        } else if (typeof selector === 'object' && selector !== null) {
            // 对象过滤器：例如 { tag: 'box', name: 'npc' }
            let results = this._entities.slice();
            for (const [key, value] of Object.entries(selector)) {
                if (key === 'id') {
                    results = results.filter(e => e.id === value);
                } else if (key === 'name') {
                    results = results.filter(e => e.name === value);
                } else if (key === 'tag') {
                    results = results.filter(e => e.tags.includes(value));
                } else if (key === 'type') {
                    results = results.filter(e => e.isPlayer === (value === 'player'));
                } else if (key === 'tags') {
                    // 支持标签数组，要求实体包含所有标签
                    if (Array.isArray(value)) {
                        results = results.filter(e => value.every(t => e.tags.includes(t)));
                    }
                } else {
                    // 直接比较属性
                    results = results.filter(e => e[key] === value);
                }
            }
            return results;
        }
        return [];
    }

    findInBox(bounds) {
        if (!(bounds instanceof GameBounds3)) {
            console.warn('entities.findInBox: 参数必须是 GameBounds3 实例');
            return [];
        }
        return this._entities.filter(e => bounds.contains(e.position));
    }

    findInSphere(center, radius) {
        if (!(center instanceof GameVector3) || typeof radius !== 'number') {
            console.warn('entities.findInSphere: 参数无效');
            return [];
        }
        const r2 = radius * radius;
        return this._entities.filter(e => e.position.distanceSq(center) <= r2);
    }

    findNearest(position, filter = null) {
        if (!(position instanceof GameVector3)) {
            console.warn('entities.findNearest: 参数必须是 GameVector3');
            return null;
        }
        let candidates = this._entities;
        if (typeof filter === 'function') {
            candidates = candidates.filter(filter);
        }
        let nearest = null;
        let minDist = Infinity;
        for (const e of candidates) {
            const dist = e.position.distance(position);
            if (dist < minDist) {
                minDist = dist;
                nearest = e;
            }
        }
        return nearest;
    }

    // ---------- 配额 ----------
    getQuota() {
        return this._maxQuota - this._entities.length;
    }

    count() {
        return this._entities.length;
    }

    setMaxQuota(quota) {
        if (typeof quota === 'number' && quota >= 0) {
            this._maxQuota = quota;
        }
    }
}

// 实例化并挂载到全局
const entities = new GameEntities();
globalThis.entities = entities;

module.exports = entities;