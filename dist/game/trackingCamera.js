"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const camera_1 = require("../render/camera");
// camera that follows a physical object around. it is up to the physical object to implement camera tracking
class TrackingCamera extends camera_1.default {
    constructor(game, owner) {
        super(game);
        this.owner = owner;
    }
    get owner() {
        return this._owner;
    }
    set owner(value) {
        if (this._owner) {
            this._owner.cameras.splice(this._owner.cameras.indexOf(this), -1);
        }
        this._owner = value;
        this._owner.cameras.push(this);
        this.position.set(this._owner.getPosition().x, this._owner.getPosition().y);
    }
    onActivated() {
        if (this.owner) {
            this.position.set(this.owner.getPosition().x, this.owner.getPosition().y);
        }
    }
    onDeActivated() {
    }
}
exports.default = TrackingCamera;
//# sourceMappingURL=trackingCamera.js.map