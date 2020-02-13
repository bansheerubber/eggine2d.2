"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const remoteObject_1 = require("../../network/remoteObject");
const vector_1 = require("../../helpers/vector");
const sprite_1 = require("../../render/sprite");
class Hex extends remoteObject_1.default {
    constructor(game, gameObjectOptions) {
        super(game, gameObjectOptions);
        this.position = new vector_1.default();
        this.sprite = new sprite_1.default(game, this.constructor.resource, this.game.renderer.hex);
    }
    setPosition(position) {
        // reset the position of this hex in our map
        if (this.map) {
            this.map.removeHex(this);
            this.map.addHex(this);
        }
        // set the position of the hex's sprite
        let x = this.position.x * Hex.width - Hex.xOffset * this.position.x;
        let y = this.position.y * Hex.height - Hex.outline * this.position.y + this.position.x % 2 * Hex.height / 2 - this.position.x % 2;
        this.sprite.setPosition(this.sprite.getPosition().set(x, y));
    }
}
Hex.resource = "";
Hex.width = 43;
Hex.height = 36;
Hex.xOffset = 10;
Hex.outline = 2;
Hex.minimapColor = "rgb(0, 0, 0)";
exports.default = Hex;
//# sourceMappingURL=hex.js.map