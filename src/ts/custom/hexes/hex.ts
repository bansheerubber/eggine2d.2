import RemoteObject from "../../network/remoteObject";
import HexMap from "./hexMap";
import Vector from "../../helpers/vector";
import Sprite from "../../render/sprite";
import Game from "../../game/game";
import GameObjectOptions from "../../game/gameObjectOptions";

export default class Hex extends RemoteObject {
	protected static resource: string = ""
	public map: HexMap
	public position: Vector = new Vector()
	public sprite: Sprite

	public static width: number = 43
	public static height: number = 36
	public static xOffset: number = 10
	public static outline: number = 2
	public static minimapColor: string = "rgb(0, 0, 0)"



	constructor(game: Game, gameObjectOptions?: GameObjectOptions) {
		super(game, gameObjectOptions)
		this.sprite = new Sprite(game, (this.constructor as typeof Hex).resource, this.game.renderer.hex)
	}

	public setPosition(position: Vector): void {
		// reset the position of this hex in our map
		if(this.map) {
			this.map.removeHex(this)
			this.map.addHex(this)
		}

		// set the position of the hex's sprite
		let [x, y] = Hex.hexPositionToWorldPosition(this.position.x, this.position.y)
		this.sprite.setPosition(this.sprite.getPosition().set(x, y))
	}

	public static hexPositionToWorldPosition(x: number, y: number): number[] {
		let ox = x * Hex.width - Hex.xOffset * x
		let oy = y * Hex.height - Hex.outline * y + x % 2 * Hex.height / 2 - x % 2
		return [ox, oy]
	}
}