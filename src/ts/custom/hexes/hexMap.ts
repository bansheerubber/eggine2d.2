import RemoteObject from "../../network/remoteObject";
import Hex from "./hex";
import Vector from "../../helpers/vector";
import GrassHex from "./types/grass";
import BinaryFileReader from "../../helpers/binaryFileReader";
import MountainHex from "./types/mountain";

export default class HexMap extends RemoteObject {
	public hexes: Map<number, Hex> = new Map()
	public static hexIdToClass: typeof Hex[] = []
	public size: Vector = new Vector()



	// adds a hex to our map
	public addHex(hex: Hex): Hex {
		this.hexes.set(hex.position.unique(), hex)
		return hex
	}

	// removes a hex from our map
	public removeHex(hex: Hex): Hex {
		this.hexes.delete(hex.position.unique())
		return hex
	}

	public createTestMap(): void {
		let sizeX = 100, sizeY = 100
		for(let x = 0; x < sizeX; x++) {
			for(let y = 0; y < sizeY; y++) {
				let hex = new GrassHex(this.game)
				hex.setPosition(hex.position.set(x, y))
			}
		}
		this.size.set(sizeX, sizeY)
	}

	public static registerHexClass(id: number, classReference: typeof Hex): void {
		this.hexIdToClass[id] = classReference
	}

	private createHex(id: number, x: number, y: number): Hex {
		let hex = new HexMap.hexIdToClass[id](this.game)
		hex.setPosition(hex.position.set(x, y))
		this.addHex(hex)
		return hex
	}

	public async loadMap(resource: string): Promise<void> {
		return new Promise((resolve, reject) => {
			let file = new BinaryFileReader(resource)
			file.readFile().then((bytes) => {
				let width = file.readInt()
				let height = file.readInt()
				this.size.set(width, height)
				let index = 0
				let hexCount = 0
				while(!file.isEOF()) {
					let hexId = file.readByte()
					let x = index % width
					let y = Math.floor(index / width)

					this.createHex(hexId, x, y)
					hexCount++
					index++
				}
				console.log(`${hexCount} hexes loaded`)
				resolve()
			})
		})
	}
}