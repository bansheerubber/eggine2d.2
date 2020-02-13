import Game from "../../../game/game";
import GameObjectOptions from "../../../game/gameObjectOptions";
import Hex from "../hex";

export default class GrassHex extends Hex {
	protected static resource: string = "./data/sprites/hexes/hex.png"
	public static minimapColor: string = "rgb(47, 138, 62)"


	
	constructor(game: Game, gameObjectOptions?: GameObjectOptions) {
		super(game, {
			canTick: false,
		})
	}
}