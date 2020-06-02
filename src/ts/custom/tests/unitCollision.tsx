import Game from "../../game/game";
import BattleGamemode from "../gamemodes/battleGamemode";
import BattleTeam from "../units/battleTeam";
import HexMap from "../hexes/hexMap";
import JeepUnit from "../units/jeep";
import Vector from "../../helpers/vector";
import sleep from "../../helpers/sleep";
import * as React from "react"
import * as ReactDOM from "react-dom"
import MinimapUI from "../hexes/minimapUI";
import assert from "./assert";

export default async function unitCollision(game: Game) {
	let gamemode = new BattleGamemode(game, new HexMap(game))
	game.gamemode = gamemode

	ReactDOM.render(<MinimapUI game={game}></MinimapUI>, document.getElementById("minimapContainer"))

	gamemode.hexMap.createGrassMap(31, 10)
	gamemode.minimapUI.generateMinimap()

	let team = new BattleTeam(game)

	// test 1: two units moving in single file
	{
		let unit1 = new JeepUnit(game, team)
		let unit2 = new JeepUnit(game, team)

		let hex1 = gamemode.hexMap.hexes.get(new Vector(3, 3).unique())
		let hex2 = gamemode.hexMap.hexes.get(new Vector(3, 4).unique())

		hex1.unit = unit1
		hex2.unit = unit2

		unit1.movement.select(gamemode.hexMap.hexes.get(new Vector(3, 4).unique()))
		unit2.movement.select(gamemode.hexMap.hexes.get(new Vector(3, 5).unique()))

		await sleep(1)

		await gamemode.movePhase()

		try {
			assert(
				unit1.hex.getPosition().equals(new Vector(3, 4))
				&& unit2.hex.getPosition().equals(new Vector(3, 5))
				, "Unit Movement Test #1: Failed"
			)
			console.log("Unit Movement Test #1: Passed")
		}
		catch(error) {
			console.error(error.message)
		}
	}

	// test 2: two units moving onto the same tile, with same health/attack/whatever is used to determine unit collision priority
	{
		let unit1 = new JeepUnit(game, team)
		let unit2 = new JeepUnit(game, team)

		let hex1 = gamemode.hexMap.hexes.get(new Vector(6, 3).unique())
		let hex2 = gamemode.hexMap.hexes.get(new Vector(6, 5).unique())

		hex1.unit = unit1
		hex2.unit = unit2

		unit1.movement.select(gamemode.hexMap.hexes.get(new Vector(6, 4).unique()))
		unit2.movement.select(gamemode.hexMap.hexes.get(new Vector(6, 4).unique()))

		await sleep(1)

		await gamemode.movePhase()

		try {
			assert(
				unit1.hex.getPosition().equals(new Vector(6, 3))
				&& unit2.hex.getPosition().equals(new Vector(6, 5))
				, "Unit Movement Test #2: Failed"
			)
			console.log("Unit Movement Test #2: Passed")
		}
		catch(error) {
			console.error(error.message)
		}
	}

	// test 3: combination of tests 1 and 2
	{
		let unit1 = new JeepUnit(game, team)
		let unit2 = new JeepUnit(game, team)
		let unit3 = new JeepUnit(game, team)

		let hex1 = gamemode.hexMap.hexes.get(new Vector(10, 3).unique())
		let hex2 = gamemode.hexMap.hexes.get(new Vector(10, 4).unique())
		let hex3 = gamemode.hexMap.hexes.get(new Vector(9, 4).unique())

		hex1.unit = unit1
		hex2.unit = unit2
		hex3.unit = unit3

		unit1.movement.select(gamemode.hexMap.hexes.get(new Vector(10, 4).unique()))
		unit2.movement.select(gamemode.hexMap.hexes.get(new Vector(10, 5).unique()))
		unit3.movement.select(gamemode.hexMap.hexes.get(new Vector(10, 5).unique()))

		await sleep(1)

		await gamemode.movePhase()

		try {
			assert(
				unit1.hex.getPosition().equals(new Vector(10, 3))
				&& unit2.hex.getPosition().equals(new Vector(10, 4))
				&& unit3.hex.getPosition().equals(new Vector(9, 4))
				, "Unit Movement Test #3: Failed"
			)
			console.log("Unit Movement Test #3: Passed")
		}
		catch(error) {
			console.error(error.message)
		}
	}

	// test 4: moving unit going onto a stationary one
	{
		let unit1 = new JeepUnit(game, team)
		let unit2 = new JeepUnit(game, team)

		let hex1 = gamemode.hexMap.hexes.get(new Vector(13, 3).unique())
		let hex2 = gamemode.hexMap.hexes.get(new Vector(13, 4).unique())

		hex1.unit = unit1
		hex2.unit = unit2

		unit1.movement.select(gamemode.hexMap.hexes.get(new Vector(13, 4).unique()))

		await sleep(1)

		await gamemode.movePhase()

		try {
			assert(
				unit1.hex.getPosition().equals(new Vector(13, 3))
				&& unit2.hex.getPosition().equals(new Vector(13, 4))
				, "Unit Movement Test #4: Failed"
			)
			console.log("Unit Movement Test #4: Passed")
		}
		catch(error) {
			console.error(error.message)
		}
	}
}