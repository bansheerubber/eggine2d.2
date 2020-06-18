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

	public reconstructor(game: Game, unit: Unit): void {
		super.reconstructor(game, unit)
		this.unit = unit
	}

	/**
	 * whether or not we can perform an attack on a unit. detects if there is an enemy. if there's no enemy, then don't fire
	 */
	public abstract canAttack(): boolean

	/**
	 * attack an enemy we've found within our range
	 * @param enemy the enemy to attack
	 */
	public abstract async attack(enemy: Unit): Promise<boolean>

	/**
	 * reloads the attack, performed at the end of a trun
	 */
	public abstract async reload(): Promise<void>
}