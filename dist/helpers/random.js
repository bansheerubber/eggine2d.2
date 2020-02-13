"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Random {
    static set seed(seed) {
        this.random = () => ((seed = Math.imul(1597334677, seed)) >>> 0) / 2 ** 32; // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
        this.random();
        this._seed = seed;
    }
    static get seed() {
        return this._seed;
    }
}
exports.default = Random;
Random.seed = Math.random() * 100000 | 0;
//# sourceMappingURL=random.js.map