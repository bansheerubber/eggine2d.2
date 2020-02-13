"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const text_1 = require("../render/text");
const Matter = require("matter-js");
const keybinds_1 = require("./keybinds");
class Average {
    constructor() {
        this.averageArray = [];
        this.drops = []; // keeps track of the biggest drops we have over this period
    }
    push(input) {
        let oldAverage = this.getAverage();
        this.averageArray.push(input);
        if (this.averageArray.length > 0) {
            this.drops.push(oldAverage - this.getAverage());
        }
        if (this.averageArray.length > Average.averageMax) {
            this.averageArray.splice(0, 1);
        }
        if (this.drops.length > Average.averageMax) {
            this.drops.splice(0, 1);
        }
    }
    getAverage() {
        let total = 0;
        for (let element of this.averageArray) {
            total += element;
        }
        return total / this.averageArray.length;
    }
    // finds the lowest number, which correlates to the biggest drop in value
    getBiggestDrop() {
        let smallest = Number.MAX_VALUE;
        for (let element of this.drops) {
            if (element < smallest) {
                smallest = element;
            }
        }
        return smallest;
    }
}
Average.averageMax = 30;
class Debug {
    constructor(game) {
        this.shadowTime = 0;
        this.deltaAverage = new Average();
        this.totalDeltaAverage = new Average();
        this.tickAverage = new Average();
        this.renderAverage = new Average();
        this.collisionAverage = new Average();
        this.shadowAverage = new Average();
        this.jsSpeed = this.getJSSpeed();
        this.shouldRenderCollisions = false;
        this.oldWidth = 0;
        this.oldHeight = 0;
        this.appliedMod = false;
        this.game = game;
        this.text = new text_1.default(game, "big", true, new PIXI.TextStyle({
            fill: 0x00FF00,
            fontSize: 12
        }));
        this.gpu = this.game.renderer.getGPUName();
        this.renderer = Matter.Render.create({
            element: document.body,
            engine: this.game.collision.engine,
            options: {
                width: this.game.renderer.width,
                height: this.game.renderer.height,
                hasBounds: true,
                showVelocity: true,
                showPosition: true,
                showConvexHulls: true,
                showCollisions: true,
                showSeparations: true,
                showAxes: true,
                showPositions: true,
                showDebug: true,
                wireframeBackground: "rgba(0, 0, 0, 0)",
                background: "rgba(0, 0, 0, 0)",
                wireframes: false,
            }
        });
        this.oldWidth = this.game.renderer.width;
        this.oldHeight = this.game.renderer.height;
        // toggle rendering collision debug
        new keybinds_1.Keybind(() => {
            if (this.shouldRenderCollisions) {
                let context = this.renderer.canvas.getContext("2d");
                context.clearRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
            }
            this.shouldRenderCollisions = !this.shouldRenderCollisions;
        }, () => {
        }, "f2", keybinds_1.Keybind.None, "");
    }
    updateCamera() {
        if (this.game.renderer && this.game.renderer.camera) {
            Matter.Render.lookAt(this.renderer, {
                min: {
                    x: this.game.renderer.camera.position.x - (this.game.renderer.width / 2) / this.game.renderer.camera.zoom,
                    y: this.game.renderer.camera.position.y - (this.game.renderer.height / 2) / this.game.renderer.camera.zoom,
                },
                max: {
                    x: this.game.renderer.camera.position.x + (this.game.renderer.width / 2) / this.game.renderer.camera.zoom,
                    y: this.game.renderer.camera.position.y + (this.game.renderer.height / 2) / this.game.renderer.camera.zoom,
                },
            });
        }
    }
    update(deltaTime, tickedCount, maxTickedCount, tickTime, renderTime, collisionTime, totalDeltaTime) {
        if (this.game.renderer && this.game.renderer.camera) {
            this.updateCamera();
            if (this.game.renderer.width != this.oldWidth || this.game.renderer.height != this.oldHeight) {
                this.renderer.options.width = this.game.renderer.width;
                this.renderer.options.height = this.game.renderer.height;
                this.renderer.canvas.width = this.game.renderer.width;
                this.renderer.canvas.height = this.game.renderer.height;
            }
            this.oldWidth = this.game.renderer.width;
            this.oldHeight = this.game.renderer.height;
        }
        this.deltaAverage.push(deltaTime);
        this.totalDeltaAverage.push(totalDeltaTime);
        this.tickAverage.push(tickTime);
        this.renderAverage.push(renderTime);
        this.collisionAverage.push(collisionTime);
        this.shadowAverage.push(this.shadowTime);
        this.shadowTime = 0;
        let fps = 1000 / (this.deltaAverage.getAverage() * 1000 + this.tickAverage.getAverage() + this.renderAverage.getAverage() + this.collisionAverage.getAverage());
        let message = [
            `Version: ${this.game.version}`,
            `JSSpeed: ${this.jsSpeed.toFixed(3)}s`,
            `GPU: ${this.gpu}`,
            `FPS: ${fps.toFixed(0)}`,
            `Delta Time: ${(this.deltaAverage.getAverage() * 1000).toFixed(2)} (${(this.deltaAverage.getBiggestDrop() * 1000).toFixed(2)}) ms`,
            `Total Delta Time: ${(this.totalDeltaAverage.getAverage() * 1000).toFixed(2)} (${(this.totalDeltaAverage.getBiggestDrop() * 1000).toFixed(2)}) ms`,
            `Tick Time: ${this.tickAverage.getAverage().toFixed(2)} (${this.tickAverage.getBiggestDrop().toFixed(2)}) ms`,
            `Render Time: ${this.renderAverage.getAverage().toFixed(2)} (${this.renderAverage.getBiggestDrop().toFixed(2)}) ms`,
            `Shadow Map Gen Time: ${this.shadowAverage.getAverage().toFixed(2)} (${this.shadowAverage.getBiggestDrop().toFixed(2)}) ms`,
            `Collision Time: ${this.collisionAverage.getAverage().toFixed(2)} (${this.collisionAverage.getBiggestDrop().toFixed(2)}) ms`,
            `Resolution: ${this.game.renderer.width}x${this.game.renderer.height}, ${(this.game.renderer.width / this.game.renderer.height).toFixed(2)}`,
            `# Objects Ticked: ${tickedCount}/${maxTickedCount}`,
            `# Rigid Bodies: ${this.game.collision.collidables.size}`,
            `Latency: ${Math.floor(this.game.network.client.ping)}`,
            `Connection: ${this.game.network.client.url}`,
        ];
        this.text.message = message.join("\n");
    }
    // determines how fast our JS environment is by performing some tests. returns a number representing the results of the tests. lower number is better
    // note: does not equate to processor speed, but allows us to predict how long rendering/ticking will take
    getJSSpeed() {
        let start = performance.now();
        let amount = 5000000; // 5,000,000. good amount because it won't stress computers too much but will still provide accurate results
        let testArray = [];
        // just threw some bullshit operations together that should hopefully not be optimized by the javascript engine
        for (let i = amount; i > 0; i--) {
            let num = i * i / 2 + i * 31;
            testArray[i % 50] = num;
        }
        let end = performance.now();
        return (end - start) / 1000; // return speed in seconds
    }
}
exports.default = Debug;
//# sourceMappingURL=debug.js.map