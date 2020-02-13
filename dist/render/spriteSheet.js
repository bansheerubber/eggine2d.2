"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const sprite_1 = require("./sprite");
class SpriteSheet extends sprite_1.default {
    constructor(game, resource, customContainer) {
        super(game, undefined, customContainer);
        this._sheetIndex = 0;
        try {
            if (resource instanceof PIXI.Spritesheet) {
                this.spritesheet = resource;
            }
            else {
                this.spritesheet = PIXI.Loader.shared.resources[resource].spritesheet;
            }
            this.sheetIndex = 0;
        }
        catch (error) {
            console.log(`Failed to load spritesheet resource ${resource}.`, error);
        }
    }
    set sheetIndex(sheetIndex) {
        this._sheetIndex = sheetIndex;
        if (this.spritesheet.textures) {
            let properties = Object.getOwnPropertyNames(this.spritesheet.textures);
            sheetIndex = sheetIndex % properties.length;
            this.texture = this.spritesheet.textures[properties[sheetIndex]];
        }
    }
    get sheetIndex() {
        return this._sheetIndex;
    }
}
exports.default = SpriteSheet;
//# sourceMappingURL=spriteSheet.js.map