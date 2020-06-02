import Unit from "./unit";
import { networkClass, illegal, gameClass } from "../../network/networkDecorators";
import BattleTeam from "./battleTeam";
import Game from "../../game/game";
import LineMovement from "./movements/lineMovement";

@networkClass("%[Unit: team]")
@gameClass
export default class JeepUnit extends Unit {
	protected static resource: string = "./data/sprites/units/jeep.json"
	
	
	
	constructor(game: Game, team: BattleTeam) {
		super(game, team)
	}

	public reconstructor(game: Game, team: BattleTeam): void {
		super.reconstructor(game, team)
		this.createSprite()
		
		this.movement = new LineMovement(this.game, this, 3)
	}
}