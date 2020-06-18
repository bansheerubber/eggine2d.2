import RemoteObject from "../../network/remoteObject";
import Hex, { HexDirection } from "./hex";
import Vector from "../../helpers/vector";
import GrassHex from "./types/grass";
import BinaryFileReader from "../../helpers/binaryFileReader";
import MountainHex from "./types/mountain";
import Game from "../../game/game";
import { Keybind, KeybindModifier } from "../../game/keybinds";
import { networkClass, gameClass, illegal } from "../../network/networkDecorators";
import Sprite from "../../render/sprite";
import { RGBColor } from "../../helpers/color";
import ClientNetwork from "../../network/clientNetwork";

@networkClass()
@gameClass
export default class HexMap extends RemoteObject {
	@illegal public hexes: Map<number, Hex>
	public static hexIdToClass: typeof Hex[] = []
	@illegal public size: Vector
	public mapFile: string = ""

	@illegal private selectedSprite: Sprite
	@illegal private selectedHex_: Hex
	@illegal private hexCount: number = 0



	public reconstructor(game: Game): void {
		super.reconstructor(game)

		this.hexes = new Map()
		this.size = new Vector()
		this.hexCount = 0

		if(this.game.isClient) {
			new Keybind("mouse0", KeybindModifier.NONE, "Select Hex").down((event: MouseEvent) => {
				let hex = this.getHexUnderMouse(event.clientX, event.clientY)
				if(hex == this.selectedHex) { // if the hex is already selected, then unselect it
					this.selectedHex = undefined
				}
				else {
					this.selectedHex = hex
				}
			})

			new Keybind("mouse2", KeybindModifier.NONE, "Draw Unit Move").move((event: MouseEvent) => {
				let hex = this.getHexUnderMouse(event.clientX, event.clientY)
				if(this.selectedHex?.unit && hex) {
					this.selectedHex.unit.movement.select(hex)
				}
			})

			this.selectedSprite = new Sprite(this.game, "./data/sprites/hexes/outlines/selected.png")
			this.selectedSprite.isVisible = false

			if(this.mapFile) {
				this.loadMap(this.mapFile)
			}
		}
	}

	/**
	 * gets the hex underneath the given mouse coordinates
	 * @param mouseX 
	 * @param mouseY 
	 */
	public getHexUnderMouse(mouseX: number, mouseY: number): Hex {
		// detects if the world space is within a hex or not
		function canSelect(hex: Hex, worldSpace: Vector) {
			let position = hex.getSpritePosition()

			let dx = Math.abs(worldSpace.x - position.x) / Hex.width
			let dy = Math.abs(worldSpace.y - position.y) / Hex.width
			let a = 0.25 * Math.sqrt(3.0)
			return (dy <= a) && (a * dx + 0.25 * dy <= 0.5 * a)
		}
		
		// get world position from mouse position
		let worldPosition = this.game.renderer.camera.mouseToWorld(mouseX, mouseY)
		
		// calculate the approximate x and use that to determine if we need to test more than 1 canidate
		let approximateTileX = worldPosition.x / (Hex.width - Hex.xOffset) + 0.5
		let approximateTileY = worldPosition.y / (Hex.height - Hex.outline) - Math.floor(approximateTileX) % 2 / 2 + 0.5

		let hex = this.hexes.get(new Vector(Math.floor(approximateTileX), Math.floor(approximateTileY)).unique())
		if(hex) {
			let xCertainty = approximateTileX - Math.floor(approximateTileX)
			// if we're 0%-25% of the way into the hex, then we can't be certain the above coordinates are correct
			if(xCertainty < 0.25) {
				let adjacentHex: Hex
				let yDistance = approximateTileY - Math.floor(approximateTileY)

				if(yDistance > 0.5) {
					adjacentHex = hex.getAdjacent(HexDirection.SOUTHWEST)
				}
				else {
					adjacentHex = hex.getAdjacent(HexDirection.NORTHWEST)
				}

				// check if the adjacent hex is selectable if it even exists
				if(adjacentHex && canSelect(adjacentHex, worldPosition)) {
					return adjacentHex
				}
				// if it doesn't exist/isn't selectable, then check to see if the original hex we found is selectable
				else if(canSelect(hex, worldPosition)) {
					return hex
				}
				// if it isn't selectable, return undefined
				else {
					return undefined
				}
			}
			// if there's no incertainty, then just return the hex
			else {
				return hex
			}
		}
		// if we didn't find a hex at all, then return nothing
		else {
			return undefined
		}
	}

