"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("../../helpers/vector");
const remoteObject_1 = require("../../network/remoteObject");
const Matter = require("matter-js");
class PlayerMoveOptions {
}
exports.PlayerMoveOptions = PlayerMoveOptions;
class PlayerMove {
    constructor(options) {
        // the different velocities we have in the different directions. allows for 8 directional movement
        this.movePositiveX = 0;
        this.moveNegativeX = 0;
        this.movePositiveY = 0;
        this.moveNegativeY = 0;
        this.tempVec = new vector_1.default();
        this.lastMoveVelocity = new vector_1.default();
        // whether or not we're moving in a paticular direction
        this.isMovingPositiveX = false;
        this.isMovingNegativeX = false;
        this.isMovingPositiveY = false;
        this.isMovingNegativeY = false;
        this.acceleration = 0; // how fast we accelerate from 0 to moveSpeed, and from moveSpeed to 0
        this.speed = 0; // how fast the player moves in any direction
        this.friction = 0;
        this.positiveXVector = new vector_1.default(0, 0);
        this.negativeXVector = new vector_1.default(0, 0);
        this.positiveYVector = new vector_1.default(0, 0);
        this.negativeYVector = new vector_1.default(0, 0);
        this.acceleration = options.acceleration;
        this.speed = options.speed;
        this.friction = options.friction;
    }
    updateMoveVectors() {
        if (this.isMovingPositiveX) {
            this.positiveXVector.x = 0.2;
        }
        else {
            this.positiveXVector.x = 0;
        }
        if (this.isMovingNegativeX) {
            this.negativeXVector.x = -0.2;
        }
        else {
            this.negativeXVector.x = 0;
        }
        if (this.isMovingPositiveY) {
            this.positiveYVector.y = 0.2;
        }
        else {
            this.positiveYVector.y = 0;
        }
        if (this.isMovingNegativeY) {
            this.negativeYVector.y = -0.2;
        }
        else {
            this.negativeYVector.y = 0;
        }
    }
    getMoveDirection() {
        let direction = new vector_1.default(0, 0);
        if (this.isMovingPositiveX) {
            direction.x += 1;
        }
        if (this.isMovingNegativeX) {
            direction.x -= 1;
        }
        if (this.isMovingPositiveY) {
            direction.y += 1;
        }
        if (this.isMovingNegativeY) {
            direction.y -= 1;
        }
        return direction.unit();
    }
    getMoveMagnitude(direction, move) {
        return Math.max(direction.dot(move.unit_()), 0);
    }
    getMoveVelocity(deltaTime) {
        this.updateMoveVectors();
        let direction = this.getMoveDirection();
        let combination = new vector_1.default(0, 0);
        combination.add(this.positiveXVector.mul_(this.getMoveMagnitude(direction, this.positiveXVector)));
        combination.add(this.positiveYVector.mul_(this.getMoveMagnitude(direction, this.positiveYVector)));
        combination.add(this.negativeXVector.mul_(this.getMoveMagnitude(direction, this.negativeXVector)));
        combination.add(this.negativeYVector.mul_(this.getMoveMagnitude(direction, this.negativeYVector)));
        return combination;
    }
    getFrictionVelocity(velocity, deltaTime) {
        if (velocity.length() - this.friction * deltaTime > 0) {
            return this.tempVec.set(velocity.x, velocity.y).unit().mul(-this.friction * deltaTime);
        }
        else {
            return this.tempVec.set(velocity.x, velocity.y).mul(-1);
        }
    }
}
exports.PlayerMove = PlayerMove;
class Player extends remoteObject_1.default {
    constructor(game, move) {
        super(game);
        this.cameras = [];
        // damageable properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.tempVec = new vector_1.default();
        this.move = move;
    }
    tick(deltaTime) {
        super.tick(deltaTime);
        // apply move
        let moveVelocity = this.move.getMoveVelocity(deltaTime);
        Matter.Body.applyForce(this.collidable.body, this.collidable.body.position, moveVelocity.toMatter());
        // apply body position
        this.tempVec.x = this.collidable.body.position.x;
        this.tempVec.y = this.collidable.body.position.y;
        // add onto our velocity
        this.sprite.setPosition(this.tempVec);
        // applying position to cameras
        for (let camera of this.cameras) {
            camera.position.set(this.tempVec.x, this.tempVec.y);
        }
    }
}
exports.default = Player;
//# sourceMappingURL=player.js.map