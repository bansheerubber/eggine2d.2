"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const renderObject_1 = require("./renderObject");
class Text extends renderObject_1.default {
    constructor(game, message, isFloating, style) {
        super(game);
        this.isFloating = true;
        this.text = new PIXI.Text(message, style);
        this.message = message;
        this.style = style;
        this.isFloating = isFloating;
        if (isFloating) {
            this.game.renderer.static.addChild(this.text);
        }
        else {
            this.game.renderer.dynamic.addChild(this.text);
        }
        this.game.renderer.addObject(this);
    }
    set message(message) {
        this.text.text = message;
    }
    get message() {
        return this.text.text;
    }
    set style(style) {
        this.text.style = style;
    }
    get style() {
        return this.text.style;
    }
}
exports.default = Text;
//# sourceMappingURL=text.js.map