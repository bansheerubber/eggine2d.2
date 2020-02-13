"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hex_1 = require("../hex");
class WaterHex extends hex_1.default {
    constructor(game, gameObjectOptions) {
        super(game, {
            canTick: false,
        });
    }
}
WaterHex.resource = "./data/sprites/hexes/water.png";
WaterHex.minimapColor = "rgb(3, 169, 252)";
exports.default = WaterHex;
//# sourceMappingURL=water.js.map