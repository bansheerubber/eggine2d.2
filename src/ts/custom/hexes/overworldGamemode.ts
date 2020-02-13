import Gamemode from "../../game/gamemode"
import Game from "../../game/game";
import HexMap from "./hexMap";
import MinimapUI from "./minimapUI";

export default class OverworldGamemode extends Gamemode {
	public hexMap: HexMap
	public minimapUI: MinimapUI
	
	
	
	constructor(game: Game, hexMap: HexMap) {
		super(game)
		this.hexMap = hexMap
	}
}