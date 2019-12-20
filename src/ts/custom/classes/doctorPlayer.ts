import BasePlayer, { KillType } from "./basePlayer";
import { networkClass, gameClass } from "../../network/networkDecorators";
import DinnerPartyGamemode from "../dinnerPartyGamemode";
import sleep from "../../helpers/sleep";

@networkClass()
@gameClass
export default class DoctorPlayer extends BasePlayer {
	public static isInnocent: boolean = true
	public static waitTime: number = 15 * 1000

	public static lookUp: string = "<speak>Doctor, look up. Choose who to give the antidote.</speak>"
	public static lookDown: string = "<speak>Doctor, look down. Your turn is complete.</speak>"

	public static nightAction(gamemode: DinnerPartyGamemode): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			// let the doctor deliberate
			gamemode.renderUI("countdown", {
				time: this.waitTime / 1000,
				subtext: "Doctor",
				countdown: false,
			})
			
			await gamemode.playSpeech(this.lookUp)
			
			gamemode.renderUI("countdown", {
				time: this.waitTime / 1000,
				subtext: "Doctor",
				countdown: true,
			})
			
			await sleep(this.waitTime / 2)

			// check for mafia integreity
			let players = gamemode.getClientsFromPlayersByClass(DoctorPlayer)
			if(!gamemode.checkClientIntegreity(players)) {
				// if we have no integrity, then wait for some
				await gamemode.waitForClientIntegrity(gamemode.getPlayersByClass(DoctorPlayer))

				// grant mafia extra time for thier phones breaking
				gamemode.renderUI("countdown", {
					time: this.waitTime / 1000,
					subtext: "Doctor",
					countdown: true,
				})
				await sleep(this.waitTime / 2) 
			}

			await sleep(this.waitTime / 2)

			gamemode.renderUI("message", {
				message: "Time's Up!"
			})

			await gamemode.playSpeech(this.lookDown)
			
			resolve()
		})
	}
	
	public onKilled(killType: KillType): Promise<void> {
		return new Promise<void>((resolve, reject) => {
					
		})
	}
}