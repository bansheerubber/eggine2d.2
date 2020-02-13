import Vector from "../helpers/vector";
import SpriteChunk from "./spriteChunk";
import Sprite from "./sprite";
import * as PIXI from "pixi.js";

export default class SpriteChunkSet {
	private parentContainer: PIXI.Container
	private spriteChunks: SpriteChunk[][] = []
	private cachable: boolean

	constructor(parentContainer: PIXI.Container, cachable: boolean = false) {
		this.parentContainer = parentContainer
		this.cachable = cachable
	}

	public addToSpriteChunk(sprite: Sprite): SpriteChunk {
		let testPosition = sprite.getPosition().mul_(1 / SpriteChunk.size)
		testPosition.x = Math.floor(testPosition.x)
		testPosition.y = Math.floor(testPosition.y)
		
		if(this.spriteChunks[testPosition.x] == undefined) {
			this.spriteChunks[testPosition.x] = []
		}

		let chunk = this.spriteChunks[testPosition.x][testPosition.y]
		if(chunk == undefined) {
			this.spriteChunks[testPosition.x][testPosition.y] = chunk = new SpriteChunk(sprite.game, testPosition, this.parentContainer, this.cachable)
		}

		if(chunk != sprite.chunk) {
			chunk.add(sprite)
		}

		return chunk
	}

	public getSpriteChunk(chunkPosition: Vector): SpriteChunk {
		if(this.spriteChunks[chunkPosition.x] == undefined) {
			return undefined
		}
		else {
			return this.spriteChunks[chunkPosition.x][chunkPosition.y]
		}
	}

	public getCount(): number {
		let count = 0
		for(let index in this.spriteChunks) {
			if(index != "length") {
				count += this.spriteChunks[index].length
			}
		}
		return count
	}
}