"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("../../helpers/color");
const sprite_1 = require("../sprite");
const PIXI = require("pixi.js");
const range_1 = require("../../helpers/range");
function interpolateNumber(number1, number2, percent) {
    return (number1 * (1 - percent)) + number2 * percent;
}
var ParticleKeyNames;
(function (ParticleKeyNames) {
    ParticleKeyNames[ParticleKeyNames["scale"] = 0] = "scale";
    ParticleKeyNames[ParticleKeyNames["acceleration"] = 1] = "acceleration";
    ParticleKeyNames[ParticleKeyNames["spin"] = 2] = "spin";
    ParticleKeyNames[ParticleKeyNames["color"] = 3] = "color";
    ParticleKeyNames[ParticleKeyNames["time"] = 4] = "time";
})(ParticleKeyNames || (ParticleKeyNames = {}));
class Particle extends sprite_1.default {
    constructor(game, position, velocity, owner) {
        super(game, undefined);
        this.blendMode = PIXI.BLEND_MODES.ADD;
        this.cameras = [];
        this.timeAlive = 0;
        this.seed = range_1.default.getRandomInt(0, 100000);
        this.textureSet = false;
        this.setPosition(position);
        this.velocity = velocity;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.owner = owner;
        if (!this.constructor["particleInterpreted"]) {
            this.constructor["createBackendKeyframes"]();
            this.constructor["createJumpTables"]();
            this.constructor["particleInterpreted"] = true;
        }
    }
    tick(deltaTime) {
        super.tick(deltaTime);
        if (!this.textureSet) {
            this.texture = this.image;
            this.textureSet = true;
        }
        let currentKey = this.getCurrentKey();
        // apply velocity
        this.setPosition(this.getPosition().add(this.velocity.mul_(deltaTime)));
        // if we don't have a current key, then destroy the particlre
        if (currentKey == -1) {
            this.destroy();
        }
        else {
            let percent = this.getCurrentKeyframePercent(currentKey);
            let scaleInterpolation = this.interpolateProperty(currentKey, ParticleKeyNames.scale, percent);
            this.setScale(this.getScale().set(scaleInterpolation, scaleInterpolation));
            // apply the tint color
            let color = this.interpolateProperty(currentKey, ParticleKeyNames.color, percent);
            this.tint = color;
            this.opacity = color.a;
            // calculate then apply acceleration
            let acceleration = this.interpolateProperty(currentKey, ParticleKeyNames.acceleration, percent);
            if (acceleration != 0) {
                this.velocity.add(this.velocity.mul_(acceleration * deltaTime));
            }
            // calculate then apply spin
            let spin = this.interpolateProperty(currentKey, ParticleKeyNames.spin, percent);
            this.rotation += spin * deltaTime;
        }
        this.timeAlive += deltaTime;
    }
    // tries to interpolate a given property
    interpolateProperty(currentKey, propertyKey, percent) {
        let currentValue = this.processRange(currentKey, propertyKey);
        let lastValue = this.getLastInstanceOf(currentKey, propertyKey);
        // if we have a current value defined, there's a chance we can interpolate
        if (currentValue !== undefined) {
            // if our last value is undefined, we can't really do any inteprolation. instead, just return the current value
            if (lastValue === undefined) {
                return currentValue;
            }
            // actually interpolate now
            else {
                return Particle.interpolate(lastValue, currentValue, percent, Particle.interpolationMap[propertyKey]);
            }
        }
        // if our last value is defined but our current value is not defined, use the last value for this property
        else if (lastValue !== undefined) {
            return lastValue;
        }
        // if we found absolutely nothing, return the default value for the property just so we can return something
        else {
            return Particle.defaultValues[propertyKey];
        }
    }
    // interpolates between two values
    static interpolate(value1, value2, percent, interpolationFunction) {
        return interpolationFunction.apply(null, [value1, value2, percent]);
    }
    // finds the last instance of a property name from a keyframe
    getLastInstanceOf(currentKey, propertyKey) {
        let lastIndex = this.getStaticJumpTables()[propertyKey][currentKey];
        return this.processRange(lastIndex, propertyKey);
    }
    processRange(key, propertyKey) {
        let value = this.getStaticKeyframes()[key][propertyKey];
        if (value instanceof range_1.default) {
            return value.getRandomDec(this.getRandomSeed(key));
        }
        else {
            return value;
        }
    }
    // gets the current key based off of how much time has been elapsed
    getCurrentKey() {
        let timeAlive = this.timeAlive * 1000;
        let staticKeyFrames = this.getStaticKeyframes();
        for (let i = 0; i < staticKeyFrames.length; i++) {
            let key = staticKeyFrames[i];
            if (timeAlive < key[ParticleKeyNames.time]) {
                return i;
            }
        }
        return -1;
    }
    // gets how completed our current keyframe is
    getCurrentKeyframePercent(currentKey) {
        let staticKeyFrames = this.getStaticKeyframes();
        let startTime = staticKeyFrames[currentKey - 1][ParticleKeyNames.time];
        let endTime = staticKeyFrames[currentKey][ParticleKeyNames.time];
        let percent = ((this.timeAlive * 1000) - startTime) / (endTime - startTime);
        return percent > 1 ? 1 : percent;
    }
    getRandomSeed(currentKey) {
        return this.getStaticKeyframeSeeds()[currentKey] + this.seed;
    }
    getStaticKeyframes() {
        return this.constructor.backendKeyframes;
    }
    getStaticJumpTables() {
        return this.constructor.jumpTables;
    }
    getStaticKeyframeSeeds() {
        return this.constructor.keyframeSeeds;
    }
    static createBackendKeyframes() {
        for (let i = 0; i < this.keyframes.length; i++) {
            let keyframe = this.keyframes[i];
            this.backendKeyframes[i] = [];
            for (let key in keyframe) {
                this.backendKeyframes[i][ParticleKeyNames[key]] = keyframe[key];
            }
            this.keyframeSeeds[i] = range_1.default.getRandomInt(0, 100000);
        }
    }
    static createJumpTables() {
        for (let i = 0; i < this.backendKeyframes.length; i++) {
            let array = this.backendKeyframes[i];
            for (let keyframeValueIndex = 0; keyframeValueIndex < array.length; keyframeValueIndex++) {
                if (this.jumpTables[keyframeValueIndex] === undefined) {
                    this.jumpTables[keyframeValueIndex] = [];
                }
                if (this.jumpTables[keyframeValueIndex][i] == undefined) {
                    this.jumpTables[keyframeValueIndex][i] = this.jumpTables[keyframeValueIndex][i - 1];
                    if (this.jumpTables[keyframeValueIndex][i] === undefined) {
                        this.jumpTables[keyframeValueIndex][i] = 0;
                    }
                }
                if (array[keyframeValueIndex] !== undefined) {
                    this.jumpTables[keyframeValueIndex][i + 1] = i;
                }
            }
        }
    }
    destroy() {
        super.destroy();
        if (this.owner) {
            this.owner.aliveParticles.splice(this.owner.aliveParticles.indexOf(this), 1);
        }
    }
    setVelocity(input) {
        this.velocity.set(input.x, input.y);
    }
    getVelocity() {
        return this.velocity;
    }
}
Particle.keyframes = []; // the keyframes of the particle
// stores values of the keyframes, indexed by their enums
Particle.backendKeyframes = [];
// stores a bunch of values per keyframe value that shows the last time the paticular value was mentioned in a keyframe
Particle.jumpTables = [];
Particle.keyframeSeeds = [];
Particle.particleInterpreted = false;
Particle.interpolationMap = {
    [ParticleKeyNames.scale]: interpolateNumber,
    [ParticleKeyNames.acceleration]: interpolateNumber,
    [ParticleKeyNames.spin]: interpolateNumber,
    [ParticleKeyNames.color]: color_1.RGBColor.interpolate,
};
Particle.defaultValues = {
    [ParticleKeyNames.scale]: 1,
    [ParticleKeyNames.acceleration]: 0,
    [ParticleKeyNames.spin]: 0,
    [ParticleKeyNames.color]: color_1.RGBColor.WHITE,
};
exports.default = Particle;
//# sourceMappingURL=particle.js.map