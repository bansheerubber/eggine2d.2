import * as React from "react";
import { BasicUIProperties } from "../../render/basicUI";
import Game from "../../game/game";
import OverworldGamemode from "./overworldGamemode";
import Hex from "./hex";

interface MinimapUIState {
	width: number
	height: number
	cameraX: number
	cameraY: number
	leftCornerX: number
	leftCornerY: number
	rightCornerX: number
	rightCornerY: number
}

export default class MinimapUI extends React.Component<BasicUIProperties, MinimapUIState> {
	public game: Game
	public lastRelease: number = 0


	
	constructor(props: BasicUIProperties) {
		super(props)
		this.game = props.game

		this.state = {
			width: 0,
			height: 0,
			cameraX: 0,
			cameraY: 0,
			leftCornerX: 0,
			leftCornerY: 0,
			rightCornerX: 0,
			rightCornerY: 0,
		};
		(this.game.gamemode as OverworldGamemode).minimapUI = this
	}

	public render(): JSX.Element {
		function worldToMap(x: number, y: number): number[] {
			let approximateTileX = Math.floor(x / (Hex.width - Hex.xOffset))
			let approximateTileY = Math.floor(y / (Hex.height - Hex.outline))
			return [approximateTileX, approximateTileY]
		}

		let [centerX, centerY] = worldToMap(this.state.cameraX, this.state.cameraY)
		let [leftCornerX, leftCornerY] = worldToMap(this.state.leftCornerX, this.state.leftCornerY)
		let [rightCornerX, rightCornerY] = worldToMap(this.state.rightCornerX, this.state.rightCornerY)

		let width = rightCornerX - leftCornerX
		let height = rightCornerY - leftCornerY

		return <div style={{
			width: this.state.width,
			height: this.state.height,
			position: "absolute",
			bottom: 0,
			right: 0,
			zIndex: 10000,
			overflow: "hidden",
		}}>
			<canvas id="minimapCanvas" width={this.state.width} height={this.state.height}></canvas>
			<div style={{
				position: "absolute",
				top: centerY,
				left: centerX,
				width,
				height,
				border: "2px solid red",
				transform: "translate(-50%, -50%)",
			}}></div>
			<div onMouseDown={(event) => {
				let [x, y] = Hex.hexPositionToWorldPosition(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
				this.game.renderer.camera.position.set(x, y)
			}} onMouseMove={(event) => {
				if(event.buttons == 1) {
					if(performance.now() - this.lastRelease > 200) {
						let [x, y] = Hex.hexPositionToWorldPosition(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
						this.game.renderer.camera.position.set(x, y)
					}
				}
				else {
					this.lastRelease = performance.now()
				}
			}} style={{
				position: "absolute",
				width: this.state.width,
				height: this.state.height,
				top: 0,
				left: 0,
				zIndex: 1000000,
			}}></div>
		</div>
	}

	public generateMinimap(): void {
		this.setState({
			width: (this.game.gamemode as OverworldGamemode).hexMap.size.x,
			height: (this.game.gamemode as OverworldGamemode).hexMap.size.y,
		})
		
		let start = performance.now()
		let context = (document.getElementById("minimapCanvas") as HTMLCanvasElement).getContext("2d")
		for(let hex of (this.game.gamemode as OverworldGamemode).hexMap.hexes.values()) {
			context.fillStyle = (hex.constructor as typeof Hex).minimapColor
			context.fillRect(hex.position.x, hex.position.y, 1, 1)
		}
		console.log(performance.now() - start)
	}
}