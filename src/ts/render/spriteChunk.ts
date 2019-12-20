import Game from "../game/game";
import GameObject from "../game/gameObject";
import Sprite from "./sprite";
import Vector from "../helpers/vector";
import Range from "../helpers/range";
import { RGBColor, HSVColor } from "../helpers/color";
import * as PIXI from "pixi.js"

export default class SpriteChunk extends GameObject {
	public position: Vector
	public chunkPosition: Vector
	public sprites: Set<Sprite> = new Set<Sprite>()
	public isVisible: boolean = true

	private sortedSpritesX: Sprite[] = [] // sorted by distance of sprite's bottom corner to the screen position of the chunk, highest is last
	private sortedSpritesY: Sprite[] = [] // sorted by distance of sprite's bottom corner to the screen position of the chunk, highest is last
	private minBoundary: Vector
	private maxBoundary: Vector
	private graphics: PIXI.Graphics
	private color: RGBColor
	
	public static size: number = 3000 // how many pixels wide/tall the chunk is
	private static debug: boolean = false



	constructor(game: Game, chunkPosition: Vector) {
		super(game)
		this.chunkPosition = chunkPosition
		this.position = this.chunkPosition.mul_(SpriteChunk.size)
		this.maxBoundary = this.position.clone()

		if(SpriteChunk.debug) {
			this.graphics = new PIXI.Graphics()
			this.color = (new HSVColor(Range.getRandomDec(0, 1), 1, 1)).toRGB()
			this.game.renderer.dynamic.addChild(this.graphics)
		}
	}

	public tick(deltaTime: number): void {
		super.tick(deltaTime)
		
		let isOnScreen = this.game.renderer.camera.showsBox(this.minBoundary, this.maxBoundary.x - this.minBoundary.x, this.maxBoundary.y - this.minBoundary.y)
		if(isOnScreen && !this.isVisible) {
			this.isVisible = true

			for(let sprite of this.sprites.values()) {
				sprite.isVisible = true
			}
		}
		else if(!isOnScreen && this.isVisible) {
			this.isVisible = false

			for(let sprite of this.sprites.values()) {
				sprite.isVisible = false
			}
		}

		if(this.graphics) { 
			this.graphics.clear()

			this.graphics.lineStyle(1 * 1 / this.game.renderer.camera.zoom, this.color.toHex())
			this.graphics.beginFill(0x000000, 0)
			this.graphics.drawRect(this.minBoundary.x, this.minBoundary.y, this.maxBoundary.x - this.minBoundary.x, this.maxBoundary.y - this.minBoundary.y)
			this.graphics.endFill()
		}
	}

	public add(sprite: Sprite): void {
		this.sprites.add(sprite)

		if(this.sortedSpritesX.length == 0) {
			this.sortedSpritesX.push(sprite)
			this.sortedSpritesY.push(sprite)
		}
		else {
			let position = sprite.getPosition()
			
			// uses some ifsajdsfhdsajflkdsafdsafoij to add sprites to a sorted list
			let addToSortedListX = (start: number, end: number): void => {
				let testIndex = Math.floor((start + end) / 2)
				let testPosition = this.sortedSpritesX[testIndex].getPosition()
				let newStart, newEnd
				if(position.x > testPosition.x) {
					newStart = testIndex + 1
					newEnd = end
				}
				else if(position.x < testPosition.x) {
					newStart = start
					newEnd = testIndex
				}
				
				if(position.x == testPosition.x) { // special case if they are equal to eachother
					this.sortedSpritesX.splice(testIndex, 0, sprite)
				}
				else {
					// we have found the position to insert stuff at
					if(newStart == newEnd) {
						this.sortedSpritesX.splice(newEnd, 0, sprite)
					}
					else {
						addToSortedListX(newStart, newEnd)
					}
				}
			}

			// uses some ifsajdsfhdsajflkdsafdsafoij to add sprites to a sorted list
			let addToSortedListY = (start: number, end: number): void => {
				let testIndex = Math.floor((start + end) / 2)
				let testPosition = this.sortedSpritesY[testIndex].getPosition()
				let newStart, newEnd
				if(position.y > testPosition.y) {
					newStart = testIndex + 1
					newEnd = end
				}
				else if(position.y < testPosition.y) {
					newStart = start
					newEnd = testIndex
				}
				
				if(position.y == testPosition.y) { // special case if they are equal to eachother
					this.sortedSpritesY.splice(testIndex, 0, sprite)
				}
				else {
					// we have found the position to insert stuff at
					if(newStart == newEnd) {
						this.sortedSpritesY.splice(newEnd, 0, sprite)
					}
					else {
						addToSortedListY(newStart, newEnd)
					}
				}
			}

			addToSortedListX(0, this.sortedSpritesX.length)
			addToSortedListY(0, this.sortedSpritesY.length)
		}
		this.recalcBoundary()
	}

	public remove(sprite: Sprite): void {
		this.sprites.delete(sprite)
		this.sortedSpritesX.splice(this.sortedSpritesX.indexOf(sprite), 1)
		this.sortedSpritesY.splice(this.sortedSpritesY.indexOf(sprite), 1)
		this.recalcBoundary()
	}

	// updates a sprites position within the chunk
	public updateSprite(sprite: Sprite): void {
		this.remove(sprite)
		this.add(sprite)
	}

	private recalcBoundary(): void {
		if(this.sortedSpritesX.length > 0) {
			let foundMaxX = this.sortedSpritesX[this.sortedSpritesX.length - 1]
			let foundMaxY = this.sortedSpritesY[this.sortedSpritesY.length - 1]

			this.maxBoundary = new Vector(foundMaxX.getPosition().x + foundMaxX.width / 2, foundMaxY.getPosition().y + foundMaxY.height / 2)
			
			let foundMinX = this.sortedSpritesX[0]
			let foundMinY = this.sortedSpritesY[0]

			this.minBoundary = new Vector(foundMinX.getPosition().x - foundMinX.width / 2, foundMinY.getPosition().y - foundMinY.height / 2)
		}
		else {
			this.minBoundary = this.position.clone()
			this.maxBoundary = this.position.clone()
		}
	}
}