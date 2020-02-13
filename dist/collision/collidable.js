"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameObject_1 = require("../game/gameObject");
const Matter = require("matter-js");
const vector_1 = require("../helpers/vector");
class Collidable extends gameObject_1.default {
    constructor(game) {
        super(game);
        this.collidingWith = new Set();
        this.cameras = [];
    }
    tick(deltaTime) {
        super.tick(deltaTime);
    }
    get rotation() {
        return this.body.angle;
    }
    set rotation(value) {
        Matter.Body.setAngle(this.body, value);
    }
    setPosition(vector) {
        Matter.Body.setPosition(this.body, vector.toMatter());
    }
    getPosition() {
        return new vector_1.default(this.body.position.x, this.body.position.y);
    }
    setVelocity(vector) {
        Matter.Body.setVelocity(this.body, vector.toMatter());
    }
    getVelocity() {
        return new vector_1.default(this.body.velocity.x, this.body.velocity.y);
    }
    setScale(vector) {
    }
    getScale() {
        return new vector_1.default(0, 0);
    }
}
exports.default = Collidable;
//# sourceMappingURL=collidable.js.map