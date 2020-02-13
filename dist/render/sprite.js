"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const networkDecorators_1 = require("../network/networkDecorators");
const renderObject_1 = require("./renderObject");
const game_1 = require("../game/game");
const vector_1 = require("../helpers/vector");
const color_1 = require("../helpers/color");
let Sprite = class Sprite extends renderObject_1.default {
    constructor(game, resource, customContainer) {
        super(game, {
            canTick: false
        });
        this.cameras = [];
        this._scale = new vector_1.default(1, 1);
        this._position = new vector_1.default(0, 0);
        // create empty sprite
        if (resource == undefined) {
            this.sprite = new PIXI.Sprite(undefined);
        }
        // create from texture
        else if (resource instanceof PIXI.Texture) {
            this.sprite = new PIXI.Sprite(resource);
        }
        // create from URL
        else {
            this.sprite = PIXI.Sprite.from(resource);
        }
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        if (!customContainer) {
            this.game.renderer.dynamic.addChild(this.sprite);
            this.container = this.game.renderer.dynamic;
            let chunkSet = this.game.renderer.chunks.get(this.game.renderer.dynamic);
            if (chunkSet) {
                this.chunk = chunkSet.addToSpriteChunk(this);
            }
        }
        else {
            customContainer.addChild(this.sprite);
            this.container = customContainer;
            let chunkSet = this.game.renderer.chunks.get(customContainer);
            if (chunkSet) {
                this.chunk = chunkSet.addToSpriteChunk(this);
            }
        }
    }
    setPosition(position) {
        this.sprite.transform.position.x = position.x;
        this.sprite.transform.position.y = position.y;
        this._position.x = position.x;
        this._position.y = position.y;
        let chunkSet = this.game.renderer.chunks.get(this.container);
        if (chunkSet) {
            let oldChunk = this.chunk;
            if (oldChunk != (this.chunk = chunkSet.addToSpriteChunk(this)) && oldChunk) {
                oldChunk.remove(this);
            }
            else if (this.chunk && oldChunk) {
                this.chunk.updateSprite(this);
            }
        }
    }
    getPosition() {
        this._position.x = this.sprite.transform.position.x;
        this._position.y = this.sprite.transform.position.y;
        return this._position;
    }
    setScale(scale) {
        this.sprite.transform.scale.x = scale.x;
        this.sprite.transform.scale.y = scale.y;
        this._scale.x = scale.x;
        this._scale.y = scale.y;
    }
    getScale() {
        this._scale.x = this.sprite.transform.scale.x;
        this._scale.y = this.sprite.transform.scale.y;
        return this._scale;
    }
    set rotation(rotation) {
        this.sprite.rotation = rotation;
    }
    get rotation() {
        return this.sprite.rotation;
    }
    set texture(resource) {
        if (resource instanceof PIXI.Texture) {
            this.sprite.texture = resource;
        }
        else {
            this.sprite.texture = PIXI.Texture.from(resource);
        }
    }
    get texture() {
        return this.sprite.texture;
    }
    set tint(color) {
        this.sprite.tint = color.toHex();
    }
    get tint() {
        return color_1.RGBColor.from(this.sprite.tint);
    }
    set opacity(opacity) {
        this.sprite.alpha = opacity;
    }
    get opacity() {
        return this.sprite.alpha;
    }
    set blendMode(mode) {
        this.sprite.blendMode = mode;
    }
    get blendMode() {
        return this.sprite.blendMode;
    }
    get width() {
        return this.sprite.width;
    }
    get height() {
        return this.sprite.height;
    }
    set isVisible(value) {
        this.sprite.visible = value;
    }
    get isVisible() {
        return this.sprite.visible;
    }
    destroy() {
        super.destroy();
        this.sprite.destroy();
        if (this.chunk) {
            this.chunk.remove(this);
        }
    }
};
Sprite = __decorate([
    networkDecorators_1.gameClass,
    __metadata("design:paramtypes", [game_1.default, Object, PIXI.Container])
], Sprite);
exports.default = Sprite;
//# sourceMappingURL=sprite.js.map