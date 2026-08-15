// GameBounds3.js - 三维轴对齐包围盒（仅 AABB 自身碰撞）
class GameBounds3 {
    constructor(lo = new GameVector3(), hi = new GameVector3()) {
        this.lo = lo.clone();
        this.hi = hi.clone();
    }

    static fromPoints(...points) {
        if (points.length === 0) return new GameBounds3();
        let minX=Infinity, minY=Infinity, minZ=Infinity;
        let maxX=-Infinity, maxY=-Infinity, maxZ=-Infinity;
        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
            if (p.z < minZ) minZ = p.z;
            if (p.z > maxZ) maxZ = p.z;
        }
        return new GameBounds3(new GameVector3(minX,minY,minZ), new GameVector3(maxX,maxY,maxZ));
    }

    set(lox, loy, loz, hix, hiy, hiz) {
        this.lo.set(lox, loy, loz);
        this.hi.set(hix, hiy, hiz);
        return this;
    }
    copy(b) { this.lo.copy(b.lo); this.hi.copy(b.hi); return this; }
    clone() { return new GameBounds3(this.lo.clone(), this.hi.clone()); }

    // ---------- 仅 AABB‑AABB 碰撞检测 ----------
    intersect(b) {
        const newLo = new GameVector3(Math.max(this.lo.x,b.lo.x), Math.max(this.lo.y,b.lo.y), Math.max(this.lo.z,b.lo.z));
        const newHi = new GameVector3(Math.min(this.hi.x,b.hi.x), Math.min(this.hi.y,b.hi.y), Math.min(this.hi.z,b.hi.z));
        if (newLo.x > newHi.x || newLo.y > newHi.y || newLo.z > newHi.z) return null;
        return new GameBounds3(newLo, newHi);
    }
    intersects(b) {
        return !(this.lo.x > b.hi.x || this.hi.x < b.lo.x ||
                 this.lo.y > b.hi.y || this.hi.y < b.lo.y ||
                 this.lo.z > b.hi.z || this.hi.z < b.lo.z);
    }
    contains(v) {
        return v.x >= this.lo.x && v.x <= this.hi.x &&
               v.y >= this.lo.y && v.y <= this.hi.y &&
               v.z >= this.lo.z && v.z <= this.hi.z;
    }
    containsBounds(b) {
        return b.lo.x >= this.lo.x && b.hi.x <= this.hi.x &&
               b.lo.y >= this.lo.y && b.hi.y <= this.hi.y &&
               b.lo.z >= this.lo.z && b.hi.z <= this.hi.z;
    }

    // ---------- 辅助属性 ----------
    get center() {
        return new GameVector3((this.lo.x+this.hi.x)/2, (this.lo.y+this.hi.y)/2, (this.lo.z+this.hi.z)/2);
    }
    get size() {
        return new GameVector3(this.hi.x-this.lo.x, this.hi.y-this.lo.y, this.hi.z-this.lo.z);
    }
    get halfSize() {
        return this.size.scale(0.5);
    }

    expand(v) {
        const lo = this.lo.clone().sub(v);
        const hi = this.hi.clone().add(v);
        return new GameBounds3(lo, hi);
    }
    expandEq(v) {
        this.lo.subEq(v);
        this.hi.addEq(v);
        return this;
    }

    // 降维到二维（仅投影，不涉及旋转）
    toBounds2() {
        return new GameBounds2(
            new GameVector2(this.lo.x, this.lo.y),
            new GameVector2(this.hi.x, this.hi.y)
        );
    }

    toString() { return `GameBounds3(lo: ${this.lo}, hi: ${this.hi})`; }
}

globalThis.GameBounds3 = GameBounds3;
module.exports = GameBounds3;