"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controllableCamera_1 = require("./controllableCamera");
const imageResource_1 = require("../render/imageResource");
const grass_1 = require("./hexes/types/grass");
const hexMap_1 = require("./hexes/hexMap");
const water_1 = require("./hexes/types/water");
const mountain_1 = require("./hexes/types/mountain");
const overworldGamemode_1 = require("./hexes/overworldGamemode");
const React = require("react");
const ReactDOM = require("react-dom");
const minimapUI_1 = require("./hexes/minimapUI");
async function default_1(game) {
    hexMap_1.default.registerHexClass(0, water_1.default);
    hexMap_1.default.registerHexClass(1, grass_1.default);
    hexMap_1.default.registerHexClass(2, mountain_1.default);
    game.gamemode = new overworldGamemode_1.default(game, new hexMap_1.default(game));
    if (game.isClient) {
        ReactDOM.render(React.createElement(minimapUI_1.default, { game: game }), document.getElementById("minimapContainer"));
        imageResource_1.default.queueImage("./data/sprites/units/antiair.json");
        imageResource_1.default.queueImage("./data/sprites/hexes/hex.png");
        imageResource_1.default.queueImage("./data/sprites/hexes/mountain.png");
        imageResource_1.default.queueImage("./data/sprites/hexes/water.png");
        imageResource_1.default.loadImages().then(() => {
            // map.createTestMap()
            game.gamemode.hexMap.loadMap("./data/map.egg").then(() => {
                game.gamemode.minimapUI.generateMinimap();
            });
        });
        game.renderer.camera = new controllableCamera_1.default(game);
        game.renderer.camera.zoom = 1;
    }
}
exports.default = default_1;
//# sourceMappingURL=main.js.map