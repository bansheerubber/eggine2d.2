import Game from "../../../game/game";
import GameObjectOptions from "../../../game/gameObjectOptions";
import Hex from "../hex";
import { networkClass, gameClass } from "../../../network/networkDecorators";

@networkClass()
@gameClass
export default class WaterHex extends Hex {
	protected static resource: string = "./data/sprites/hexes/water.png"
	public static minimapColor: string = "rgb(3, 169, 252)"


	
	constructor(game: Game, customRemoteID: number) {
		super(game, customRemoteID, false)
	}

	public reconstructor(game: Game, customRemoteID: number): void {
		super.reconstructor(game, customRemoteID, false)
	}
}