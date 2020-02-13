"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const gameObject_1 = require("../game/gameObject");
const game_1 = require("../game/game");
const networkDecorators_1 = require("../network/networkDecorators");
const vector_1 = require("./vector");
let VectorInterpolation = class VectorInterpolation extends gameObject_1.default {
    constructor(game, start, end, time, callback, endCallback) {
        super(game);
        this.interpolatedVector = new vector_1.default(0, 0);
        this.timeElapsed = 0;
        this.start = start;
        this.end = end;
        this.time = time;
        this.callback = callback;
        this.endCallback = endCallback;
    }
    tick(deltaTime) {
        super.tick(deltaTime);
        this.timeElapsed += deltaTime;
        // figure out the linear interpolation of the vector based on how much time is remaining
        let percent = this.timeElapsed / this.time;
        if (percent < 1) {
            this.interpolatedVector.x = (this.start.x * (1 - percent)) + (this.end.x * percent);
            this.interpolatedVector.y = (this.start.y * (1 - percent)) + (this.end.y * percent);
            this.callback(this.interpolatedVector);
        }
        else {
            this.endCallback(this.end);
            this.destroy();
        }
    }
    destroy() {
        super.destroy();
    }
};
VectorInterpolation = __decorate([
    networkDecorators_1.gameClass,
    __metadata("design:paramtypes", [game_1.default, vector_1.default, vector_1.default, Number, Function, Function])
], VectorInterpolation);
exports.default = VectorInterpolation;
let SmoothVectorInterpolation = class SmoothVectorInterpolation extends VectorInterpolation {
    tick(deltaTime) {
        gameObject_1.default.prototype.tick.apply(this, [deltaTime]);
        this.timeElapsed += deltaTime;
        // shoutout to avi who helped me out figure out how to smoothly ease in this camera
        let percent = -(((this.timeElapsed / this.time) - 1) ** 2) + 1;
        if (this.timeElapsed < this.time) {
            this.interpolatedVector.x = (this.start.x * (1 - percent)) + (this.end.x * percent);
            this.interpolatedVector.y = (this.start.y * (1 - percent)) + (this.end.y * percent);
            this.callback(this.interpolatedVector);
        }
        else {
            this.endCallback(this.end);
            this.destroy();
        }
    }
};
SmoothVectorInterpolation = __decorate([
    networkDecorators_1.gameClass
], SmoothVectorInterpolation);
exports.SmoothVectorInterpolation = SmoothVectorInterpolation;
//# sourceMappingURL=vectorInterpolation.js.map