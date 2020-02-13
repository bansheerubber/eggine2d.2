"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("../../helpers/range");
const vector_1 = require("../../helpers/vector");
const gameObject_1 = require("../../game/gameObject");
const rotation_1 = require("../../helpers/rotation");
class Emitter extends gameObject_1.default {
    constructor(game, position) {
        super(game);
        this.position = new vector_1.default(0, 0);
        this.scale = new vector_1.default(1, 1);
        this.rotation = 0;
        this.cameras = [];
        this.aliveParticles = [];
        // the physical offset of the particles
        this.particleOffset = 0;
        // the amount of time that has gone by since we emitted our last particle
        this.particleWait = 0;
        // the current emission time, could be randomly generated
        this.currentEmissionTime = 0;
        this.emissionRotation = new rotation_1.default();
        this.position = position;
        if (typeof this.theta == "number") {
            this.emissionRotation.angle = this.theta;
        }
    }
    tick(deltaTime) {
        let getNewEmissionTime = () => {
            if (this.emissionTime instanceof range_1.default) {
                this.currentEmissionTime = this.emissionTime.getRandomInt();
            }
            else {
                this.currentEmissionTime = this.emissionTime;
            }
        };
        this.particleWait += deltaTime;
        if (this.currentEmissionTime == 0) {
            getNewEmissionTime();
        }
        let newParticleCount = this.particleWait * 1000 / this.currentEmissionTime;
        for (let i = 0; i < newParticleCount || i < 5; i++) {
            this.particleWait -= this.currentEmissionTime / 1000;
            // get the vector emission direction
            if (this.theta instanceof range_1.default) {
                this.emissionRotation.angle = this.theta.getRandomDec();
            }
            // get the emission speed
            if (this.particleSpeed instanceof range_1.default) {
                var speed = this.particleSpeed.getRandomDec();
            }
            else {
                var speed = this.particleSpeed;
            }
            let position = new vector_1.default(this.position.x, this.position.y);
            // get the particle offset
            if (this.particleOffset instanceof range_1.default) {
                var offset = this.particleOffset.getRandomDec();
            }
            else {
                var offset = this.particleOffset;
            }
            position.add(this.emissionRotation.vector.mul_(offset));
            let randomIndex = range_1.default.getRandomInt(0, this.particleClasses.length - 1);
            // create the new particle
            let particle = new this.particleClasses[randomIndex](this.game, position, this.emissionRotation.vector.mul_(speed), this);
            this.aliveParticles.push(particle);
            getNewEmissionTime();
        }
    }
    setPosition(input) {
        this.position.set(input.x, input.y);
    }
    getPosition() {
        return this.position;
    }
    setScale(input) {
        this.scale.set(input.x, input.y);
    }
    getScale() {
        return this.scale;
    }
}
exports.default = Emitter;
//# sourceMappingURL=emitter.js.map