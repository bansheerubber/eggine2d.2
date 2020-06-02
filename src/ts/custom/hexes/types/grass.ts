import Game from "../../../game/game";
import GameObjectOptions from "../../../game/gameObjectOptions";
import Hex from "../hex";
import { gameClass, networkClass } from "../../../network/networkDecorators";

@networkClass()
@gameClass
export default class GrassHex extends Hex {
	protected static resource: string = "./data/sprites/hexes/hex.png"
	public static minimapColor: string = "rgb(47, 138, 62)"


	
	constructor(game: Game, customRemoteID: number) {
		super(game, customRemoteID, false)
	}

	public reconstructor(game: Game, customRemoteID: number): void {
		super.reconstructor(game, customRemoteID, false)
	}
}