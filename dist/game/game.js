"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameTicker_1 = require("./gameTicker");
const network_1 = require("../network/network");
const clientNetwork_1 = require("../network/clientNetwork");
const serverNetwork_1 = require("../network/serverNetwork");
const gameRenderer_1 = require("../render/gameRenderer");
const debug_1 = require("./debug");
const gameCollision_1 = require("../collision/gameCollision");
class Game {
    constructor(isClient) {
        // how my system of versioning works:
        // string is in the front with the in-house name of the game. colon separates the game name from the version
        // first digit indicates major release, which contains significant game changing features that may significantly alter the meta of the game or how the game is played. this digit is meant to give some cadence to the version system, and is purely for publicity
        // second digit indicates a minor release, which may have multiple bug fixes. minor releases, especially during the pre-release versions, will basically be incremented completely arbitrarily
        // third digit increments by 1 for every gameplay test we do that has changed code from the last. sort of works like a revision versioning system. this digit resets for every minor release
        // example, politics:0.0.1
        // version is stored in the game config
        this.version = "eggine2d:0.0.0";
        this.ticker = new gameTicker_1.default(this);
        this.isClient = isClient;
        this.isServer = !isClient;
        if (isClient) {
            this.network = new clientNetwork_1.default(this);
            this.renderer = new gameRenderer_1.default(this);
            this.collision = new gameCollision_1.default(this);
            this.debug = new debug_1.default(this);
            // little fun message in the console
            let image = new Image();
            image.onload = () => {
                let xScale = 1.25;
                let yScale = 0.5;
                console.log("%c ", "font-size: 1px; padding: " + Math.floor(image.height * yScale / 2) + "px " + Math.floor(image.width * xScale / 2) + "px; background: url('https://bansheerubber.com/egg.png'); background-size: " + (image.width * xScale) + "px " + (image.height * yScale) + "px; color: transparent; background-repeat: no-repeat;");
                console.log(`%cpowered by eggine mk3 (${this.version})`, "font-size: 15pt; font-weight: bold;");
                console.log("%cwith love, bansheerubber", "font-style: italic; text-align: center;");
            };
            image.src = "https://bansheerubber.com/egg.png";
        }
        else {
            this.network = new serverNetwork_1.default(this);
        }
        network_1.Network.setGame(this);
    }
    start() {
        this.ticker.start();
    }
    stop() {
        this.ticker.stop();
    }
}
exports.default = Game;
//# sourceMappingURL=game.js.map