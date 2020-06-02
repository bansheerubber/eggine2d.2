import { BasicUIProperties } from "../../render/basicUI";
import * as React from "react";
import Sprite from "../../render/sprite";
import SpriteSheet from "../../render/spriteSheet";
import ScalarInterpolation from "../../helpers/scalarInterpolation";
import VectorInterpolation from "../../helpers/vectorInterpolation";
import Vector from "../../helpers/vector";
import Range from "../../helpers/range";
import ControllableCamera from "../controllableCamera";
import ClientNetwork from "../../network/clientNetwork";

interface MainMenuUIState {
	name: string
	visible: boolean
}

export default class MainMenuUI extends React.Component<BasicUIProperties, MainMenuUIState> {
	private sprites: Set<SpriteSheet> = new Set()
	private static startingSprites: number = 150
	private static spriteRate: number = 0.05
	private intervalID: NodeJS.Timeout
	
	
	
	constructor(props: BasicUIProperties) {
		super(props)

		this.state = {
			name: "",
			visible: true,
		}
	}

	public render(): JSX.Element {
		if(this.intervalID === undefined && this.state.visible) { // on render, init the flying sprites for the background of the main menu
			for(let i = 0; i < MainMenuUI.startingSprites; i++) {
				this.createFlyingSprite(Range.getRandomDec(0, 1))
			}
	
			this.intervalID = setInterval(() => {
				this.createFlyingSprite()
			}, MainMenuUI.spriteRate * 1000);

			(this.props.game.renderer.camera as ControllableCamera).active = false // disable the camera
			this.props.game.renderer.camera.position = new Vector(0, 0) // set the camera's position to the origin
		}
		
		return <div className="mainMenu" style={{
			display: this.state.visible ? "block" : "none",
		}}>
			<div>
				<input type="text" value={this.state.name} placeholder="Name" onChange={(event) => {
					this.setState({
						name: event.target.value.trimLeft(),
					})
				}}></input>
				<button disabled={this.state.name == ""} onClick={(event) => {
					if(this.state.name != "") {
						(this.props.game.renderer.camera as ControllableCamera).active = true
						this.deleteFlyingSprites()
						clearInterval(this.intervalID)
						this.intervalID = undefined
						this.setState({
							visible: false,
						});
						(this.props.game.network as ClientNetwork).client.connectByName("test server")
					}
				}}>Play Game</button>
			</div>
		</div>
	}

	private deleteFlyingSprites(): void {
		for(let sprite of this.sprites.values()) {
			sprite.destroy()
		}
	}

	private createFlyingSprite(startPercent: number = 0): void {
		let sprite = new SpriteSheet(this.props.game, "./data/sprites/units/jeep.json")

		let signX = Range.getRandomInt(0, 1) ? -1 : 1
		let signY = Range.getRandomInt(0, 1) ? -1 : 1

		let start, end
		if(Range.getRandomInt(0, 1) == 1) { // spawn above/below the x axis
			start = new Vector(signX * Range.getRandomInt(0, 2000), signY * 2000)
			end = new Vector(-signX * Range.getRandomInt(0, 2000), -signY * 2000)
		}
		else { // spawn side to side along the y axis
			start = new Vector(signX * 2000, signY * Range.getRandomInt(0, 2000))
			end = new Vector(-signX * 2000, -signY * Range.getRandomInt(0, 2000))
		}

		let time = Range.getRandomDec(6, 8)
		new VectorInterpolation(this.props.game, start, end, time, (vector: Vector) => {
			if(!sprite.isDestroyed) {
				sprite.setPosition(vector)	
			}
		}, (vector: Vector) => {
			if(!sprite.isDestroyed) {
				sprite.destroy()
				this.sprites.delete(sprite)
			}
		}).timeElapsed = time * startPercent

		sprite.setScale(new Vector(3, 3))
		this.sprites.add(sprite)
	}
}