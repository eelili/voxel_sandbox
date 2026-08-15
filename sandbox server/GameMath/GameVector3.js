// GameVector3.js - 三维向量（扩展完整）
class GameVector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x; this.y = y; this.z = z;
    }

    static fromPolar(mag, phi, theta) { /* ... 原有 ... */ }
    set(x,y,z) { this.x=x; this.y=y; this.z=z; return this; }
    copy(v) { this.x=v.x; this.y=v.y; this.z=v.z; return this; }
    clone() { return new GameVector3(this.x,this.y,this.z); }

    add(v) { return new GameVector3(this.x+v.x, this.y+v.y, this.z+v.z); }
    addEq(v) { this.x+=v.x; this.y+=v.y; this.z+=v.z; return this; }
    sub(v) { return new GameVector3(this.x-v.x, this.y-v.y, this.z-v.z); }
    subEq(v) { this.x-=v.x; this.y-=v.y; this.z-=v.z; return this; }
    mul(v) { return new GameVector3(this.x*v.x, this.y*v.y, this.z*v.z); }
    mulEq(v) { this.x*=v.x; this.y*=v.y; this.z*=v.z; return this; }
    div(v) { return new GameVector3(this.x/v.x, this.y/v.y, this.z/v.z); }
    divEq(v) { this.x/=v.x; this.y/=v.y; this.z/=v.z; return this; }
    dot(v) { return this.x*v.x + this.y*v.y + this.z*v.z; }
    cross(v) { return new GameVector3(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x); }
    scale(s) { return new GameVector3(this.x*s, this.y*s, this.z*s); }
    scaleEq(s) { this.x*=s; this.y*=s; this.z*=s; return this; }
    lerp(v,t) { const inv=1-t; return new GameVector3(this.x*inv+v.x*t, this.y*inv+v.y*t, this.z*inv+v.z*t); }
    towards(v) { return v.clone().sub(this).normalize(); }
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); }
    sqrMag() { return this.x*this.x + this.y*this.y + this.z*this.z; }
    angle(v) { const dot=this.dot(v); const mag=this.mag()*v.mag(); return Math.acos(Math.max(-1,Math.min(1,dot/mag))); }
    distance(v) { return this.sub(v).mag(); }
    equals(v, eps=1e-6) { return Math.abs(this.x-v.x)<=eps && Math.abs(this.y-v.y)<=eps && Math.abs(this.z-v.z)<=eps; }
    exactEquals(v) { return this.x===v.x && this.y===v.y && this.z===v.z; }
    max(v) { return new GameVector3(Math.max(this.x,v.x), Math.max(this.y,v.y), Math.max(this.z,v.z)); }
    min(v) { return new GameVector3(Math.min(this.x,v.x), Math.min(this.y,v.y), Math.min(this.z,v.z)); }
    normalize() { const len=this.mag(); return len===0 ? new GameVector3(0,0,0) : this.scale(1/len); }
    normalizeEq() { const len=this.mag(); if(len!==0){ this.x/=len; this.y/=len; this.z/=len; } return this; }

    // ===== 新增扩展 =====
    // 旋转向量（通过四元数）
    rotate(quat) {
        return quat.rotateVector(this);
    }
    rotateEq(quat) {
        const v = quat.rotateVector(this);
        this.copy(v);
        return this;
    }

    // 与欧拉角互转（作为方向向量）
    static fromEuler(euler) {
        const q = euler.toQuaternion();
        const dir = new GameVector3(0, 0, 1);
        return q.rotateVector(dir);
    }
    toEuler() {
        // 默认YZX顺序，忽略roll
        const yaw = Math.atan2(this.x, this.z);
        const pitch = Math.asin(Math.max(-1, Math.min(1, this.y / this.mag())));
        return new GameEuler(pitch, yaw, 0, 'YZX');
    }

    // 与二维向量转换
    toVector2() {
        return new GameVector2(this.x, this.y);
    }
    static fromVector2(v, z = 0) {
        return new GameVector3(v.x, v.y, z);
    }

    // 投影到XZ平面（返回Vector2）
    projectXZ() {
        return new GameVector2(this.x, this.z);
    }

    // 投影到任意平面（法线normal，假设平面过原点）
    projectOnPlane(normal) {
        const n = normal.clone().normalize();
        const dot = this.dot(n);
        return this.clone().sub(n.scale(dot));
    }
    projectOnPlaneEq(normal) {
        const n = normal.clone().normalize();
        const dot = this.dot(n);
        this.subEq(n.scale(dot));
        return this;
    }

    // 关于任意法线反射
    reflect(normal) {
        const n = normal.clone().normalize();
        const dot = this.dot(n);
        return this.clone().sub(n.scale(2 * dot));
    }
    reflectEq(normal) {
        const n = normal.clone().normalize();
        const dot = this.dot(n);
        this.subEq(n.scale(2 * dot));
        return this;
    }

    toString() { return `GameVector3(${this.x},${this.y},${this.z})`; }
}

globalThis.GameVector3 = GameVector3;
module.exports = GameVector3;