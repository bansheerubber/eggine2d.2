import BasePlayer, { KillType } from "./basePlayer";
import { gameClass, networkClass } from "../../network/networkDecorators";

@networkClass()
@gameClass
export default class InnocentPlayer extends BasePlayer {
	public static isInnocent: boolean = true
	
	public onKilled(killType: KillType): Promise<void> {
		return new Promise<void>((resolve, reject) => {

		})
	}
}