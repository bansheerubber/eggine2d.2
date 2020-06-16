import GameObject from "../../../game/gameObject";
import Unit from "../unit";
import Game from "../../../game/game";
import HexGroup from "../../hexes/hexGroup";
import RemoteObject from "../../../network/remoteObject";
import { networkClass, illegal } from "../../../network/networkDecorators";

/*
attacks are something the unit performs during its attack phase. an attack can be overridden to do anything. additionally, if a unit can attack during a turn, the attack will trigger. units can hotswap attacks. while having an attack object for every single unit, even for units of the same time, is a waste of memory it shouldn't matter because we will never have like 5000000 units or whatever
*/
@networkClass("%[ArcAttack: unit]")
export default abstract class Attack extends RemoteObject {
	protected unit: Unit // the owner of this attack
	public hasAttacked: boolean = false // this is used to reload attacks at the end of a round
	@illegal public hexes: HexGroup



	constructor(game: Game, unit: Unit) {
		super(game)
		this.unit = unit
	}

	// whether or not the attack can be performed. is checked basically at all times
	public abstract canAttack(): boolean

	// the attack we perform, which can be asynchronous to account for camera movement/etc
	public abstract async attack(enemy: Unit): Promise<boolean>

	// reloads the attack, performed at the end of a turn. can be asynchronous
	public abstract async reload(): Promise<void>
}