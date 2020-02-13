import Camera from "../render/camera";
import Vector from "../helpers/vector";
import Game from "../game/game";
import { Keybind } from "../game/keybinds";
import OverworldGamemode from "./hexes/overworldGamemode";

interface CameraMove {
	up: number,
	down: number,
	right: number,
	left: number
}

export default class ControllableCamera extends Camera {
	public move: CameraMove = {
		up: 0,
		down: 0,
		right: 0,
		left: 0
	}
	public speed: number = 750



	constructor(game: Game) {
		super(game)

		// move the camera up with W
		new Keybind(() => {
			this.move.up = 1
		}, () => {
			this.move.up = 0
		}, "w", Keybind.None, "Move Camera Up")

		// move the camera down with S
		new Keybind(() => {
			this.move.down = 1
		}, () => {
			this.move.down = 0
		}, "s", Keybind.None, "Move Camera Down")

		// move the camera left with A
		new Keybind(() => {
			this.move.left = 1
		}, () => {
			this.move.left = 0
		}, "a", Keybind.None, "Move Camera Left")

		// move the camera right with D
		new Keybind(() => {
			this.move.right = 1
		}, () => {
			this.move.right = 0
		}, "d", Keybind.None, "Move Camera Right")

		// zoom in the camera with +
		new Keybind(() => {
			this.zoom += this.zoom * 0.1
		}, () => {
			
		}, "=", Keybind.None, "Zoom In")

		// zoom out the camera with -
		new Keybind(() => {
			this.zoom += this.zoom * -0.1
		}, () => {
			
		}, "-", Keybind.None, "Zoom Out")
	}
	
	public tick(deltaTime: number): void {
		// apply move to the position
		let speed = this.speed * deltaTime / this.zoom
		this.position.add(new Vector(-this.move.left * speed + this.move.right * speed, -this.move.up * speed + this.move.down * speed))

		let halfWidth = (this.renderer.width / this.zoom) / 2;
		let halfHeight = (this.renderer.height / this.zoom) / 2;
		(this.game.gamemode as OverworldGamemode).minimapUI.setState({
			cameraX: this.position.x,
			cameraY: this.position.y,
			leftCornerX: this.position.x - halfWidth,
			leftCornerY: this.position.y - halfHeight,
			rightCornerX: this.position.x + halfWidth,
			rightCornerY: this.position.y + halfHeight
		})
		
		super.tick(deltaTime)
	}
	
	public onActivated(): void {
		this.move.up = 0
		this.move.down = 0
		this.move.right = 0
		this.move.left = 0
	}

	public onDeActivated(): void {
		this.move.up = 0
		this.move.down = 0
		this.move.right = 0
		this.move.left = 0
	}
}