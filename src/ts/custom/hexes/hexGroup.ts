import Hex from "./hex";
import Game from "../../game/game";
import BattleGamemode from "../gamemodes/battleGamemode";
import OverworldGamemode from "../gamemodes/overworldGamemode";
import Vector from "../../helpers/vector";
import SpriteSheet from "../../render/spriteSheet";
import GameObject from "../../game/gameObject";

export default class HexGroup extends GameObject {
	private hexes: Set<Hex> = new Set()
	private outline: SpriteSheet[] = []



	constructor(game: Game, hexes: Iterable<Hex> = []) {
		super(game, {
			canTick: false,
		})
		
		this.game = game
		for(let hex of hexes) {
			this.add(hex)
		}
	}

	public add(hex: Hex): void {
		this.hexes.add(hex)
	}

	public remove(hex: Hex): void {
		this.hexes.delete(hex)
	}

	public includes(hex: Hex): boolean {
		return this.hexes.has(hex)
	}

	public all(): Iterable<Hex> {
		return this.hexes.values()
	}

	public setShading(kind: number, enabled: boolean): void {
		for(let hex of this.all()) {
			hex.setShading(kind, enabled)
		}
	}

	// origin is in hex coordinates
	public addRadius(origin: Vector, radius: number) {
		let map = (this.game.gamemode as BattleGamemode | OverworldGamemode).hexMap
		for(let x = origin.x - radius; x <= origin.x + radius; x++) {
			// i forget how these equations work but they just do so deal with it asshole
			let xDist = Math.abs(x - origin.x)
			let yStart = origin.y - radius + Math.ceil((xDist - (-(origin.x % 2) + 1)) / 2)
			let yEnd = yStart + 2 * radius - xDist

			for(let y = yStart; y <= yEnd; y++) {
				let hex = map.hexes.get(new Vector(x, y).unique())
				if(hex) {
					this.add(hex)
				}
			}
		}
	}

	// returns a bitmask representing how surrounded the hex is by hexes in the same list. 1 is for is surrounded, 0 is for not surrounded. starts from side 0 at the rightmost bit and continues leftwards
	// example bitmask: 0  0  1  1  1  0
	//				   nw sw  s se ne  n
	public getHexSurroundedBitmask(hex: Hex): number {
		let bitmask = 0
		// starting from top because we need to frontload the bits
		for(let i = 5; i >= 0; i--) {
			let foundHex = hex.getAdjacent(i)
			
			// add 1 to the bitmask if we've found a hex in the group
			if(foundHex !== undefined && this.includes(foundHex)) {
				bitmask |= 1 << i
			}
		}
		return bitmask
	}

	// draws an outline around the hex list
	public drawOutline(): void {
		this.clearOutline()

		// loop through all of our hexes
		for(let hex of this.hexes.values()) {
			let bitmask = this.getHexSurroundedBitmask(hex)

			// if the bitmask is full, don't do the outline. if it isn't full, then do the bitmask
			if(bitmask != 0b111111) {
				for(let i = 0; i < 6; i++) {
					// checking adjacent sides bit by bit
					if(!(bitmask & (1 << i))) {
						let sprite = new SpriteSheet(this.game, "./data/sprites/hexes/outlines/outline.json")
						sprite.sheetIndex = i
						sprite.setPosition(hex.getSpritePosition())

						this.outline.push(sprite)
					}
				}
			}
		}
	}

	public clearOutline(): void {
		for(let outline of this.outline) {
			outline.destroy()
		}
		this.outline = []
	}

	public destroy(): void {
		super.destroy()
		this.clearOutline()
		this.hexes = undefined
	}
}