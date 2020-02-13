"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = require("./random");
class Range {
    constructor(min, max) {
        this.min = 0;
        this.max = 0;
        this.min = min;
        this.max = max;
    }
    // gets a random integer within the range
    getRandomInt(seed) {
        let min = Math.ceil(this.min);
        let max = Math.floor(this.max);
        if (seed) {
            random_1.default.seed = seed;
        }
        let value = Math.floor(random_1.default.random() * (max - min + 1)) + min;
        return value;
    }
    // gets a random decimal within the range
    getRandomDec(seed) {
        if (seed) {
            random_1.default.seed = seed;
        }
        let value = random_1.default.random() * (this.max - this.min) + this.min;
        return value;
    }
    // gets a random integer within the range	
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // gets a random decimal within the range
    static getRandomDec(min, max) {
        return Math.random() * (max - min) + min;
    }
}
exports.default = Range;
//# sourceMappingURL=range.js.map