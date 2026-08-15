// GameComplex.js - 复数
class GameComplex {
    constructor(real = 0, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    static fromPolar(r, theta) {
        return new GameComplex(r * Math.cos(theta), r * Math.sin(theta));
    }

    static fromAngle(theta) {
        return new GameComplex(Math.cos(theta), Math.sin(theta));
    }

    // 实例方法
    set(real, imag) {
        this.real = real;
        this.imag = imag;
        return this;
    }

    copy(c) {
        this.real = c.real;
        this.imag = c.imag;
        return this;
    }

    clone() {
        return new GameComplex(this.real, this.imag);
    }

    add(c) {
        return new GameComplex(this.real + c.real, this.imag + c.imag);
    }

    addEq(c) {
        this.real += c.real;
        this.imag += c.imag;
        return this;
    }

    sub(c) {
        return new GameComplex(this.real - c.real, this.imag - c.imag);
    }

    subEq(c) {
        this.real -= c.real;
        this.imag -= c.imag;
        return this;
    }

    mul(c) {
        const r = this.real * c.real - this.imag * c.imag;
        const i = this.real * c.imag + this.imag * c.real;
        return new GameComplex(r, i);
    }

    mulEq(c) {
        const r = this.real * c.real - this.imag * c.imag;
        const i = this.real * c.imag + this.imag * c.real;
        this.real = r;
        this.imag = i;
        return this;
    }

    div(c) {
        const denom = c.real * c.real + c.imag * c.imag;
        if (denom === 0) return new GameComplex(0, 0);
        const r = (this.real * c.real + this.imag * c.imag) / denom;
        const i = (this.imag * c.real - this.real * c.imag) / denom;
        return new GameComplex(r, i);
    }

    divEq(c) {
        const copy = this.div(c);
        this.real = copy.real;
        this.imag = copy.imag;
        return this;
    }

    scale(s) {
        return new GameComplex(this.real * s, this.imag * s);
    }

    scaleEq(s) {
        this.real *= s;
        this.imag *= s;
        return this;
    }

    conj() {
        return new GameComplex(this.real, -this.imag);
    }

    conjEq() {
        this.imag = -this.imag;
        return this;
    }

    mag() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }

    sqrMag() {
        return this.real * this.real + this.imag * this.imag;
    }

    angle() {
        return Math.atan2(this.imag, this.real);
    }

    normalize() {
        const len = this.mag();
        if (len === 0) return new GameComplex(0, 0);
        return this.scale(1 / len);
    }

    normalizeEq() {
        const len = this.mag();
        if (len !== 0) {
            this.real /= len;
            this.imag /= len;
        }
        return this;
    }

    // 与二维向量的转换
    toVector2() {
        return new GameVector2(this.real, this.imag);
    }

    static fromVector2(v) {
        return new GameComplex(v.x, v.y);
    }

    toVector3(z = 0) {
        return new GameVector3(this.real, this.imag, z);
    }

    toString() {
        return `GameComplex(${this.real}, ${this.imag})`;
    }
}

globalThis.GameComplex = GameComplex;
module.exports = GameComplex;