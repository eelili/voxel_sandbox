// GameBezierCurve.js - 贝塞尔曲线（支持任意阶数）
class GameBezierCurve {
    constructor(points) {
        if (!Array.isArray(points) || points.length < 2) {
            throw new Error('Bezier curve requires at least 2 control points');
        }
        this.points = points.map(p => p.clone ? p.clone() : p);
        this.degree = points.length - 1;
    }

    // 获取曲线上的点，t ∈ [0,1]
    getPoint(t) {
        const n = this.degree;
        // 使用伯恩斯坦多项式
        let result = new GameVector3(0, 0, 0);
        for (let i = 0; i <= n; i++) {
            const coeff = this._bernstein(n, i, t);
            result.addEq(this.points[i].clone().scale(coeff));
        }
        return result;
    }

    // 获取切线（一阶导数）
    getTangent(t) {
        const n = this.degree;
        if (n === 0) return new GameVector3(0, 0, 0);
        let result = new GameVector3(0, 0, 0);
        for (let i = 0; i < n; i++) {
            const coeff = this._bernstein(n - 1, i, t) * n;
            const diff = this.points[i + 1].clone().sub(this.points[i]);
            result.addEq(diff.scale(coeff));
        }
        return result;
    }

    // 归一化切线方向
    getDirection(t) {
        const tangent = this.getTangent(t);
        const len = tangent.mag();
        return len > 0 ? tangent.scale(1 / len) : new GameVector3(0, 0, 0);
    }

    // 伯恩斯坦基函数
    _bernstein(n, i, t) {
        return this._binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    _binomial(n, k) {
        if (k < 0 || k > n) return 0;
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result *= (n - i + 1) / i;
        }
        return result;
    }

    // 将曲线细分，返回等间隔采样点（用于渲染）
    sampleSteps(steps = 20) {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            pts.push(this.getPoint(t));
        }
        return pts;
    }

    // 计算曲线长度（近似）
    length(steps = 100) {
        let total = 0;
        let prev = this.getPoint(0);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const cur = this.getPoint(t);
            total += cur.distance(prev);
            prev = cur;
        }
        return total;
    }

    // 复制曲线
    clone() {
        return new GameBezierCurve(this.points.map(p => p.clone()));
    }

    toString() {
        return `GameBezierCurve(degree=${this.degree}, points=${this.points.map(p => p.toString()).join(', ')})`;
    }
}

globalThis.GameBezierCurve = GameBezierCurve;
module.exports = GameBezierCurve;