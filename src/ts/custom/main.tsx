import Game from "../game/game";
import ControllableCamera from "./controllableCamera";
import ImageResource from "../render/imageResource";
import GrassHex from "./hexes/types/grass";
import HexMap from "./hexes/hexMap";
import WaterHex from "./hexes/types/water";
import MountainHex from "./hexes/types/mountain";
import OverworldGamemode from "./gamemodes/overworldGamemode";
import * as React from "react"
import * as ReactDOM from "react-dom"
import MinimapUI from "./hexes/minimapUI";
import Vector from "../helpers/vector";
import BattleTeam from "./units/battleTeam";
import BattleGamemode from "./gamemodes/battleGamemode";
import JeepUnit from "./units/jeep";
import Random from "../helpers/random";
import Range from "../helpers/range";
import unitCollision from "./tests/unitCollision";
import Line from "../render/graphics/line";
import { RGBColor } from "../helpers/color";
import LineGroup from "../render/graphics/lineGroup";
import HexGroup from "./hexes/hexGroup";

import * as fs from "fs"
import RemoteGroup from "../network/remoteGroup";
import ClientNetwork from "../network/clientNetwork";
import { ServerNetworkHost } from "../network/serverNetwork";
import SpriteChunk from "../render/spriteChunk";
import Sprite from "../render/sprite";
import MainMenuUI from "./ui/mainMenu";

export default async function(game: Game) {
	HexMap.registerHexClass(0, WaterHex)
	HexMap.registerHexClass(1, GrassHex)
	HexMap.registerHexClass(2, MountainHex)

	new RemoteGroup(game, 1, false) // create the remote group for all hexes
	
	if(game.isClient) {
		// ImageResource.queueImage("./data/sprites/units/antiair.json")
		ImageResource.queueImage("./data/sprites/units/jeep.json")
		ImageResource.queueImage("./data/sprites/hexes/hex.png")
		ImageResource.queueImage("./data/sprites/hexes/mountain.png")
		ImageResource.queueImage("./data/sprites/hexes/water.png")
		ImageResource.queueImage("./data/sprites/hexes/outlines/outline.json")
		ImageResource.queueImage("./data/sprites/hexes/outlines/selected.png")
		ImageResource.queueImage("./data/sprites/hexes/shading/shaded1.png")
		ImageResource.queueImage("./data/sprites/hexes/shading/shaded2.png")
		ImageResource.queueImage("./data/sprites/hexes/shading/shaded3.png")
		ImageResource.queueImage("./data/sprites/hexes/shading/shaded4.png")
		ImageResource.queueImage("./data/sprites/hexes/shading/shaded5.png")
		ImageResource.loadImages().then(() => {
			// unitCollision(game)

			let gamemode = new BattleGamemode(game, new HexMap(game))
			game.gamemode = gamemode

			ReactDOM.render(<MinimapUI game={game}></MinimapUI>, document.getElementById("minimapContainer"))

			gamemode.hexMap.createGrassMap(31, 10)
			// gamemode.hexMap.loadMap("./data/map.egg")
			gamemode.minimapUI.generateMinimap()

			let team = new BattleTeam(game)
			let unit = new JeepUnit(game, team)
			gamemode.hexMap.hexes.get(new Vector(10, 5).unique()).unit = unit

			unit.attack.setArc(4, 1)
			unit.attack.rotate(0)

			// ReactDOM.render(<MainMenuUI game={game}></MainMenuUI>, document.getElementById("mainMenu"));

			// (game.network as ClientNetwork).client.addOption("ws://localhost:" + ServerNetworkHost.port, "test server");
			// (game.network as ClientNetwork).client.connectByName("test server")
		})

		game.renderer.camera = new ControllableCamera(game);
		game.renderer.camera.zoom = 1
	}
	else {
		let gamemode = new BattleGamemode(game, new HexMap(game))
		game.gamemode = gamemode
		let team = new BattleTeam(game)

		gamemode.hexMap.loadMap("./data/map.egg").then(() => {
			let unit = new JeepUnit(game, team)
			gamemode.hexMap.hexes.get(new Vector(2, 2).unique()).unit = unit
		})
	}
}