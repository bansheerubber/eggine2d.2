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

	/**
	 * the hex we're moving to the next turn
	 */
	public abstract getNextHex(): Hex

	/**
	 * fixes our move by resolving collisions with other units
	 */
	public abstract fix(): void

	/**
	 * mvoes the unit to its desierd tile
	 */
	public abstract async move(): Promise<void>

	/**
	 * prepares the move by adding the unit to the destination tile's arrival array
	 */
	public abstract prepare(): void

	/**
	 * called when we are finished moving
	 */
	public abstract finish(): void

	/**
	 * called when a unit is selected and we hover over a tile
	 * @param hex the tile the user hovered over
	 */
	public abstract hover(hex: Hex): void

	/**
	 * called when the unit is selected and the user adds a tile to thier move list
	 * @param hex the tile the user selected
	 */
	public abstract select(hex: Hex): void

	/**
	 * @return whether or not the unit is done moving in this move phase
	 */
	public abstract isDone(): boolean

	/**
	 * show the places we can move to
	 */
	public abstract show(): void

	/**
	 * hide the places we can move to
	 */
	public abstract hide(): void // hide the places we can move to
}