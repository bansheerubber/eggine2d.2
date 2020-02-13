"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collidable_1 = require("./collidable");
const Matter = require("matter-js");
class CollidableBox extends collidable_1.default {
    constructor(game, position, width, height) {
        super(game);
        this.body = Matter.Bodies.rectangle(position.x, position.y, width, height);
        this.game.collision.add(this);
    }
    tick(deltaTime) {
    }
}
exports.default = CollidableBox;
//# sourceMappingURL=collidableBox.js.map