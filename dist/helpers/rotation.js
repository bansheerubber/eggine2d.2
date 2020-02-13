"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
exports.RAD_TO_EULER = 180 / Math.PI;
exports.EULER_TO_RAD = Math.PI / 180;
class Rotation {
    constructor(angle = 0) {
        // rotation angle in radians
        this._angle = 0;
        this._vector = new vector_1.default(1, 0);
        this.angle = angle;
    }
    set angle(angle) {
        this._angle = angle;
        this._vector.x = Math.cos(angle);
        this._vector.y = Math.sin(angle);
    }
    get angle() {
        return this._angle;
    }
    set vector(vector) {
        this._vector = vector.unit_();
        this._angle = Math.atan2(vector.y, vector.x);
        if (vector.y < 0) {
            this._angle += Math.PI * 2;
        }
    }
    get vector() {
        return this._vector;
    }
}
exports.default = Rotation;
//# sourceMappingURL=rotation.js.map