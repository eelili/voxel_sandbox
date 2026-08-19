class GameEntity {
    constructor(worldRef = null) {
        this._world = worldRef || globalThis.world;
        this.id = '';
        this.name = '';
        this.tags = [];
        this.model = '';
        this.position = new GameVector3(0, 0, 0);
        this.rotation = new GameEuler(0, 0, 0);
        this.scale = new GameVector3(1, 1, 1);
        this.color = new GameRGBAColor(1, 1, 1, 1);
        this.visible = true;
        this.emissive = 0;
        this.metalness = 0;
        this.shininess = 0;
        this.modelOffset = new GameVector3(0, 0, 0);
        this.bounds = new GameVector3(1, 1, 1);
        this.collides = true;
        this.fixed = false;
        this.friction = 0;
        this.gravity = true;
        this.mass = 1;
        this.restitution = 0;
        this.velocity = new GameVector3(0, 0, 0);
        this.contactForce = new GameVector3(0, 0, 0);
        this.entityContacts = [];
        this.voxelContacts = [];
        this.fluidContacts = [];
        this.enableInteract = false;
        this.interactRadius = 16;
        this.interactHint = '';
        this.interactColor = new GameRGBColor(0, 1, 0);
        this.destroyed = false;
        this.enableDamage = false;
        this.showHealthBar = true;
        this.hp = 100;
        this.maxHp = 100;
        this._hurting = null;
    }

    lookAt(targetPosition, upDirection = new GameVector3(0, 1, 0)) {
        const defaultDir = new GameVector3(0, 0, 1);
        const dir = targetPosition.clone().sub(this.position).normalize();
        const quat = GameQuaternion.rotationBetween(defaultDir, dir);
        this.rotation = GameEuler.fromQuaternion(quat);
    }

    speak(message, options = { duration: 2000 }) {
        if (typeof global.broadcast === 'function') {
            global.broadcast({
                type: 'entity_speak',
                data: { entityId: this.id, message, options }
            });
        }
        if (typeof globalThis.events !== 'undefined') {
            globalThis.events.trigger('entity_speak', {
                entity: this,
                message,
                options,
                tick: this._world ? this._world.tick : 0
            }, this);
        }
    }

    hurt(amount, options = {}) {
        if (this.destroyed) return;
        if (!this.enableDamage && !options.force) return;
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;

        if (this._hurting) {
            clearTimeout(this._hurting);
            this._hurting = null;
        }
        this._hurting = setTimeout(() => { this._hurting = null; }, 128);

        if (typeof globalThis.events !== 'undefined') {
            globalThis.events.trigger('entity_damage', {
                entity: this,
                damage: amount,
                attacker: options.attacker || null,
                type: options.type || '',
                tick: this._world ? this._world.tick : 0
            }, this);
        }

        if (this.hp <= 0) {
            if (typeof globalThis.events !== 'undefined') {
                globalThis.events.trigger('entity_die', {
                    entity: this,
                    attacker: options.attacker || null,
                    type: options.type || '',
                    tick: this._world ? this._world.tick : 0
                }, this);
            }
            this.destroy();
        }
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        if (globalThis.entities && typeof globalThis.entities._remove === 'function') {
            globalThis.entities._remove(this);
        }
        if (typeof globalThis.events !== 'undefined') {
            globalThis.events.trigger('entity_destroy', {
                entity: this,
                tick: this._world ? this._world.tick : 0
            }, this);
        }
    }

    createAnimation() { return null; }
    getAnimations() { return []; }
}

globalThis.GameEntity = GameEntity;