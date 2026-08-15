// GameRGBColor.js - RGB颜色（扩展完整）
class GameRGBColor {
    constructor(r = 0, g = 0, b = 0) {
        this.r = Math.max(0, Math.min(1, r));
        this.g = Math.max(0, Math.min(1, g));
        this.b = Math.max(0, Math.min(1, b));
    }

    static random() { return new GameRGBColor(Math.random(), Math.random(), Math.random()); }
    static fromHex(hex) {
        const h = parseInt(hex.replace('#',''), 16);
        const r = ((h >> 16) & 0xFF) / 255;
        const g = ((h >> 8) & 0xFF) / 255;
        const b = (h & 0xFF) / 255;
        return new GameRGBColor(r,g,b);
    }

    set(r,g,b) { this.r=Math.max(0,Math.min(1,r)); this.g=Math.max(0,Math.min(1,g)); this.b=Math.max(0,Math.min(1,b)); return this; }
    copy(c) { this.r=c.r; this.g=c.g; this.b=c.b; return this; }
    clone() { return new GameRGBColor(this.r,this.g,this.b); }

    add(c) { return new GameRGBColor(this.r+c.r, this.g+c.g, this.b+c.b); }
    sub(c) { return new GameRGBColor(this.r-c.r, this.g-c.g, this.b-c.b); }
    mul(c) { return new GameRGBColor(this.r*c.r, this.g*c.g, this.b*c.b); }
    div(c) { const eps=1e-6; return new GameRGBColor(this.r/(c.r||eps), this.g/(c.g||eps), this.b/(c.b||eps)); }
    addEq(c) { this.r+=c.r; this.g+=c.g; this.b+=c.b; return this; }
    subEq(c) { this.r-=c.r; this.g-=c.g; this.b-=c.b; return this; }
    mulEq(c) { this.r*=c.r; this.g*=c.g; this.b*=c.b; return this; }
    divEq(c) { const eps=1e-6; this.r/=(c.r||eps); this.g/=(c.g||eps); this.b/=(c.b||eps); return this; }
    lerp(c,t) { return new GameRGBColor(this.r+(c.r-this.r)*t, this.g+(c.g-this.g)*t, this.b+(c.b-this.b)*t); }
    equals(c, eps=1e-6) {
        return Math.abs(this.r-c.r)<=eps && Math.abs(this.g-c.g)<=eps && Math.abs(this.b-c.b)<=eps;
    }
    toRGBA(a=1) { return new GameRGBAColor(this.r,this.g,this.b,a); }

    // ===== 新增扩展 =====
    // 转换为HSL
    toHSL() {
        const r=this.r, g=this.g, b=this.b;
        const max=Math.max(r,g,b), min=Math.min(r,g,b);
        let h=0, s=0, l=(max+min)/2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else if (max === b) h = (r - g) / d + 4;
            h /= 6;
        }
        return { h, s, l };
    }

    // 从HSL构建（h,s,l 0~1）
    static fromHSL(h, s, l) {
        const hue2rgb = (p,q,t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q-p)*6*t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q-p)*(2/3 - t)*6;
            return p;
        };
        if (s === 0) {
            return new GameRGBColor(l,l,l);
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const r = hue2rgb(p,q,h+1/3);
        const g = hue2rgb(p,q,h);
        const b = hue2rgb(p,q,h-1/3);
        return new GameRGBColor(r,g,b);
    }

    // 转为整数颜色（0~255）
    toInt() {
        return (Math.round(this.r*255)<<16) | (Math.round(this.g*255)<<8) | Math.round(this.b*255);
    }
    static fromInt(int) {
        const r = ((int >> 16) & 0xFF) / 255;
        const g = ((int >> 8) & 0xFF) / 255;
        const b = (int & 0xFF) / 255;
        return new GameRGBColor(r,g,b);
    }

    toString() { return `GameRGBColor(${this.r},${this.g},${this.b})`; }
}

globalThis.GameRGBColor = GameRGBColor;
module.exports = GameRGBColor;