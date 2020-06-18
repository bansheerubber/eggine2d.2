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

	/**
	 * add a hex to our set
	 * @param hex
	 */
	public add(hex: Hex): void {
		this.hexes.add(hex)
	}

	/**
	 * remove a hex from our set
	 * @param hex
	 */
	public remove(hex: Hex): void {
		this.hexes.delete(hex)
	}

	/**
	 * whether or not the specified hex is included in our set
	 * @param hex
	 */
	public includes(hex: Hex): boolean {
		return this.hexes.has(hex)
	}

	/**
	 * @return an iterable of all hexes in our set
	 */
	public all(): Iterable<Hex> {
		return this.hexes.values()
	}

	/**
	 * set the shading of all of our hexes
	 * @param kind the type of shading
	 * @param enabled whether or not the type of shading is visible
	 */
	public setShading(kind: number, enabled: boolean): void {
		for(let hex of this.all()) {
			hex.setShading(kind, enabled)
		}
	}

	/**
	 * adds a radius of hexes to our set
	 * @param origin center of the radius in hex coords
	 */
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

	/**
	 * returns a bitmask representing how surrounded the hex is by hexes in the same HexGroup. starts from side 0 at the right and continues leftwards
	 * <pre>
	 * example bitmask: 0(nw) 0(sw) 1(s) 1(se) 1(ne) 0(n)
	 * </pre>
	 * @param hex 
	 */
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

	/**
	 * draws an outline around the hexes contained in our set
	 */
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

	/**
	 * clears the outline if there is one
	 */
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