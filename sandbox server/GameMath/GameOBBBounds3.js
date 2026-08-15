// GameOBBBounds3.js - 有向包围盒（OBB）
// 依赖：GameVector3, GameQuaternion, GameBounds3

class GameOBBBounds3 {
    /**
     * @param {GameVector3} center - 世界空间中心
     * @param {GameVector3} halfSize - 半长向量（局部坐标系）
     * @param {GameQuaternion} rotation - 旋转四元数
     */
    constructor(center = new GameVector3(), halfSize = new GameVector3(1,1,1), rotation = new GameQuaternion()) {
        this.center = center.clone();
        this.halfSize = halfSize.clone();
        this.rotation = rotation.clone();
        this._updateAxes();
    }

    // 更新三个局部轴（从四元数提取）
    _updateAxes() {
        const q = this.rotation;
        const xx = q.x * q.x, yy = q.y * q.y, zz = q.z * q.z;
        const xy = q.x * q.y, xz = q.x * q.z, yz = q.y * q.z;
        const wx = q.w * q.x, wy = q.w * q.y, wz = q.w * q.z;
        this.axisX = new GameVector3(
            1 - 2*(yy + zz),
            2*(xy + wz),
            2*(xz - wy)
        );
        this.axisY = new GameVector3(
            2*(xy - wz),
            1 - 2*(xx + zz),
            2*(yz + wx)
        );
        this.axisZ = new GameVector3(
            2*(xz + wy),
            2*(yz - wx),
            1 - 2*(xx + yy)
        );
    }

    /**
     * 获取 OBB 的 8 个顶点（世界空间）
     * @returns {GameVector3[]}
     */
    getVertices() {
        const h = this.halfSize;
        const axes = [this.axisX, this.axisY, this.axisZ];
        const signs = [
            [-1,-1,-1], [ 1,-1,-1], [ 1, 1,-1], [-1, 1,-1],
            [-1,-1, 1], [ 1,-1, 1], [ 1, 1, 1], [-1, 1, 1]
        ];
        return signs.map(s => {
            let v = this.center.clone();
            for (let i = 0; i < 3; i++) {
                const axis = axes[i];
                const half = (i === 0) ? h.x : (i === 1) ? h.y : h.z;
                v.add(axis.clone().scale(s[i] * half));
            }
            return v;
        });
    }

    /**
     * 获取 OBB 的轴对齐包围盒（AABB）
     * @returns {GameBounds3}
     */
    getAABB() {
        const vertices = this.getVertices();
        return GameBounds3.fromPoints(...vertices);
    }

    // ---------- 碰撞检测（返回重叠轴和深度） ----------
    /**
     * 与另一个 OBB 的重叠检测
     * @param {GameOBBBounds3} other
     * @returns {null | { axis: GameVector3, depth: number }}
     */
    getOverlapOBB(other) {
        // 收集所有分离轴：自身3轴 + 对方3轴 + 叉积9轴
        const axes = [
            this.axisX, this.axisY, this.axisZ,
            other.axisX, other.axisY, other.axisZ
        ];
        // 叉积轴（若叉积非零）
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cross = axes[i].cross(axes[3 + j]);
                if (cross.mag() > 1e-6) {
                    axes.push(cross.normalize());
                }
            }
        }

        const centerDiff = other.center.clone().sub(this.center);
        let minOverlap = Infinity;
        let bestAxis = null;

        for (const axis of axes) {
            const projA = this._projectOnAxis(axis);
            const projB = other._projectOnAxis(axis);
            const overlap = projA + projB - Math.abs(centerDiff.dot(axis));
            if (overlap <= 0) {
                return null; // 存在分离轴，不相交
            }
            if (overlap < minOverlap) {
                minOverlap = overlap;
                bestAxis = axis.clone().normalize();
            }
        }

        // 确定轴方向：从 other 指向 this（使推离方向正确）
        const sign = centerDiff.dot(bestAxis) >= 0 ? 1 : -1;
        bestAxis.scaleEq(sign);
        return { axis: bestAxis, depth: minOverlap };
    }

    /**
     * 与 AABB 的重叠检测（将 AABB 视为无旋转的 OBB）
     * @param {GameBounds3} aabb
     * @returns {null | { axis: GameVector3, depth: number }}
     */
    getOverlapAABB(aabb) {
        const center = aabb.center;
        const halfSize = aabb.halfSize;
        const otherOBB = new GameOBBBounds3(center, halfSize, new GameQuaternion());
        return this.getOverlapOBB(otherOBB);
    }

    /**
     * 判断是否与另一个 OBB 相交
     * @param {GameOBBBounds3} other
     * @returns {boolean}
     */
    intersectsOBB(other) {
        return this.getOverlapOBB(other) !== null;
    }

    /**
     * 判断是否与 AABB 相交
     * @param {GameBounds3} aabb
     * @returns {boolean}
     */
    intersectsAABB(aabb) {
        return this.getOverlapAABB(aabb) !== null;
    }

    // 内部：计算在某个轴上的投影半长（即投影范围的一半）
    _projectOnAxis(axis) {
        const h = this.halfSize;
        const axes = [this.axisX, this.axisY, this.axisZ];
        let proj = 0;
        for (let i = 0; i < 3; i++) {
            const half = (i === 0) ? h.x : (i === 1) ? h.y : h.z;
            proj += Math.abs(axes[i].dot(axis)) * half;
        }
        return proj;
    }

    // 设置方法（用于更新）
    set(center, halfSize, rotation) {
        this.center.copy(center);
        this.halfSize.copy(halfSize);
        this.rotation.copy(rotation);
        this._updateAxes();
        return this;
    }
    setCenter(center) { this.center.copy(center); return this; }
    setRotation(rotation) { this.rotation.copy(rotation); this._updateAxes(); return this; }
    setHalfSize(halfSize) { this.halfSize.copy(halfSize); return this; }

    toString() {
        return `GameOBBBounds3(center: ${this.center}, half: ${this.halfSize}, rot: ${this.rotation})`;
    }
}

globalThis.GameOBBBounds3 = GameOBBBounds3;
module.exports = GameOBBBounds3;