import Vector from "../helpers/vector";
import SpriteChunk from "./spriteChunk";
import Sprite from "./sprite";

export default class SpriteChunkSet {
	private spriteChunks: SpriteChunk[][] = []

	public addToSpriteChunk(sprite: Sprite): SpriteChunk {
		let testPosition = sprite.getPosition().mul_(1 / SpriteChunk.size)
		testPosition.x = Math.floor(testPosition.x)
		testPosition.y = Math.floor(testPosition.y)
		
		if(this.spriteChunks[testPosition.x] == undefined) {
			this.spriteChunks[testPosition.x] = []
		}

		let chunk = this.spriteChunks[testPosition.x][testPosition.y]
		if(chunk == undefined) {
			this.spriteChunks[testPosition.x][testPosition.y] = chunk = new SpriteChunk(sprite.game, testPosition)
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