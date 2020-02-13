"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("../helpers/vector");
class Camera {
    constructor(game) {
        this.position = new vector_1.default(0, 0);
        this._zoom = 1;
        this._rotation = 0;
        this.tempVec = new vector_1.default(0, 0);
        this.game = game;
        this.renderer = game.renderer;
    }
    // whether or not the camera shows the specified point
    shows(point) {
        let halfWidth = (this.renderer.width / this.zoom) / 2;
        let halfHeight = (this.renderer.height / this.zoom) / 2;
        if (point.x > this.position.x - halfWidth && point.y > this.position.y - halfHeight
            && point.x < this.position.x + halfWidth && point.y < this.position.y + halfHeight) {
            return true;
        }
        else {
            return false;
        }
    }
    // whether or not the camers shows any part of the specified box
    showsBox(position, width, height) {
        function isValueInRange(value, min, max) {
            return value >= min && value <= max;
        }
        let corner = this.tempVec.copy(this.position);
        corner.x -= (this.renderer.width / this._zoom) / 2;
        corner.y -= (this.renderer.height / this._zoom) / 2;
        let xOverlap = isValueInRange(position.x, corner.x, corner.x + this.renderer.width / this._zoom)
            || isValueInRange(corner.x, position.x, position.x + width);
        let yOverlap = isValueInRange(position.y, corner.y, corner.y + this.renderer.height / this._zoom)
            || isValueInRange(corner.y, position.y, position.y + height);
        return xOverlap && yOverlap;
    }
    // interpolate between one position and another based on the interpolation object we provide
    interpolatePosition(interpolation) {
        // if we already have an active interpolation, destroy it
        if (this.activePositionInterpolation) {
            this.activePositionInterpolation.destroy();
        }
        this.activePositionInterpolation = interpolation;
        interpolation.endCallback = interpolation.callback = (vector) => {
            this.position.x = vector.x;
            this.position.y = vector.y;
        };
    }
    // interpolate between one zoom and another based on the interpolation object we provide
    interpolateZoom(interpolation) {
        // if we already have an active interpolation, destroy it
        if (this.activeScalarInterpolation) {
            this.activeScalarInterpolation.destroy();
        }
        this.activeScalarInterpolation = interpolation;
        interpolation.endCallback = interpolation.callback = (zoom) => {
            this.zoom = zoom;
        };
    }
    tick(deltaTime) {
        let width = Math.floor(this.renderer.pixiApp.screen.width / 2);
        let height = Math.floor(this.renderer.pixiApp.screen.height / 2);
        this.renderer.updateCamera(this.position.x - width / this._zoom, this.position.y - height / this._zoom, this._zoom, this._rotation);
    }
    set zoom(zoom) {
        this._zoom = zoom;
    }
    get zoom() {
        return this._zoom;
    }
    set rotation(rotation) {
        this._rotation = rotation;
    }
    get rotation() {
        return this._rotation;
    }
    mouseToWorld(mouseX, mouseY) {
        mouseX -= this.renderer.width / 2;
        mouseY -= this.renderer.height / 2;
        let output = this.position.clone();
        output.x += mouseX * 1 / this.zoom;
        output.y += mouseY * 1 / this.zoom;
        return output;
    }
}
exports.default = Camera;
//# sourceMappingURL=camera.js.map