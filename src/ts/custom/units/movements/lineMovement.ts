import Movement from "./movement";
import { networkClass, gameClass, illegal } from "../../../network/networkDecorators";
import Unit from "../unit";
import Game from "../../../game/game";
import Hex from "../../hexes/hex";
import VectorInterpolation from "../../../helpers/vectorInterpolation";
import Vector from "../../../helpers/vector";
import LineGroup from "../../../render/graphics/lineGroup";
import { RGBColor } from "../../../helpers/color";
import HexGroup from "../../hexes/hexGroup";

@networkClass("%[LineMovement: unit]", "%[LineMovement: range]")
@gameClass
export default class LineMovement extends Movement {
	protected range: number
	protected hexes: Hex[] = [] // includes the starting tile (the tile the unit is currently on), and the end tile
	protected currentIndex: number = 1
	public readonly moveTime: number = 0.5 // it takes half a second for a unit to move from one tile to the next
	@illegal private collisionHex: Hex = undefined
	@illegal private lineGroup: LineGroup
	@illegal private hexGroup: HexGroup



	constructor(game: Game, unit: Unit, range: number) {
		super(game, unit)
	}

	public reconstructor(game: Game, unit: Unit, range?: number): void {
		super.reconstructor(game, unit)

		this.lineGroup = new LineGroup(this.game)
		this.range = range
		this.lineGroup.width = 5
		this.lineGroup.color = new RGBColor(0, 0, 1, 1)
	}

	public getNextHex(): Hex {
		return this.hexes[this.currentIndex]
	}

	// for now, just clear our movement list
	public fix(): void {
		this.collisionHex = this.hexes[this.currentIndex]
		
		this.hexes = []
		this.currentIndex = 1
	}

	public hover(hex: Hex): void {

	}

	public select(hex: Hex): void {
		if(this.hexes.length == 0) {
			this.hexes.push(this.unit.hex) // make sure the starting hex is at the beginning of the list automatically
			this.lineGroup.add(this.unit.hex.getSpritePosition())
		}

		// only add a hex if its adjacent to our last one
		if(this.hexes[this.hexes.length - 1].isAdjacent(hex) && this.hexes.length < this.range + 1) {
			this.hexes.push(hex)
			this.lineGroup.add(hex.getSpritePosition())
		}
	}

	public async move(): Promise<void> {
		if(this.getNextHex() !== undefined) {
			let startPosition = this.unit.getSpritePosition().clone()
			this.getNextHex().unit = this.unit
			let endPosition = this.unit.getSpritePosition().clone()

			this.unit.setSpritePosition(startPosition)
			new VectorInterpolation(this.game, startPosition, endPosition, this.moveTime, (vector: Vector) => {
				this.unit.setSpritePosition(vector)
			}, (vector: Vector) => {
				this.unit.setSpritePosition(vector)
			})

			this.currentIndex++
		}
		else if(this.collisionHex !== undefined) { // do a little bonk animation thing on collision
			let startPosition = this.unit.getSpritePosition().clone()
			let endPosition = this.collisionHex.getSpritePosition().clone()

			this.unit.setSpritePosition(startPosition)
			new VectorInterpolation(this.game, startPosition, endPosition, this.moveTime, (vector: Vector) => {
				this.unit.setSpritePosition(vector)
			}, (vector: Vector) => {
				this.unit.setSpritePosition(startPosition)
			})
			
			this.collisionHex = undefined
		}
	}

	public prepare(): void {
		if(this.getNextHex() !== undefined) {
			this.getNextHex().arrivingUnits.push(this.unit)
		}
		this.lineGroup.clear()
		this.hide()
	}

	public finish(): void {
		this.hexes = [this.unit.hex]
		this.lineGroup.clear()
		this.hide()
		this.currentIndex = 1
	}

	public isDone(): boolean {
		return (this.getNextHex() == undefined || this.hexes.length == 1) && this.collisionHex === undefined
	}

	public show(): void {
		if(this.hexGroup === undefined) {
			this.hexGroup = new HexGroup(this.game)
			this.hexGroup.addRadius(this.unit.hex.getPosition(), this.range)
			this.hexGroup.drawOutline()
		}
	}

	public hide(): void {
		this.hexGroup?.destroy()
		this.hexGroup = undefined
	}

	public destory(): void {
		super.destroy()
		this.lineGroup?.destroy()
		this.hexGroup?.destroy()
	}
}