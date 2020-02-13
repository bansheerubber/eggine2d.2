"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const hex_1 = require("./hex");
class MinimapUI extends React.Component {
    constructor(props) {
        super(props);
        this.game = props.game;
        this.state = {
            width: 0,
            height: 0,
            cameraX: 0,
            cameraY: 0,
        };
        this.game.gamemode.minimapUI = this;
    }
    render() {
        console.log(this.state.cameraX, this.state.cameraY);
        let approximateTileX = Math.floor(this.state.cameraX / (hex_1.default.width - hex_1.default.xOffset));
        let approximateTileY = Math.floor(this.state.cameraY / (hex_1.default.height - hex_1.default.outline) - Math.floor(approximateTileX) % 2 / 2);
        return React.createElement("div", null,
            React.createElement("canvas", { id: "minimapCanvas", width: this.state.width, height: this.state.height }),
            React.createElement("div", { style: {
                    position: "relative",
                    top: approximateTileY,
                    left: approximateTileX,
                    width: 2,
                    height: 2,
                    backgroundColor: "red",
                } }));
    }
    generateMinimap() {
        this.setState({
            width: this.game.gamemode.hexMap.size.x,
            height: this.game.gamemode.hexMap.size.y,
        });
        let context = document.getElementById("minimapCanvas").getContext("2d");
        for (let hex of this.game.gamemode.hexMap.getHexes()) {
            context.fillStyle = hex.constructor.minimapColor;
            context.fillRect(hex.position.x, hex.position.y, 1, 1);
        }
    }
}
exports.default = MinimapUI;
//# sourceMappingURL=minimapUI.js.map