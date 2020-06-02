import Game from "../../../game/game"
import Unit from "../unit"
import RemoteObject from "../../../network/remoteObject"
import { networkClass } from "../../../network/networkDecorators"
import Hex from "../../hexes/hex"

/*
defines how our unit can move through the map

definition:
next move - the hex we will move to as soon as "move()" is called
*/

@networkClass("%[Movement: unit]")
export default abstract class Movement extends RemoteObject {
	protected unit: Unit
	public readonly moveOrder: number = 0 // the higher the number, the sooner it moves
	public readonly moveTime: number = 0 // the amount of time (in seconds) it takes for a unit to move from one tile to the next


	
	constructor(game: Game, unit: Unit) {
		super(game)
	}

	public reconstructor(game: Game, unit: Unit): void {
		super.reconstructor(game)
		this.unit = unit
	}

	// determines if the next move is illegal or not
	public isNextMoveBad(): boolean  {
		let nextHex = this.getNextHex()
		// if the arriving units length is above one, then we are guarenteed a collision. if the next hex has a unit on it that isn't moving, then we are guarenteed a collision
		if(nextHex) {
			if(nextHex.arrivingUnits.length > 1 || (nextHex.unit && nextHex.unit.movement.getNextHex() === undefined)) {
				return true
			}
			else {
				return false
			}
		}
		else {
			return false
		}
	}

	public abstract getNextHex(): Hex // the hex we're moving to the next turn
	public abstract fix(): void // fixes the move by resolving collisions
	public abstract async move(): Promise<void> // moves the unit to the tile
	public abstract prepare(): void // prepares the move by adding the unit to the destination tile's arrival array
	public abstract finish(): void // finishes the move phase
	public abstract hover(hex: Hex): void // called when a unit is selected and we hover over a tile
	public abstract select(hex: Hex): void // called when a unit is selected and the user clicks their mouse (to add a tile to move to)
	public abstract isDone(): boolean // whether or not the unit is done moving in this move phase
	public abstract show(): void // show the places we can move to
	public abstract hide(): void // hide the places we can move to
}