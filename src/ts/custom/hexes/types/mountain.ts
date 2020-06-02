import Game from "../../../game/game";
import GameObjectOptions from "../../../game/gameObjectOptions";
import Hex from "../hex";
import { networkClass, gameClass } from "../../../network/networkDecorators";

@networkClass()
@gameClass
export default class MountainHex extends Hex {
	protected static resource: string = "./data/sprites/hexes/mountain.png"
	public static minimapColor: string = "rgb(112, 112, 112)"


	
	constructor(game: Game, customRemoteID: number) {
		super(game, customRemoteID, false)
	}

	public reconstructor(game: Game, customRemoteID: number): void {
		super.reconstructor(game, customRemoteID, false)
	}
}