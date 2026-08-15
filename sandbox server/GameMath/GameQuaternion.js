// GameQuaternion.js - 四元数（扩展完整）
class GameQuaternion {
    constructor(w = 1, x = 0, y = 0, z = 0) {
        this.w = w; this.x = x; this.y = y; this.z = z;
    }

    static fromAxisAngle(axis, rad) {
        const half = rad * 0.5;
        const s = Math.sin(half);
        const c = Math.cos(half);
        const norm = axis.clone().normalize();
        return new GameQuaternion(c, norm.x*s, norm.y*s, norm.z*s);
    }
    static fromEuler(x, y, z) {
        // YZX顺序
        const c1=Math.cos(x*0.5), s1=Math.sin(x*0.5);
        const c2=Math.cos(y*0.5), s2=Math.sin(y*0.5);
        const c3=Math.cos(z*0.5), s3=Math.sin(z*0.5);
        const qx = s1*c2*c3 + c1*s2*s3;
        const qy = c1*s2*c3 - s1*c2*s3;
        const qz = c1*c2*s3 + s1*s2*c3;
        const qw = c1*c2*c3 - s1*s2*s3;
        return new GameQuaternion(qw, qx, qy, qz);
    }
    static rotationBetween(a, b) {
        const vecA = a.clone().normalize();
        const vecB = b.clone().normalize();
        const dot = vecA.dot(vecB);
        if (dot >= 1) return new GameQuaternion(1,0,0,0);
        if (dot <= -1) {
            const fallback = Math.abs(vecA.x) < 0.9 ? new GameVector3(1,0,0) : new GameVector3(0,1,0);
            const axis = vecA.cross(fallback).normalize();
            return new GameQuaternion(0, axis.x, axis.y, axis.z);
        }
        const axis = vecA.cross(vecB).normalize();
        const half = Math.acos(dot) * 0.5;
        const s = Math.sin(half);
        return new GameQuaternion(Math.cos(half), axis.x*s, axis.y*s, axis.z*s);
    }

    set(w,x,y,z) { this.w=w; this.x=x; this.y=y; this.z=z; return this; }
    copy(q) { this.w=q.w; this.x=q.x; this.y=q.y; this.z=q.z; return this; }
    clone() { return new GameQuaternion(this.w,this.x,this.y,this.z); }

    rotateX(rad) {
        const half=rad*0.5; const s=Math.sin(half), c=Math.cos(half);
        return new GameQuaternion(c,s,0,0).mul(this);
    }
    rotateY(rad) {
        const half=rad*0.5; const s=Math.sin(half), c=Math.cos(half);
        return new GameQuaternion(c,0,s,0).mul(this);
    }
    rotateZ(rad) {
        const half=rad*0.5; const s=Math.sin(half), c=Math.cos(half);
        return new GameQuaternion(c,0,0,s).mul(this);
    }

    add(q) { return new GameQuaternion(this.w+q.w, this.x+q.x, this.y+q.y, this.z+q.z); }
    sub(q) { return new GameQuaternion(this.w-q.w, this.x-q.x, this.y-q.y, this.z-q.z); }
    mul(q) {
        const w = this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z;
        const x = this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y;
        const y = this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x;
        const z = this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w;
        return new GameQuaternion(w,x,y,z);
    }
    inv() {
        const len=this.sqrMag();
        if (len===0) return new GameQuaternion(0,0,0,0);
        return new GameQuaternion(this.w/len, -this.x/len, -this.y/len, -this.z/len);
    }
    div(q) { return this.mul(q.inv()); }
    dot(q) { return this.w*q.w + this.x*q.x + this.y*q.y + this.z*q.z; }
    slerp(q, t) {
        let dot = this.dot(q);
        if (dot < 0) { q = q.clone().scale(-1); dot = -dot; }
        if (dot > 0.9995) {
            return new GameQuaternion(
                this.w + (q.w-this.w)*t,
                this.x + (q.x-this.x)*t,
                this.y + (q.y-this.y)*t,
                this.z + (q.z-this.z)*t
            ).normalize();
        }
        const theta = Math.acos(dot);
        const sinTheta = Math.sin(theta);
        const a = Math.sin((1-t)*theta)/sinTheta;
        const b = Math.sin(t*theta)/sinTheta;
        return new GameQuaternion(this.w*a+q.w*b, this.x*a+q.x*b, this.y*a+q.y*b, this.z*a+q.z*b);
    }
    angle(q) {
        const dot = Math.max(-1, Math.min(1, this.dot(q)));
        return Math.acos(dot)*2;
    }
    getAxisAngle() {
        const len = Math.sqrt(1 - this.w*this.w);
        if (len < 0.0001) return { axis: new GameVector3(1,0,0), angle: 0 };
        return { axis: new GameVector3(this.x/len, this.y/len, this.z/len), angle: 2*Math.acos(this.w) };
    }
    mag() { return Math.sqrt(this.sqrMag()); }
    sqrMag() { return this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z; }
    equals(q, eps=1e-6) {
        return Math.abs(this.w-q.w)<=eps && Math.abs(this.x-q.x)<=eps && Math.abs(this.y-q.y)<=eps && Math.abs(this.z-q.z)<=eps;
    }
    normalize() {
        const len=this.mag();
        if (len===0) return new GameQuaternion(0,0,0,0);
        return new GameQuaternion(this.w/len, this.x/len, this.y/len, this.z/len);
    }
    normalizeEq() {
        const len=this.mag();
        if (len!==0) { this.w/=len; this.x/=len; this.y/=len; this.z/=len; }
        return this;
    }

    // ===== 新增扩展 =====
    // 旋转向量
    rotateVector(v) {
        const q = this;
        const pure = new GameQuaternion(0, v.x, v.y, v.z);
        const rotated = q.mul(pure).mul(q.inv());
        return new GameVector3(rotated.x, rotated.y, rotated.z);
    }

    // 转换为欧拉角（YZX顺序）
    toEuler() {
        return GameEuler.fromQuaternion(this);
    }

    toString() { return `GameQuaternion(${this.w},${this.x},${this.y},${this.z})`; }
}

globalThis.GameQuaternion = GameQuaternion;
module.exports = GameQuaternion;