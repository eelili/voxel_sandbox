// GameRGBAColor.js - RGBA颜色（扩展完整）
class GameRGBAColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = Math.max(0, Math.min(1, r));
        this.g = Math.max(0, Math.min(1, g));
        this.b = Math.max(0, Math.min(1, b));
        this.a = Math.max(0, Math.min(1, a));
    }

    set(r,g,b,a) { this.r=Math.max(0,Math.min(1,r)); this.g=Math.max(0,Math.min(1,g)); this.b=Math.max(0,Math.min(1,b)); this.a=Math.max(0,Math.min(1,a)); return this; }
    copy(c) { this.r=c.r; this.g=c.g; this.b=c.b; this.a=c.a; return this; }
    clone() { return new GameRGBAColor(this.r,this.g,this.b,this.a); }

    add(c) { return new GameRGBAColor(this.r+c.r, this.g+c.g, this.b+c.b, this.a+c.a); }
    sub(c) { return new GameRGBAColor(this.r-c.r, this.g-c.g, this.b-c.b, this.a-c.a); }
    mul(c) { return new GameRGBAColor(this.r*c.r, this.g*c.g, this.b*c.b, this.a*c.a); }
    div(c) { const eps=1e-6; return new GameRGBAColor(this.r/(c.r||eps), this.g/(c.g||eps), this.b/(c.b||eps), this.a/(c.a||eps)); }
    addEq(c) { this.r+=c.r; this.g+=c.g; this.b+=c.b; this.a+=c.a; return this; }
    subEq(c) { this.r-=c.r; this.g-=c.g; this.b-=c.b; this.a-=c.a; return this; }
    mulEq(c) { this.r*=c.r; this.g*=c.g; this.b*=c.b; this.a*=c.a; return this; }
    divEq(c) { const eps=1e-6; this.r/=(c.r||eps); this.g/=(c.g||eps); this.b/=(c.b||eps); this.a/=(c.a||eps); return this; }
    lerp(c,t) { return new GameRGBAColor(this.r+(c.r-this.r)*t, this.g+(c.g-this.g)*t, this.b+(c.b-this.b)*t, this.a+(c.a-this.a)*t); }
    equals(c, eps=1e-6) {
        return Math.abs(this.r-c.r)<=eps && Math.abs(this.g-c.g)<=eps && Math.abs(this.b-c.b)<=eps && Math.abs(this.a-c.a)<=eps;
    }

    // 混合（Alpha混合）
    blend(background) {
        const invA = 1 - this.a;
        return new GameRGBColor(
            this.r * this.a + background.r * invA,
            this.g * this.a + background.g * invA,
            this.b * this.a + background.b * invA
        );
    }

    // 转为RGB（丢弃Alpha）
    toRGB() {
        return new GameRGBColor(this.r, this.g, this.b);
    }

    // ===== 新增扩展 =====
    // HSL转换（Alpha不变）
    toHSL() {
        const rgb = this.toRGB();
        const hsl = rgb.toHSL();
        return { h: hsl.h, s: hsl.s, l: hsl.l, a: this.a };
    }
    static fromHSL(h, s, l, a = 1) {
        const rgb = GameRGBColor.fromHSL(h,s,l);
        return new GameRGBAColor(rgb.r, rgb.g, rgb.b, a);
    }

    // 整数颜色（含Alpha）
    toInt() {
        return (Math.round(this.a*255)<<24) | (Math.round(this.r*255)<<16) | (Math.round(this.g*255)<<8) | Math.round(this.b*255);
    }
    static fromInt(int) {
        const a = ((int >> 24) & 0xFF) / 255;
        const r = ((int >> 16) & 0xFF) / 255;
        const g = ((int >> 8) & 0xFF) / 255;
        const b = (int & 0xFF) / 255;
        return new GameRGBAColor(r,g,b,a);
    }

    toString() { return `GameRGBAColor(${this.r},${this.g},${this.b},${this.a})`; }
}

globalThis.GameRGBAColor = GameRGBAColor;
module.exports = GameRGBAColor;