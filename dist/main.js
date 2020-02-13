"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
// handle reading .vert/.frag files on server side
if (typeof window == "undefined") {
    require.extensions[".vert"] = function (module, filename) {
        module.exports = fs.readFileSync(filename, 'utf8');
    };
    require.extensions[".frag"] = function (module, filename) {
        module.exports = fs.readFileSync(filename, 'utf8');
    };
}
const game_1 = require("./game/game");
const main_1 = require("./custom/main");
const vector_1 = require("./helpers/vector");
const vectorInterpolation_1 = require("./helpers/vectorInterpolation");
const scalarInterpolation_1 = require("./helpers/scalarInterpolation");
(async function () {
    let game = new game_1.default(typeof window != "undefined");
    game.start();
    /* deconversion process:
        - read through object JSON and deconvert all properties/remote objects
        - go through all previously created remote objects and assign their correct properties to every single one of their references
        - once all remote objects have been deconverted, go through all of them in their order of creation and reconstruct them
            - use ::createRemoteClass to assist with this, which allows the reconstruction of remote objects inside other remote object's constructors
            - only ::reconstructor is called, constructor is not called during this process
        - once reconstructed, we are finished
    */
    main_1.default(game);
    if (game.isClient) {
        window["game"] = game;
        window["Vector"] = vector_1.default;
        window["VectorInterpolation"] = vectorInterpolation_1.default;
        window["SmoothVectorInterpolation"] = vectorInterpolation_1.SmoothVectorInterpolation;
        window["ScalarInterpolation"] = scalarInterpolation_1.default;
        window["SmoothScalarInterpolation"] = scalarInterpolation_1.SmoothScalarInterpolation;
    }
})();
//# sourceMappingURL=main.js.map