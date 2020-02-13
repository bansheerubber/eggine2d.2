"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HSVColor {
    constructor(h, s, v, a = 1) {
        this.h = 0;
        this.s = 0;
        this.v = 0;
        this.a = 0;
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
    toRGB() {
        // do some linear interpolation trickery to find the RGB values based on this.h
        let hR = Math.max(0, Math.min(1, Math.abs(-6 * (this.h - 3 / 6)) - 1)); // max(0, min(1,  |-6 * (h - (3 / 6))| - 1))
        let hG = Math.max(0, Math.min(1, -Math.abs(-6 * (this.h - 2 / 6)) + 2)); // max(0, min(1, -|-6 * (h - (2 / 6))| + 2))
        let hB = Math.max(0, Math.min(1, -Math.abs(-6 * (this.h - 4 / 6)) + 2)); // max(0, min(1, -|-6 * (h - (4 / 6))| + 2))
        // calculate the saturiation modifier. how much color to add to the above calculated colors based on their saturation values
        let ffR = (-Math.abs(6 * (this.s - 3 / 6)) + 2) > 0
            ? 1 : 0; // -|6 * (s - (3 / 6))| + 2
        let ffG = (Math.abs(6 * (this.s - 2 / 3)) - 1) > 0 ? 1 : 0; //  |6 * (s - (2 / 6))| - 1
        let ffB = (Math.abs(6 * (this.s - 4 / 6)) - 1) > 0 ? 1 : 0; //  |6 * (s - (4 / 6))| - 1
        // ffR, ffG, and ffB determine when we should apply saturation modifier to the final color. below are the saturation values we add to the final color. if saturation == 0, then we need to add the full amount of color remaining that lets the final color equal 1
        let sR = ((1 - hR) * (1 - this.s)) * ffR; // ((1 - hR) * (1 - s)) * ffR
        let sG = ((1 - hG) * (1 - this.s)) * ffG; // ((1 - hG) * (1 - s)) * ffG
        let sB = ((1 - hB) * (1 - this.s)) * ffB; // ((1 - hB) * (1 - s)) * ffB
        // calculate the final color by adding together the old values and multiplying them by the brightness
        let r = (sR + hR) * this.v;
        let g = (sG + hG) * this.v;
        let b = (sB + hB) * this.v;
        return new RGBColor(r, g, b, this.a);
    }
}
exports.HSVColor = HSVColor;
class RGBColor {
    constructor(r, g, b, a = 1) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    // converts the color to a hex number (doesn't include alpha, also doesn't look like 0x104156 or whatever. it'll be the base 10 representation)
    toHex() {
        return Math.floor(this.r * 255) << 16 | Math.floor(this.g * 255) << 8 | Math.floor(this.b * 255) << 0;
    }
    // converts this to a css color. if a == 1, then it will use the hex. if a < 1, then it will do rgab(r, g, b, a)
    toCSSColor() {
        if (this.a == 1) {
            return `#${this.toHex().toString(16)}`;
        }
        else {
            return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
        }
    }
    // converts this RGB color to a HSV color
    toHSV() {
        let magic = 2 * Math.sqrt(this.r ** 2 + this.b ** 2 + this.g ** 2 - this.g * this.r - this.b * this.g - this.b * this.r);
        return new HSVColor(Math.atan2(this.b - this.g, Math.sqrt((2 * this.r - this.b - this.g) / 3)), magic / (this.r + this.b + this.g + magic), (this.r + this.b + this.g + magic) / 3, this.a);
    }
    // interpolates between two colors
    static interpolate(color1, color2, percent) {
        return new RGBColor((color1.r * (1 - percent)) + color2.r * percent, (color1.g * (1 - percent)) + color2.g * percent, (color1.b * (1 - percent)) + color2.b * percent, (color1.a * (1 - percent)) + color2.a * percent);
    }
    // create a color from a hex or from a CSS color
    static from(input) {
        if (typeof input == "number") {
            let r = ((input) & (255 << 0)) / (255 << 0);
            let g = ((input) & (255 << 8)) / (255 << 8);
            let b = ((input) & (255 << 16)) / (255 << 16);
            return new RGBColor(r, g, b, 1);
        }
        else {
            if (input.indexOf("#") != -1) {
                if (input.length > 4) {
                    let numberString = input.substring(1, input.length);
                    return this.from(parseInt(numberString, 16));
                }
                else {
                    let numberString = input.substring(1, input.length);
                    return this.from(parseInt(numberString + numberString, 16));
                }
            }
            else {
                let match = input.match(/[0-9\.]+/g);
                let r = parseInt(match[0]) / 255;
                let g = parseInt(match[1]) / 255;
                let b = parseInt(match[2]) / 255;
                let a = parseInt(match[3]);
                return new RGBColor(r, g, b, isNaN(a) ? 1 : a);
            }
        }
    }
}
RGBColor.WHITE = new RGBColor(1, 1, 1, 1);
RGBColor.BLACK = new RGBColor(0, 0, 0, 1);
RGBColor.TRANSPARENT = new RGBColor(1, 1, 1, 0);
exports.RGBColor = RGBColor;
//# sourceMappingURL=color.js.map