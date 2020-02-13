import Game from "../../../game/game";
import GameObjectOptions from "../../../game/gameObjectOptions";
import Hex from "../hex";

export default class MountainHex extends Hex {
	protected static resource: string = "./data/sprites/hexes/mountain.png"
	public static minimapColor: string = "rgb(112, 112, 112)"


	
	constructor(game: Game, gameObjectOptions?: GameObjectOptions) {
		super(game, {
			canTick: false,
		})
	}
}