"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
// helps load images using PixiJS
class ImageResource {
    static queueImage(imageURL) {
        PIXI.Loader.shared.add(imageURL);
    }
    static async loadImages() {
        return new Promise((resolve, reject) => {
            PIXI.Loader.shared.load(resolve);
        });
    }
}
exports.default = ImageResource;
//# sourceMappingURL=imageResource.js.map