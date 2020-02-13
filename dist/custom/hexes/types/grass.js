"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hex_1 = require("../hex");
class GrassHex extends hex_1.default {
    constructor(game, gameObjectOptions) {
        super(game, {
            canTick: false,
        });
    }
}
GrassHex.resource = "./data/sprites/hexes/hex.png";
GrassHex.minimapColor = "rgb(47, 138, 62)";
exports.default = GrassHex;
//# sourceMappingURL=grass.js.map