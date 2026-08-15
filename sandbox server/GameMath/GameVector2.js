// GameVector2.js - 二维向量
class GameVector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // 静态方法
    static fromAngle(angle, length = 1) {
        return new GameVector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    static fromArray(arr) {
        return new GameVector2(arr[0] || 0, arr[1] || 0);
    }

    static random() {
        return new GameVector2(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }

    // 实例方法
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    clone() {
        return new GameVector2(this.x, this.y);
    }

    add(v) {
        return new GameVector2(this.x + v.x, this.y + v.y);
    }

    addEq(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        return new GameVector2(this.x - v.x, this.y - v.y);
    }

    subEq(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mul(v) {
        return new GameVector2(this.x * v.x, this.y * v.y);
    }

    mulEq(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    div(v) {
        return new GameVector2(this.x / v.x, this.y / v.y);
    }

    divEq(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    scale(s) {
        return new GameVector2(this.x * s, this.y * s);
    }

    scaleEq(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    sqrMag() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const len = this.mag();
        if (len === 0) return new GameVector2(0, 0);
        return this.scale(1 / len);
    }

    normalizeEq() {
        const len = this.mag();
        if (len !== 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    rotate(rad) {
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return new GameVector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    rotateEq(rad) {
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }

    distance(v) {
        return this.sub(v).mag();
    }

    lerp(v, t) {
        return new GameVector2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
    }

    equals(v, eps = 0.000001) {
        return Math.abs(this.x - v.x) <= eps && Math.abs(this.y - v.y) <= eps;
    }

    toArray() {
        return [this.x, this.y];
    }

    toVector3(z = 0) {
        return new GameVector3(this.x, this.y, z);
    }

    toString() {
        return `GameVector2(${this.x}, ${this.y})`;
    }
}

globalThis.GameVector2 = GameVector2;
module.exports = GameVector2;