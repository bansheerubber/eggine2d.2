"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameObject_1 = require("../game/gameObject");
class RenderObject extends gameObject_1.default {
    constructor(game, gameObjectOptions) {
        super(game, gameObjectOptions);
        this.game.renderer.addObject(this);
    }
    destroy() {
        super.destroy();
        this.game.renderer.removeObject(this);
    }
}
exports.default = RenderObject;
//# sourceMappingURL=renderObject.js.map