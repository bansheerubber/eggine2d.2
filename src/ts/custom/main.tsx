import Game from "../game/game";
import ControllableCamera from "./controllableCamera";
import ImageResource from "../render/imageResource";
import GrassHex from "./hexes/types/grass";
import HexMap from "./hexes/hexMap";
import WaterHex from "./hexes/types/water";
import MountainHex from "./hexes/types/mountain";
import OverworldGamemode from "./hexes/overworldGamemode";
import * as React from "react"
import * as ReactDOM from "react-dom"
import MinimapUI from "./hexes/minimapUI";

export default async function(game: Game) {
	HexMap.registerHexClass(0, WaterHex)
	HexMap.registerHexClass(1, GrassHex)
	HexMap.registerHexClass(2, MountainHex)

	game.gamemode = new OverworldGamemode(game, new HexMap(game))
	
	if(game.isClient) {
		ReactDOM.render(<MinimapUI game={game}></MinimapUI>, document.getElementById("minimapContainer"))
		
		ImageResource.queueImage("./data/sprites/units/antiair.json")
		ImageResource.queueImage("./data/sprites/hexes/hex.png")
		ImageResource.queueImage("./data/sprites/hexes/mountain.png")
		ImageResource.queueImage("./data/sprites/hexes/water.png")
		ImageResource.loadImages().then(() => {
			(game.gamemode as OverworldGamemode).hexMap.loadMap("./data/map.egg").then(() => {
				(game.gamemode as OverworldGamemode).minimapUI.generateMinimap()
			})
		})

		game.renderer.camera = new ControllableCamera(game)
		game.renderer.camera.zoom = 1
	}
}