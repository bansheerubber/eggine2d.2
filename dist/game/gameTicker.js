"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
const scheduler_1 = require("./scheduler");
const Matter = require("matter-js");
class GameTicker {
    constructor(game) {
        this.objects = new Set(); // all the game objects in our list
        this.scheduler = new scheduler_1.default();
        this.timescale = 1;
        this.lastCollisionTime = 0;
        this.lastRenderTime = 0;
        this.lastTickTime = 0;
        this.lastTick = 0; // the last time we ticked
        this.lastTotalDeltaTime = 16 / 1000; // the last amount of time it took to do an entire frame, including deltatime, tick time, and render time
        this.game = game;
    }
    // starts ticking if we weren't already
    start() {
        this.isTicking = true;
        this.tick();
    }
    // stops ticking if we were ticking already
    stop() {
        this.isTicking = false;
    }
    tick() {
        let startTick = perf_hooks_1.performance.now();
        let deltaTime = (startTick - this.lastTick) / 1000;
        let totalDeltaTime = ((startTick - this.lastTick) + this.lastTickTime + this.lastRenderTime + this.lastCollisionTime) / 1000;
        let usedDeltaTime = Math.min(totalDeltaTime, 0.033);
        let usedLastDeltaTime = Math.min(this.lastTotalDeltaTime, 0.033);
        // tick collision
        if (this.game.collision) {
            var collisionTime = perf_hooks_1.performance.now();
            this.game.collision.tick(usedDeltaTime * this.timescale, usedLastDeltaTime * this.timescale);
            this.lastCollisionTime = perf_hooks_1.performance.now() - collisionTime;
        }
        // tick all the objects
        let tickTime = perf_hooks_1.performance.now();
        let tickedCount = this.tickObjects(usedDeltaTime * this.timescale); // tick all the game objects
        let maxTickedCount = this.objects.size; // how many objects we could've ticked
        this.scheduler.tick(); // tick the scheduler
        this.lastTickTime = perf_hooks_1.performance.now() - tickTime;
        // tick renderer
        if (this.game.renderer && this.game.renderer.enabled) {
            var renderTime = perf_hooks_1.performance.now();
            this.game.renderer.tick(usedDeltaTime * this.timescale);
            this.lastRenderTime = perf_hooks_1.performance.now() - renderTime;
        }
        // update debug info
        if (this.game.debug) {
            if (this.game.debug.shouldRenderCollisions) {
                this.game.debug.updateCamera();
                let time = perf_hooks_1.performance.now();
                Matter.Render.world(this.game.debug.renderer);
                this.lastCollisionTime += perf_hooks_1.performance.now() - time;
            }
            this.game.debug.update(deltaTime, tickedCount, maxTickedCount, this.lastTickTime, this.lastRenderTime, this.lastCollisionTime, totalDeltaTime);
        }
        if (this.isTicking) {
            if (this.game.isClient) {
                window.requestAnimationFrame(this.tick.bind(this));
            }
            else {
                setTimeout(() => {
                    this.tick();
                }, GameTicker.serverTickRate);
            }
        }
        this.lastTick = perf_hooks_1.performance.now();
        this.lastTotalDeltaTime = totalDeltaTime;
    }
    tickObjects(deltaTime) {
        let tickedCount = 0;
        for (let gameObject of this.objects.values()) {
            if (gameObject.canTick) {
                gameObject.tick(deltaTime);
                tickedCount++;
            }
            else {
                this.objects.delete(gameObject);
            }
        }
        return tickedCount;
    }
}
GameTicker.serverTickRate = 30;
exports.default = GameTicker;
//# sourceMappingURL=gameTicker.js.map