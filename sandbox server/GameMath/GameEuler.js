// GameEuler.js - 欧拉角（支持YZX顺序，与Quaternion互转）
class GameEuler {
    constructor(x = 0, y = 0, z = 0, order = 'YZX') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order; // 旋转顺序，默认 YZX
    }

    // 从四元数转换
    static fromQuaternion(q, order = 'YZX') {
        // 采用与GameQuaternion.fromEuler对应的逆运算
        const yzx = order === 'YZX';
        let x, y, z;
        if (yzx) {
            // YZX: 先绕Y，再绕Z，最后绕X
            const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
            const y2 = qy * qy;
            const z2 = qz * qz;
            const x2 = qx * qx;
            // 直接使用atan2和asin等公式，这里简化实现，实际可从Quaternion的toEuler方法
            // 由于GameQuaternion已有fromEuler，我们实现逆运算
            // 使用标准算法（适用于YZX）
            const cy = Math.sqrt(qw*qw + qy*qy - qx*qx - qz*qz); // 注意符号
            if (cy > 0.0001) {
                x = Math.atan2(2 * (qx * qw - qy * qz), 2 * (qw * qy + qx * qz));
                y = Math.atan2(2 * (qy * qw - qx * qz), qw*qw + qy*qy - qx*qx - qz*qz);
                z = Math.atan2(2 * (qz * qw - qy * qx), qw*qw + qz*qz - qx*qx - qy*qy);
            } else {
                x = Math.atan2(-2 * (qx * qz - qy * qw), 2 * (qw * qx + qy * qz));
                y = 0;
                z = Math.atan2(-2 * (qx * qy - qz * qw), 2 * (qw * qz + qy * qx));
            }
        } else {
            // 其他顺序可扩展，这里只实现YZX
            throw new Error('Only YZX order supported for now');
        }
        return new GameEuler(x, y, z, order);
    }

    // 转换为四元数
    toQuaternion() {
        // 复用GameQuaternion.fromEuler
        return GameQuaternion.fromEuler(this.x, this.y, this.z);
    }

    // 以弧度设置
    set(x, y, z, order) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (order) this.order = order;
        return this;
    }

    // 以角度设置（度转弧度）
    setDegrees(xDeg, yDeg, zDeg, order) {
        this.x = xDeg * Math.PI / 180;
        this.y = yDeg * Math.PI / 180;
        this.z = zDeg * Math.PI / 180;
        if (order) this.order = order;
        return this;
    }

    // 获取角度（度）
    get degrees() {
        return { x: this.x * 180 / Math.PI, y: this.y * 180 / Math.PI, z: this.z * 180 / Math.PI };
    }

    // 复制
    copy(e) {
        this.x = e.x;
        this.y = e.y;
        this.z = e.z;
        this.order = e.order;
        return this;
    }

    clone() {
        return new GameEuler(this.x, this.y, this.z, this.order);
    }

    // 归一化到 -PI ~ PI
    normalize() {
        const twoPI = 2 * Math.PI;
        this.x = ((this.x % twoPI) + twoPI) % twoPI;
        if (this.x > Math.PI) this.x -= twoPI;
        this.y = ((this.y % twoPI) + twoPI) % twoPI;
        if (this.y > Math.PI) this.y -= twoPI;
        this.z = ((this.z % twoPI) + twoPI) % twoPI;
        if (this.z > Math.PI) this.z -= twoPI;
        return this;
    }

    // 转换为三维向量（看作方向）
    toVector3() {
        // 将欧拉角视为旋转后的方向向量（如朝向）
        const q = this.toQuaternion();
        const dir = new GameVector3(0, 0, 1);
        return q.rotateVector(dir);
    }

    toString() {
        return `GameEuler(${this.x}, ${this.y}, ${this.z}, order=${this.order})`;
    }
}

globalThis.GameEuler = GameEuler;
module.exports = GameEuler;