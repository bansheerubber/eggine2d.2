import RemoteObject from "../../network/remoteObject";
import { networkClass, gameClass, illegal } from "../../network/networkDecorators";
import Unit from "./unit";
import Game from "../../game/game";
import BattleGamemode from "../gamemodes/battleGamemode";

@networkClass()
@gameClass
export default class BattleTeam extends RemoteObject {
	@illegal public units: Set<Unit>



	public reconstructor(game: Game): void {
		super.reconstructor(game)

		this.units = new Set();
		(this.game.gamemode as BattleGamemode).teams.add(this)
	}

	public isEnemy(unit: Unit | BattleTeam): boolean {
		return true
	}
}