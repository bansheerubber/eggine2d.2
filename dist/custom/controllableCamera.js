"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const camera_1 = require("../render/camera");
const vector_1 = require("../helpers/vector");
const keybinds_1 = require("../game/keybinds");
class ControllableCamera extends camera_1.default {
    constructor(game) {
        super(game);
        this.move = {
            up: 0,
            down: 0,
            right: 0,
            left: 0
        };
        this.speed = 750;
        // move the camera up with W
        new keybinds_1.Keybind(() => {
            this.move.up = 1;
        }, () => {
            this.move.up = 0;
        }, "w", keybinds_1.Keybind.None, "Move Camera Up");
        // move the camera down with S
        new keybinds_1.Keybind(() => {
            this.move.down = 1;
        }, () => {
            this.move.down = 0;
        }, "s", keybinds_1.Keybind.None, "Move Camera Down");
        // move the camera left with A
        new keybinds_1.Keybind(() => {
            this.move.left = 1;
        }, () => {
            this.move.left = 0;
        }, "a", keybinds_1.Keybind.None, "Move Camera Left");
        // move the camera right with D
        new keybinds_1.Keybind(() => {
            this.move.right = 1;
        }, () => {
            this.move.right = 0;
        }, "d", keybinds_1.Keybind.None, "Move Camera Right");
        // zoom in the camera with +
        new keybinds_1.Keybind(() => {
            this.zoom += this.zoom * 0.1;
        }, () => {
        }, "=", keybinds_1.Keybind.None, "Zoom In");
        // zoom out the camera with -
        new keybinds_1.Keybind(() => {
            this.zoom += this.zoom * -0.1;
        }, () => {
        }, "-", keybinds_1.Keybind.None, "Zoom Out");
    }
    tick(deltaTime) {
        // apply move to the position
        let speed = this.speed * deltaTime / this.zoom;
        this.position.add(new vector_1.default(-this.move.left * speed + this.move.right * speed, -this.move.up * speed + this.move.down * speed));
        this.game.gamemode.minimapUI.setState({
            cameraX: this.position.x,
            cameraY: this.position.y,
        });
        super.tick(deltaTime);
    }
    onActivated() {
        this.move.up = 0;
        this.move.down = 0;
        this.move.right = 0;
        this.move.left = 0;
    }
    onDeActivated() {
        this.move.up = 0;
        this.move.down = 0;
        this.move.right = 0;
        this.move.left = 0;
    }
}
exports.default = ControllableCamera;
//# sourceMappingURL=controllableCamera.js.map