"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// everything that needs to tick inherits from this object
class GameObject {
    constructor(game, gameObjectOptions = {}) {
        this.game = game;
        game.ticker.objects.add(this);
        this.gameObjectOptions = gameObjectOptions;
    }
    // called every frame, deltaTime is in seconds
    tick(deltaTime) {
    }
    // schedule a call with Scheduler
    schedule(time, call, ...args) {
        return this.game.ticker.scheduler.schedule(call, args, time, this);
    }
    get canTick() {
        return this.gameObjectOptions.canTick == undefined ? true : this.gameObjectOptions.canTick;
    }
    destroy() {
        this.game.ticker.objects.delete(this);
    }
}
exports.default = GameObject;
//# sourceMappingURL=gameObject.js.map