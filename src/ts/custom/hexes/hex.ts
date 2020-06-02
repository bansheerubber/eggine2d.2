import RemoteObject from "../../network/remoteObject";
import HexMap from "./hexMap";
import Vector from "../../helpers/vector";
import Sprite from "../../render/sprite";
import Game from "../../game/game";
import GameObjectOptions from "../../game/gameObjectOptions";
import Unit from "../units/unit";
import { gameClass, networkClass, illegal } from "../../network/networkDecorators";
import ImageResource from "../../render/imageResource";

export enum HexDirection {
	NORTH = 0,
	NORTHEAST = 1,
	SOUTHEAST = 2,
	SOUTH = 3,
	SOUTHWEST = 4,
	NORTHWEST = 5,
}

@networkClass()
export default abstract class Hex extends RemoteObject {
	protected static resource: string = ""
	protected position: Vector = new Vector()
	@illegal protected sprite: Sprite
	@illegal protected shadingSprites: Sprite[] = []
	protected unit_: Unit

	@illegal public arrivingUnits: Unit[] = []
	public map: HexMap

	public static width: number = 43
	public static height: number = 36
	public static xOffset: number = 10
	public static outline: number = 2
	public static minimapColor: string = "rgb(0, 0, 0)"

	public static shadingResources: string[] = ["./data/sprites/hexes/shading/shaded1.png", "./data/sprites/hexes/shading/shaded2.png", "./data/sprites/hexes/shading/shaded3.png", "./data/sprites/hexes/shading/shaded4.png", "./data/sprites/hexes/shading/shaded5.png"]



	constructor(game: Game, customRemoteID: number, canTick: boolean) {
		super(game, {
			canTick,
			customRemoteID,
			customRemoteGroupID: 1,
		})
	}

	public reconstructor(game: Game, customRemoteID: number, canTick: boolean): void {
		super.reconstructor(game, {
			canTick,
			customRemoteID,
			customRemoteGroupID: 1,
		} as GameObjectOptions)

		if(this.game.isClient) {
			this.sprite = new Sprite(game, ImageResource.getSpriteTexture((this.constructor as typeof Hex).resource), this.game.renderer.hex)
		}
	}

	// sets the shading of the sprite
	public setShading(kind: number, enabled: boolean): void {
		if(this.shadingSprites[kind] === undefined && enabled) {
			this.shadingSprites[kind] = new Sprite(this.game, Hex.shadingResources[kind])
			this.shadingSprites[kind].setPosition(this.getSpritePosition())
		}
		else if(this.shadingSprites[kind] !== undefined && !enabled) {
			this.shadingSprites[kind].destroy()
			delete this.shadingSprites[kind]
		}

		// unhide/hide all sprites underneath this kind of shading
		for(let i = kind - 1; i >= 0; i--) {
			if(this.shadingSprites[i]) {
				this.shadingSprites[i].isVisible = !enabled
			}
		}
	}

	public setPosition(position: Vector): void {
		// reset the position of this hex in our map
		if(this.map) {
			this.map.addHex(this)
		}

		this.position.copy(position)

		// set the position of the hex's sprite
		let [x, y] = Hex.hexPositionToWorldPosition(this.position.x, this.position.y)
		this.sprite?.setPosition(this.sprite.getPosition().set(x, y))
	}

	public getPosition(): Vector {
		return this.position
	}

	public getSpritePosition(): Vector {
		let vector = new Vector(0, 0)
		let result = Hex.hexPositionToWorldPosition(this.position.x, this.position.y)
		return vector.set(result[0], result[1])
	}

	public onSelected(): void {
		this.unit?.onSelected()
	}

	public onDeSelected(): void {
		this.unit?.onDeSelected()
	}

	// returns the hex on the specified side of the hex
	public getAdjacent(index: number): Hex {
		let x = this.position.x
		let y = this.position.y
		let mod = this.position.x % 2 // we have to use mod for y value because the hex y position doesn't always change correctly
		let inverseMod = -(mod) + 1 // if mod is 0, then inverseMod will be 1. if mod is 1, then inverseMod will be 0
		
		switch(index) {
			// north side
			case 0: {
				if(x < 0 || y - 1 < 0) {
					return undefined
				}
				else {
					return this.map.hexes.get(Vector.getTempVector(0).set(x, y - 1).unique())
				}
			}
			
			// northeast side
			case 1: {
				if(x + 1 < 0 || y - inverseMod < 0) {
					return undefined
				}
				else {
					return this.map.hexes.get(Vector.getTempVector(0).set(x + 1, y - inverseMod).unique())
				}
			}
			
			// southeast side
			case 2: {
				if(x + 1 < 0 || y + mod < 0) {
					return undefined
				}
				else {
					return this.map.hexes.get(Vector.getTempVector(0).set(x + 1, y + mod).unique())
				}
			}
			
			// south side
			case 3: {
				if(x < 0 || y + 1 < 0) {
					return undefined
				}
				else {
					return this.map.hexes.get(Vector.getTempVector(0).set(x, y + 1).unique())	
				}
			}
			
			// southwest side:
			case 4: {
				if(x - 1 < 0 || y + mod < 0) {
					return undefined
				}
				else {
					return this.map.hexes.get(Vector.getTempVector(0).set(x - 1, y + mod).unique())
				}
			}
			
			// northwest side:
			case 5: {
				if(x - 1 < 0 || y - inverseMod < 0) {
					return undefined
				}
				else {
					return this.map.hexes.get(Vector.getTempVector(0).set(x - 1, y - inverseMod).unique())
				}
			}
		}
	}

	public isAdjacent(hex: Hex): boolean {
		for(let i = 0; i < 6; i++) {
			if(hex == this.getAdjacent(i)) {
				return true
			}
		}
		return false
	}

	public set unit(unit: Unit) {
		if(this.unit_ !== undefined) [
			this.unit_.hex = undefined // reset the hex of the unit that used to be on this tile
		]
		
		this.unit_ = unit
		unit.hex = this
	}
	
	public get unit(): Unit {
		return this.unit_
	}

	public static hexPositionToWorldPosition(x: number, y: number): number[] {
		let ox = x * Hex.width - Hex.xOffset * x
		let oy = y * Hex.height - Hex.outline * y + x % 2 * Hex.height / 2 - x % 2
		return [ox, oy]
	}
}