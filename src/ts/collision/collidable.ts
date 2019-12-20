import GameObject from "../game/gameObject";
import * as PIXI from "pixi.js"
import Game from "../game/game";
import MovingPhysical from "../render/movingPhysical";
import Matter = require("matter-js");
import Vector from "../helpers/vector";
import Camera from "../render/camera";
import Sprite from "../render/sprite";

export default class Collidable extends GameObject implements MovingPhysical {
	public body: Matter.Body
	public collidingWith: Set<Collidable> = new Set<Collidable>()
	public cameras: Camera[] = []


	
	constructor(game: Game) {
		super(game)
	}

	public tick(deltaTime: number): void {
		super.tick(deltaTime)
	}

	public get rotation(): number {
		return this.body.angle
	}

	public set rotation(value: number) {
		Matter.Body.setAngle(this.body, value)
	}

	public setPosition(vector: Vector): void {
		Matter.Body.setPosition(this.body, vector.toMatter())
	}

	public getPosition(): Vector {
		return new Vector(this.body.position.x, this.body.position.y)
	}

	public setVelocity(vector: Vector): void {
		Matter.Body.setVelocity(this.body, vector.toMatter())
	}

	public getVelocity(): Vector {
		return new Vector(this.body.velocity.x, this.body.velocity.y)
	}

	public setScale(vector: Vector) {
		
	}

	public getScale(): Vector {
		return new Vector(0, 0)
	}
}