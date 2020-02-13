"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Matter = require("matter-js");
// wrapper for handling various matter-js shit
class GameCollision {
    constructor(game) {
        this.engine = Matter.Engine.create();
        this.collidables = new Set();
        this.bodyMap = new Map();
        this.game = game;
        this.engine.world.gravity.x = 0;
        this.engine.world.gravity.y = 0;
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            for (let pair of event.pairs) {
                this.bodyMap.get(pair.bodyA).collidingWith.add(this.bodyMap.get(pair.bodyB));
                this.bodyMap.get(pair.bodyB).collidingWith.add(this.bodyMap.get(pair.bodyA));
            }
        });
        Matter.Events.on(this.engine, "collisionEnd", (event) => {
            for (let pair of event.pairs) {
                this.bodyMap.get(pair.bodyA).collidingWith.delete(this.bodyMap.get(pair.bodyB));
                this.bodyMap.get(pair.bodyB).collidingWith.delete(this.bodyMap.get(pair.bodyA));
            }
        });
    }
    tick(deltaTime, lastDeltaTime) {
        Matter.Engine.update(this.engine, deltaTime * 1000, deltaTime / lastDeltaTime);
    }
    add(collidable) {
        Matter.World.add(this.engine.world, collidable.body);
        this.collidables.add(collidable);
        this.bodyMap.set(collidable.body, collidable);
    }
    remove(collidable) {
        Matter.World.remove(this.engine.world, collidable.body);
        this.collidables.delete(collidable);
        this.bodyMap.delete(collidable.body);
    }
}
exports.default = GameCollision;
//# sourceMappingURL=gameCollision.js.map