import Gamemode from "../../game/gamemode"
import Game from "../../game/game";
import HexMap from "../hexes/hexMap";
import MinimapUI from "../hexes/minimapUI";
import { networkClass, gameClass, illegal } from "../../network/networkDecorators";
import TestClient from "../testClient";
import Client from "../../network/client";

@networkClass("%[OverworldGamemode: hexMap]")
@gameClass
export default class OverworldGamemode extends Gamemode {
	public hexMap: HexMap
	@illegal public minimapUI: MinimapUI
	@illegal public clientClass: typeof Client = TestClient
	
	
	
	constructor(game: Game, hexMap: HexMap) {
		super(game)
	}

	public reconstructor(game: Game, hexMap: HexMap): void {
		super.reconstructor(game)
		this.hexMap = hexMap
	}
}