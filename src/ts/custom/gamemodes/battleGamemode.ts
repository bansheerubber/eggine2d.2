import Gamemode from "../../game/gamemode";
import { networkClass, gameClass, illegal } from "../../network/networkDecorators";
import Game from "../../game/game";
import Unit from "../units/unit";
import BattleTeam from "../units/battleTeam";
import MinimapUI from "../hexes/minimapUI";
import HexMap from "../hexes/hexMap";
import sleep from "../../helpers/sleep";
import Client from "../../network/client";
import TestClient from "../testClient";

export enum BattlePhase {
	MOVE,
	ATTACK,
	IDLE,
}

@networkClass("%[BattleGamemode: hexMap]")
@gameClass
export default class BattleGamemode extends Gamemode {
	public hexMap: HexMap
	@illegal public minimapUI: MinimapUI
	@illegal public clientClass: typeof Client = TestClient
	
	@illegal public units: Unit[]
	@illegal public teams: Set<BattleTeam>

	public phase: BattlePhase = BattlePhase.IDLE
	
	
	
	constructor(game: Game, hexMap: HexMap) {
		super(game)
	}

	public reconstructor(game: Game, hexMap: HexMap): void {
		super.reconstructor(game)
		this.hexMap = hexMap

		this.teams = new Set()
		this.units = []
	}

	/**
	 * handles the unit's move phase
	 */
	public async movePhase(): Promise<void> {
		this.phase = BattlePhase.MOVE
		
		// prepare all units for the next move
		for(let unit of this.units.values()) {
			unit.movement.prepare()
		}
		
		this.fixMoves() // fix unit moves if there's collisions, etc

		// sort the units by their move order. also, find out the highest moveTime (the amount of time we wait after a move)
		let maxMoveTime = 0
		this.units.sort((a: Unit, b: Unit) => {
			if(a.movement.moveTime > maxMoveTime && !a.movement.isDone()) {
				maxMoveTime = a.movement.moveTime
			}
			if(b.movement.moveTime > maxMoveTime && !b.movement.isDone()) {
				maxMoveTime = b.movement.moveTime
			}

			return b.movement.moveOrder - a.movement.moveOrder
		})

		// carry out movement
		for(let unit of this.units) {
			if(!unit.movement.isDone()) {
				await unit.movement.move()
			}
		}

		await sleep(maxMoveTime) // wait for the units to finish their animations, which happen all at once if their movement is non-blocking

		// figure out if the units are done moving 
		let isDone = true
		for(let unit of this.units) {
			if(!unit.movement.isDone()) {
				isDone = false
			}
		}

		// if the units aren't done moving yet, then continue the move phase
		if(!isDone) {
			await this.movePhase()
		}
		else {
			// tell the movement objets that the move phase is finished
			for(let unit of this.units) {
				unit.movement.finish()
			}
			
			await this.attackPhase()
		}
	}

	/**
	 * fix all unit's moves by resolving collisions
	 * @return the amount of units we fixed
	 */
	private fixMoves(): number { 
		let fixedCount = 0
		let nextMoveBad = true
		// keep fixing moves until we have no moves left to fix
		do {
			nextMoveBad = false
			for(let unit of this.units.values()) {
				if(unit.movement.isNextMoveBad()) {
					nextMoveBad = true
					unit.movement.fix()
					fixedCount++
				}
			}
		}
		while(nextMoveBad)
		return fixedCount
	}

	/**
	 * have all units do their attacks
	 */
	public async attackPhase(): Promise<void> {
		this.phase = BattlePhase.ATTACK
	}
}