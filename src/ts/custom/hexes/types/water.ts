import Game from "../../../game/game";
import GameObjectOptions from "../../../game/gameObjectOptions";
import Hex from "../hex";

export default class WaterHex extends Hex {
	protected static resource: string = "./data/sprites/hexes/water.png"
	public static minimapColor: string = "rgb(3, 169, 252)"


	
	constructor(game: Game, gameObjectOptions?: GameObjectOptions) {
		super(game, {
			canTick: false,
		})
	}
}