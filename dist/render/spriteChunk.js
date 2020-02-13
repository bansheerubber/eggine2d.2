"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameObject_1 = require("../game/gameObject");
const vector_1 = require("../helpers/vector");
const range_1 = require("../helpers/range");
const color_1 = require("../helpers/color");
const PIXI = require("pixi.js");
const scheduler_1 = require("../game/scheduler");
class SpriteChunk extends gameObject_1.default {
    constructor(game, chunkPosition, parentContainer, cachable = false) {
        super(game);
        this.sprites = new Set();
        this.container = new PIXI.Container();
        this.isVisible = true;
        this.sortedSpritesX = []; // sorted by distance of sprite's bottom corner to the screen position of the chunk, highest is last
        this.sortedSpritesY = []; // sorted by distance of sprite's bottom corner to the screen position of the chunk, highest is last
        this.chunkPosition = chunkPosition;
        this.position = this.chunkPosition.mul_(SpriteChunk.size);
        this.maxBoundary = this.position.clone();
        this.cachable = cachable;
        parentContainer.addChild(this.container);
        if (SpriteChunk.debug) {
            this.graphics = new PIXI.Graphics();
            this.color = (new color_1.HSVColor(range_1.default.getRandomDec(0, 1), 1, 1)).toRGB();
            this.game.renderer.dynamic.addChild(this.graphics);
        }
    }
    tick(deltaTime) {
        super.tick(deltaTime);
        let isOnScreen = this.game.renderer.camera.showsBox(this.minBoundary, this.maxBoundary.x - this.minBoundary.x, this.maxBoundary.y - this.minBoundary.y);
        if (isOnScreen && !this.isVisible) {
            this.isVisible = true;
            this.container.visible = true;
        }
        else if (!isOnScreen && this.isVisible) {
            this.isVisible = false;
            this.container.visible = false;
        }
        if (this.graphics) {
            this.graphics.clear();
            this.graphics.lineStyle(1 * 1 / this.game.renderer.camera.zoom, this.color.toHex());
            this.graphics.beginFill(0x000000, 0);
            this.graphics.drawRect(this.minBoundary.x, this.minBoundary.y, this.maxBoundary.x - this.minBoundary.x, this.maxBoundary.y - this.minBoundary.y);
            this.graphics.endFill();
        }
        if (this.cachable && !this.container.cacheAsBitmap) {
            new scheduler_1.ScheduleObject(this.game.ticker.scheduler, this, () => {
                this.container.cacheAsBitmap = true;
            }, [], new scheduler_1.Frames(0)).execute(); // reengage the cache the next frame
        }
    }
    add(sprite) {
        this.sprites.add(sprite);
        if (this.sortedSpritesX.length == 0) {
            this.sortedSpritesX.push(sprite);
            this.sortedSpritesY.push(sprite);
        }
        else {
            let position = sprite.getPosition();
            // uses some ifsajdsfhdsajflkdsafdsafoij to add sprites to a sorted list
            let addToSortedListX = (start, end) => {
                let testIndex = Math.floor((start + end) / 2);
                let testPosition = this.sortedSpritesX[testIndex].getPosition();
                let newStart, newEnd;
                if (position.x > testPosition.x) {
                    newStart = testIndex + 1;
                    newEnd = end;
                }
                else if (position.x < testPosition.x) {
                    newStart = start;
                    newEnd = testIndex;
                }
                if (position.x == testPosition.x) { // special case if they are equal to eachother
                    this.sortedSpritesX.splice(testIndex, 0, sprite);
                }
                else {
                    // we have found the position to insert stuff at
                    if (newStart == newEnd) {
                        this.sortedSpritesX.splice(newEnd, 0, sprite);
                    }
                    else {
                        addToSortedListX(newStart, newEnd);
                    }
                }
            };
            // uses some ifsajdsfhdsajflkdsafdsafoij to add sprites to a sorted list
            let addToSortedListY = (start, end) => {
                let testIndex = Math.floor((start + end) / 2);
                let testPosition = this.sortedSpritesY[testIndex].getPosition();
                let newStart, newEnd;
                if (position.y > testPosition.y) {
                    newStart = testIndex + 1;
                    newEnd = end;
                }
                else if (position.y < testPosition.y) {
                    newStart = start;
                    newEnd = testIndex;
                }
                if (position.y == testPosition.y) { // special case if they are equal to eachother
                    this.sortedSpritesY.splice(testIndex, 0, sprite);
                }
                else {
                    // we have found the position to insert stuff at
                    if (newStart == newEnd) {
                        this.sortedSpritesY.splice(newEnd, 0, sprite);
                    }
                    else {
                        addToSortedListY(newStart, newEnd);
                    }
                }
            };
            addToSortedListX(0, this.sortedSpritesX.length);
            addToSortedListY(0, this.sortedSpritesY.length);
        }
        this.recalcBoundary();
        // pixijs operations
        this.container.addChild(sprite.sprite);
        if (this.cachable) {
            this.container.cacheAsBitmap = false;
        }
    }
    remove(sprite) {
        this.sprites.delete(sprite);
        this.sortedSpritesX.splice(this.sortedSpritesX.indexOf(sprite), 1);
        this.sortedSpritesY.splice(this.sortedSpritesY.indexOf(sprite), 1);
        this.recalcBoundary();
        // pixijs operations
        this.container.removeChild(sprite.sprite);
        if (this.cachable) {
            this.container.cacheAsBitmap = false;
        }
    }
    // updates a sprites position within the chunk
    updateSprite(sprite) {
        this.remove(sprite);
        this.add(sprite);
    }
    recalcBoundary() {
        if (this.sortedSpritesX.length > 0) {
            let foundMaxX = this.sortedSpritesX[this.sortedSpritesX.length - 1];
            let foundMaxY = this.sortedSpritesY[this.sortedSpritesY.length - 1];
            this.maxBoundary = new vector_1.default(foundMaxX.getPosition().x + foundMaxX.width / 2, foundMaxY.getPosition().y + foundMaxY.height / 2);
            let foundMinX = this.sortedSpritesX[0];
            let foundMinY = this.sortedSpritesY[0];
            this.minBoundary = new vector_1.default(foundMinX.getPosition().x - foundMinX.width / 2, foundMinY.getPosition().y - foundMinY.height / 2);
        }
        else {
            this.minBoundary = this.position.clone();
            this.maxBoundary = this.position.clone();
        }
    }
}
SpriteChunk.size = 1000; // how many pixels wide/tall the chunk is
SpriteChunk.debug = false;
exports.default = SpriteChunk;
//# sourceMappingURL=spriteChunk.js.map