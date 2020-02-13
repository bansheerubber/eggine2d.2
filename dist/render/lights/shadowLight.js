"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const passthrough_vert_1 = require("./shaders/passthrough.vert");
const shadowmask_frag_1 = require("./shaders/shadowmask.frag");
const shadowlight_frag_1 = require("./shaders/shadowlight.frag");
const sprite_1 = require("../sprite");
const vector_1 = require("../../helpers/vector");
const color_1 = require("../../helpers/color");
class ShadowMapGenerator extends PIXI.Filter {
    constructor(game) {
        super(passthrough_vert_1.default, shadowmask_frag_1.default, {
            "resolutionMode": {
                type: "int",
                value: 2,
            },
            "zoom": {
                type: "float",
                value: 1,
            },
        });
        this.game = game;
    }
    apply(filterManager, input, output, clear, currentState) {
        if (ShadowLight.renderTextureResolution == 256) {
            this.uniforms.resolutionMode = 1;
        }
        else if (ShadowLight.renderTextureResolution == 512) {
            this.uniforms.resolutionMode = 2;
        }
        else if (ShadowLight.renderTextureResolution == 1024) {
            this.uniforms.resolutionMode = 3;
        }
        this.uniforms.zoom = this.game.renderer.camera.zoom;
        filterManager.applyFilter(this, input, output, clear);
    }
}
exports.ShadowMapGenerator = ShadowMapGenerator;
class ShadowMapRenderer extends PIXI.Filter {
    constructor(game) {
        super(passthrough_vert_1.default, shadowlight_frag_1.default, {
            "textureSize": {
                type: "float",
                value: 512.0,
            },
            "color": {
                type: "v4",
                value: null,
            },
            "widthHeight": {
                type: "v2",
                value: null,
            },
            "adjustment": {
                type: "float",
                value: null,
            }
        });
        this.startLimit = 0;
        this.endLimit = Math.PI * 2;
        this.textureSize = 512.0;
        this.game = game;
        this.blendMode = PIXI.BLEND_MODES.ADD;
        this.autoFit = false;
    }
    apply(filterManager, input, output, clear, currentState) {
        this.uniforms.textureSize = Math.ceil(this.textureSize - 2);
        this.uniforms.color[0] = this.color.r;
        this.uniforms.color[1] = this.color.g;
        this.uniforms.color[2] = this.color.b;
        this.uniforms.color[3] = this.color.a;
        this.uniforms.adjustment = input.frame.width / this.textureSize;
        filterManager.applyFilter(this, input, output, clear);
    }
}
exports.ShadowMapRenderer = ShadowMapRenderer;
class ShadowLight {
    constructor(game, position, color, radius) {
        this.position = new vector_1.default(0, 0);
        this.color = new color_1.RGBColor(1, 1, 1);
        this.radius = 256.0;
        this.startLimit = 0;
        this.endLimit = Math.PI * 2;
        this.game = game;
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.filter = new ShadowMapRenderer(game);
        this.game.renderer.shadowLights.add(this);
        ShadowLight.shadowLights.add(this);
        this.createRenderTexture();
    }
    createRenderTexture() {
        if (this.renderTexture) {
            this.renderTexture.destroy();
        }
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.renderTexture = PIXI.RenderTexture.create({
            width: ShadowLight.renderTextureResolution,
            height: ShadowLight.renderTextureResolution,
        });
        this.sprite = new sprite_1.default(this.game, this.renderTexture, this.game.renderer.shadows);
        this.sprite.sprite.anchor.x = 0;
        this.sprite.sprite.anchor.y = 0;
        this.sprite.sprite.filters = [this.filter];
    }
    tick() {
        let start = performance.now();
        let container = this.game.renderer.shadowMasks;
        // floor our position, required to display shadows at all
        this.position.x = this.position.x;
        this.position.y = this.position.y;
        // floor our radius
        this.radius = Math.floor(this.radius);
        // save original container position values for later
        let originalScaleX = container.scale.x;
        let originalScaleY = container.scale.y;
        let originalPivotX = container.pivot.x;
        let originalPivotY = container.pivot.y;
        // set the texture size of the shader, so it knows how to look through the shadow map texture
        this.filter.textureSize = Math.floor(this.radius * 2) * originalScaleX;
        // set the color of the shader
        this.filter.color = this.color;
        // passing the range to the shader
        this.filter.startLimit = this.startLimit;
        this.filter.endLimit = this.endLimit;
        // figure out the ratio between the render texture resolution and the radius of the light
        let newScale = (ShadowLight.renderTextureResolution / 2) / this.radius;
        // set the position of the sprite
        this.sprite.setScale(new vector_1.default(1 / newScale, 1 / newScale));
        this.sprite.setPosition(new vector_1.default(-this.radius + this.position.x, -this.radius + this.position.y));
        // apply new position values to container for correct rendering
        container.scale.x *= newScale;
        container.scale.y *= newScale;
        container.scale.x /= originalScaleX; // dumb that we have to do this but we just have to
        container.scale.y /= originalScaleY;
        container.pivot.x = -originalPivotX - this.radius - this.position.x + originalPivotX;
        container.pivot.y = -originalPivotY - this.radius - this.position.y + originalPivotY;
        // render the container
        this.game.renderer.render(container, this.renderTexture);
        // apply original position values to container
        container.scale.x = originalScaleX;
        container.scale.y = originalScaleY;
        container.pivot.x = originalPivotX;
        container.pivot.y = originalPivotY;
        if (this.game.debug) {
            this.game.debug.shadowTime += performance.now() - start;
        }
    }
    // sets the shadow render texture resolution to one of 3 modes
    static setTextureMode(mode) {
        if (mode >= 1 && mode <= 3) {
            this.renderTextureResolution = 2 ** (mode + 7);
        }
        // go through all the shadows and have them regenerate their render textures
        for (let shadowLight of this.shadowLights.values()) {
            shadowLight.createRenderTexture();
        }
    }
    destroy() {
        this.renderTexture.destroy();
        this.sprite.destroy();
        ShadowLight.shadowLights.delete(this);
    }
}
ShadowLight.renderTextureResolution = 512;
ShadowLight.shadowLights = new Set();
exports.default = ShadowLight;
//# sourceMappingURL=shadowLight.js.map