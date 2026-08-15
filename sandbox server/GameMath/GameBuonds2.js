// GameBounds2.js - 二维包围盒
class GameBounds2 {
    constructor(lo = new GameVector2(), hi = new GameVector2()) {
        this.lo = lo.clone();
        this.hi = hi.clone();
    }

    static fromPoints(...points) {
        if (points.length === 0) return new GameBounds2();
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
        return new GameBounds2(new GameVector2(minX, minY), new GameVector2(maxX, maxY));
    }

    get center() {
        return new GameVector2((this.lo.x + this.hi.x) / 2, (this.lo.y + this.hi.y) / 2);
    }

    get size() {
        return new GameVector2(this.hi.x - this.lo.x, this.hi.y - this.lo.y);
    }

    get halfSize() {
        return this.size.scale(0.5);
    }

    set(lo, hi) {
        this.lo.copy(lo);
        this.hi.copy(hi);
        return this;
    }

    copy(b) {
        this.lo.copy(b.lo);
        this.hi.copy(b.hi);
        return this;
    }

    clone() {
        return new GameBounds2(this.lo.clone(), this.hi.clone());
    }

    contains(v) {
        return v.x >= this.lo.x && v.x <= this.hi.x && v.y >= this.lo.y && v.y <= this.hi.y;
    }

    intersects(b) {
        return !(this.lo.x > b.hi.x || this.hi.x < b.lo.x ||
                 this.lo.y > b.hi.y || this.hi.y < b.lo.y);
    }

    intersect(b) {
        const newLo = new GameVector2(
            Math.max(this.lo.x, b.lo.x),
            Math.max(this.lo.y, b.lo.y)
        );
        const newHi = new GameVector2(
            Math.min(this.hi.x, b.hi.x),
            Math.min(this.hi.y, b.hi.y)
        );
        if (newLo.x > newHi.x || newLo.y > newHi.y) return null;
        return new GameBounds2(newLo, newHi);
    }

    union(b) {
        const lo = new GameVector2(Math.min(this.lo.x, b.lo.x), Math.min(this.lo.y, b.lo.y));
        const hi = new GameVector2(Math.max(this.hi.x, b.hi.x), Math.max(this.hi.y, b.hi.y));
        return new GameBounds2(lo, hi);
    }

    expand(v) {
        const lo = this.lo.clone().sub(v);
        const hi = this.hi.clone().add(v);
        return new GameBounds2(lo, hi);
    }

    expandEq(v) {
        this.lo.subEq(v);
        this.hi.addEq(v);
        return this;
    }

    toBounds3(zLo = 0, zHi = 0) {
        return new GameBounds3(
            new GameVector3(this.lo.x, this.lo.y, zLo),
            new GameVector3(this.hi.x, this.hi.y, zHi)
        );
    }

    toString() {
        return `GameBounds2(lo: ${this.lo}, hi: ${this.hi})`;
    }
}

globalThis.GameBounds2 = GameBounds2;
module.exports = GameBounds2;