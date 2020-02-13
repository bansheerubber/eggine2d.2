"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hex_1 = require("../hex");
class MountainHex extends hex_1.default {
    constructor(game, gameObjectOptions) {
        super(game, {
            canTick: false,
        });
    }
}
MountainHex.resource = "./data/sprites/hexes/mountain.png";
MountainHex.minimapColor = "rgb(112, 112, 112)";
exports.default = MountainHex;
//# sourceMappingURL=mountain.js.map