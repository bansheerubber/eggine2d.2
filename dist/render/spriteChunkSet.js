"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spriteChunk_1 = require("./spriteChunk");
class SpriteChunkSet {
    constructor(parentContainer, cachable = false) {
        this.spriteChunks = [];
        this.parentContainer = parentContainer;
        this.cachable = cachable;
    }
    addToSpriteChunk(sprite) {
        let testPosition = sprite.getPosition().mul_(1 / spriteChunk_1.default.size);
        testPosition.x = Math.floor(testPosition.x);
        testPosition.y = Math.floor(testPosition.y);
        if (this.spriteChunks[testPosition.x] == undefined) {
            this.spriteChunks[testPosition.x] = [];
        }
        let chunk = this.spriteChunks[testPosition.x][testPosition.y];
        if (chunk == undefined) {
            this.spriteChunks[testPosition.x][testPosition.y] = chunk = new spriteChunk_1.default(sprite.game, testPosition, this.parentContainer, this.cachable);
        }
        if (chunk != sprite.chunk) {
            chunk.add(sprite);
        }
        return chunk;
    }
    getSpriteChunk(chunkPosition) {
        if (this.spriteChunks[chunkPosition.x] == undefined) {
            return undefined;
        }
        else {
            return this.spriteChunks[chunkPosition.x][chunkPosition.y];
        }
    }
    getCount() {
        let count = 0;
        for (let index in this.spriteChunks) {
            if (index != "length") {
                count += this.spriteChunks[index].length;
            }
        }
        return count;
    }
}
exports.default = SpriteChunkSet;
//# sourceMappingURL=spriteChunkSet.js.map