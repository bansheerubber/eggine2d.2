"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gamemode_1 = require("../../game/gamemode");
class OverworldGamemode extends gamemode_1.default {
    constructor(game, hexMap) {
        super(game);
        this.hexMap = hexMap;
    }
}
exports.default = OverworldGamemode;
//# sourceMappingURL=overworldGamemode.js.map