	/**
	 * sets the selected hex
	 */
	public set selectedHex(hex: Hex) {
		this.selectedHex_?.onDeSelected()
		this.selectedHex_ = hex

		if(hex) {
			hex.onSelected()
			this.selectedSprite.setPosition(hex.getSpritePosition())
			this.selectedSprite.isVisible = true
		}
		else {
			this.selectedSprite.isVisible = false
		}
	}

	/**
	 * @return currently selected hex
	 */
	public get selectedHex(): Hex {
		return this.selectedHex_
	}

	/**
	 * adds a hex to the map
	 * @param hex
	 */
	public addHex(hex: Hex): Hex {
		this.hexes.set(hex.getPosition().unique(), hex)
		hex.map = this
		return hex
	}

	/**
	 * removes the hex from the map
	 * @param hex
	 */
	public removeHex(hex: Hex): Hex {
		this.hexes.delete(hex.getPosition().unique())
		return hex
	}

	/**
	 * registers a hex to a particular id. this id is used to save/load hexes to file
	 * @param id
	 * @param classReference hex class
	 */
	public static registerHexClass(id: number, classReference: typeof Hex): void {
		this.hexIdToClass[id] = classReference
	}

	/**
	 * creates a hex at the specified hex coordinates
	 * @param id hex id
	 * @param x hex coord
	 * @param y hex coord
	 */
	private createHex(id: number, x: number, y: number): Hex {
		let hex = new (HexMap.hexIdToClass[id] as any)(this.game, this.hexCount) as Hex
		hex.map = this
		hex.setPosition(hex.getPosition().set(x, y))
		this.hexCount++
		return hex
	}

	/**
	 * creates an entirely grass map from the specified width and heights
	 * @param width
	 * @param height
	 */
	public createGrassMap(width: number, height: number): void {
		for(let x = 0; x < width; x++) {
			for(let y = 0; y < height; y++) {
				this.createHex(1, x, y)
			}
		}
		this.size.x = width
		this.size.y = height

		this.game.renderer?.camera.position.copy(this.getCenter())
	}

	/**
	 * gets the center of the map
	 * @return world coordinates
	 */
	public getCenter(): Vector {
		let averagePosition = new Vector(0, 0)
		let count = 0
		for(let hex of this.hexes.values()) {
			averagePosition.x += hex.getPosition().x
			averagePosition.y += hex.getPosition().y
			count++
		}
		averagePosition.x /= count
		averagePosition.y /= count
		let hexCenter = Hex.hexPositionToWorldPosition(averagePosition.x, averagePosition.y)
		averagePosition.set(hexCenter[0], hexCenter[1])
		return averagePosition
	}

	/**
	 * loads a map from file
	 * @param resource url or file path
	 */
	public async loadMap(resource: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.mapFile = resource;
			(this.game.network as ClientNetwork).pause = true
			let file = new BinaryFileReader(resource)

			let start = performance.now()

			file.readFile().then((bytes) => {
				let width = file.readInt()
				let height = file.readInt()
				this.size.set(width, height)
				let hexCount = 0
				while(!file.isEOF()) {
					let hexId = file.readByte()
					let x = hexCount % width
					let y = Math.floor(hexCount / width)

					this.createHex(hexId, x, y)
					hexCount++
				}
				console.log(`${hexCount} hexes loaded in ${(performance.now() - start).toFixed(0)}ms`)
				this.game.renderer?.camera.position.copy(this.getCenter());
				(this.game.network as ClientNetwork).pause = false

				resolve()
			})
		})
	}
}