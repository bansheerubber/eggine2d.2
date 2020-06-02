import Attack from "./attack";
import Game from "../../../game/game";
import Unit from "../unit";
import HexGroup from "../../hexes/hexGroup";
import { networkClass, gameClass } from "../../../network/networkDecorators";

interface Arc {
	hexes: number
	radius: number
}

/*
allows a unit to perform an attack on any adjacent tiles in an arc, based on a HexGroup's covered area
*/
@networkClass("%[ArcAttack: unit]")
@gameClass
export default class ArcAttack extends Attack {
	private arcHexes: number = 0
	private arcRadius: number = 0


	
	constructor(game: Game, unit: Unit) {
		super(game, unit)
	}

	public reconstructor(game: Game, unit: Unit): void {
		super.reconstructor(game, unit)

		this.hexes = new HexGroup(this.game)
	}

	// tiles is the amount of tiles our arc covers, radius is how far it reaches outwards
	public setArc(hexes: number, radius: number): void {
		this.arcHexes = hexes
		this.arcRadius = radius
	}

	// rotate the arc to the orientation we want
	public rotate(orientation: number): void {
		let start = Math.PI / 2 // 90 deg
		if(this.arcHexes % 2 == 0) { // if we have an even number of arcs, we have to do something special for our start angle
			start = Math.PI / 3 // 60 deg
		}
		let change = this.arcHexes * Math.PI / 6 // the amount we add from side-to-side to our angle boundary

		let origin = this.unit.hex.getSpritePosition().clone()
		this.hexes.addRadius(this.unit.hex.getPosition(), this.arcRadius)
		for(let hex of this.hexes.all()) {
			// we're going to cheat and just use sprite positions to figure out the included hexes
			let offset = origin.sub(hex.getSpritePosition())
			let angle = Math.atan2(offset.y, offset.x)
			if(!(start - change <= angle && angle <= start + change)) { // if we're not inside the arc, then remove the hex
				this.hexes.remove(hex)
				console.log(start - change, angle, start + change)
			}
			else {
				console.log(angle)
			}

			origin.copy(this.unit.hex.getSpritePosition())
		}
		this.hexes.remove(this.unit.hex)

		this.hexes.setShading(2, true)
	}

	// whether or not we can perform an attack on a unit or not
	public canAttack(): boolean {
		if(this.hasAttacked) {
			return false
		}
		
		for(let hex of this.hexes.all()) {
			if(this.unit.team.isEnemy(hex.unit)) {
				return true
			}
		}
		return false
	}

	// attack the unit we've found
	public async attack(): Promise<boolean> {
		for(let hex of this.hexes.all()) {
			if(this.unit.team.isEnemy(hex.unit)) {

			}
		}
		this.hasAttacked = true
		return true
	}

	public async reload(): Promise<void> {
		this.hasAttacked = false
	}
}