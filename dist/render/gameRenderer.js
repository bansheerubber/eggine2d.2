"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const spriteChunkSet_1 = require("./spriteChunkSet");
const shadowLight_1 = require("./lights/shadowLight");
class GameRenderer {
    constructor(game) {
        this.objects = [];
        this.dynamic = new PIXI.Container(); // moves with a camera
        this.hex = new PIXI.Container(); // hex map
        this.shadowMasks = new PIXI.Container(); // contains all the masks used to make the shadow sprites
        this.shadows = new PIXI.Container(); // contains all the shadow sprites
        this.static = new PIXI.Container(); // does not move with a camera
        this.chunks = new Map();
        this.shadowLights = new Set();
        this.enabled = true;
        this.game = game;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        // setup the pixi application
        this.pixiApp = new PIXI.Application({
            width: document.getElementById("canvasContainer").clientWidth,
            height: document.getElementById("canvasContainer").clientHeight,
            backgroundColor: 0x333333,
            resizeTo: document.getElementById("canvasContainer"),
            powerPreference: "high-performance",
            antialias: true,
        });
        this.pixiApp.stage.addChild(this.shadows);
        this.pixiApp.stage.addChild(this.dynamic);
        this.pixiApp.stage.addChild(this.hex);
        this.pixiApp.stage.addChild(this.static);
        this.chunks.set(this.dynamic, new spriteChunkSet_1.default(this.dynamic));
        this.chunks.set(this.shadowMasks, new spriteChunkSet_1.default(this.shadowMasks));
        this.chunks.set(this.hex, new spriteChunkSet_1.default(this.hex, true));
        this.shadowMasks.filters = [new shadowLight_1.ShadowMapGenerator(this.game)]; // add shadow map generation filter to shadowmasks
        document.getElementById("canvasContainer").appendChild(this.pixiApp.view);
        this.pixiApp.view.id = "canvas";
        this.pixiApp.view.onselect = function () {
            return false;
        };
        this.pixiApp.stop(); // don't automatically render
    }
    // pass through for rendering on the renderer
    render(object, destination) {
        this.pixiApp.renderer.render(object, destination);
    }
    tick(deltaTime) {
        if (this._camera) {
            this._camera.tick(deltaTime); // have the camera apply its transformations
        }
        // render shadow maps
        for (let shadowLight of this.shadowLights.values()) {
            shadowLight.tick();
        }
        this.pixiApp.render(); // render everything
    }
    updateCamera(x, y, zoom, rotation) {
        this.dynamic.pivot.x = x;
        this.dynamic.pivot.y = y;
        this.dynamic.scale.x = zoom;
        this.dynamic.scale.y = zoom;
        this.dynamic.rotation = rotation;
        this.hex.pivot.x = x;
        this.hex.pivot.y = y;
        this.hex.scale.x = zoom;
        this.hex.scale.y = zoom;
        this.hex.rotation = rotation;
        this.shadowMasks.pivot.x = x;
        this.shadowMasks.pivot.y = y;
        this.shadowMasks.scale.x = zoom;
        this.shadowMasks.scale.y = zoom;
        this.shadowMasks.rotation = rotation;
        this.shadows.pivot.x = Math.floor(x);
        this.shadows.pivot.y = Math.floor(y);
        this.shadows.scale.x = zoom;
        this.shadows.scale.y = zoom;
        this.shadows.rotation = rotation;
    }
    set camera(camera) {
        // if we have a camera, call the deactivated callback on it
        if (this._camera) {
            this._camera.onDeActivated();
        }
        this._camera = camera;
        camera.onActivated(); // call the activated callback on the new active camera
    }
    get camera() {
        return this._camera;
    }
    get width() {
        return this.pixiApp.view.width;
    }
    get height() {
        return this.pixiApp.view.height;
    }
    getGPUName() {
        let gpuName = undefined;
        let canvas = document.getElementById("canvas");
        let gl = canvas.getContext("webgl2");
        if (gl) {
            let dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (dbgRenderInfo != null) {
                gpuName = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
            }
            return gpuName;
        }
        else {
            return "No GPU?";
        }
    }
    addObject(renderObject) {
        this.objects.push(renderObject);
    }
    removeObject(renderObject) {
        let index = this.objects.indexOf(renderObject);
        delete this.objects[index];
        this.objects.splice(index, 1);
    }
    addDynamicFilter(input) {
        if (this.dynamic.filters == undefined) {
            this.dynamic.filters = [];
        }
        let newArray = [];
        for (let filter of this.dynamic.filters) {
            newArray.push(filter);
        }
        newArray.push(input);
        this.dynamic.filters = newArray;
    }
    removeDynamicFilter(input) {
        if (this.dynamic.filters != undefined) {
            let newArray = [];
            for (let filter of this.dynamic.filters) {
                if (filter != input) {
                    newArray.push(filter);
                }
            }
            this.dynamic.filters = newArray;
        }
    }
}
exports.default = GameRenderer;
//# sourceMappingURL=gameRenderer.js.map