import BasePlayer, { KillType } from "./basePlayer";
import { networkClass, gameClass } from "../../network/networkDecorators";
import DinnerPartyGamemode from "../dinnerPartyGamemode";
import sleep from "../../helpers/sleep";

@networkClass()
@gameClass
export default class OfficerPlayer extends BasePlayer {
	public static isInnocent: boolean = true
	public static waitTime: number = 15 * 1000

	public static lookUp: string = "<speak>Officer, look up. Choose who to investigate.</speak>"
	public static lookDown: string = "<speak>Officer, look down. Your turn is complete.</speak>"
	
	public static nightAction(gamemode: DinnerPartyGamemode): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			// let the officer deliberate
			gamemode.renderUI("countdown", {
				time: this.waitTime / 1000,
				subtext: "Officer",
				countdown: false,
			})
			
			await gamemode.playSpeech(this.lookUp)
			
			gamemode.renderUI("countdown", {
				time: this.waitTime / 1000,
				subtext: "Officer",
				countdown: true,
			})
			
			await sleep(this.waitTime / 2)

			// check for mafia integreity
			let players = gamemode.getClientsFromPlayersByClass(OfficerPlayer)
			if(!gamemode.checkClientIntegreity(players)) {
				// if we have no integrity, then wait for some
				await gamemode.waitForClientIntegrity(gamemode.getPlayersByClass(OfficerPlayer))

				// grant mafia extra time for thier phones breaking
				gamemode.renderUI("countdown", {
					time: this.waitTime / 1000,
					subtext: "Officer",
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