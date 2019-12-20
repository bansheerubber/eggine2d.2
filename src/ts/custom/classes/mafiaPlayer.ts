import BasePlayer, { KillType } from "./basePlayer";
import { client, gameClass, networkClass } from "../../network/networkDecorators";
import sleep from "../../helpers/sleep";
import DinnerPartyGamemode from "../dinnerPartyGamemode";
import ServerNetwork from "../../network/serverNetwork";
import { ServerResolve } from "../../network/remoteMethod";
import Range from "../../helpers/range";

@networkClass("%[BasePlayer: gamemode]")
@gameClass
export default class MafiaPlayer extends BasePlayer {
	public static isInnocent: boolean = false
	public static waitTime: number = 20 * 1000

	public static lookUp: string = "<speak>Mafia members, look up. Work with eachother and choose who to poison.</speak>"
	public static lookDown: string = "<speak>Mafia members, look down. Your turn is complete.</speak>"
	
	public static nightAction(gamemode: DinnerPartyGamemode): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			// let the mafia deliberate
			gamemode.renderUI("countdown", {
				time: this.waitTime / 1000,
				subtext: "Mafia",
				countdown: false,
			})
			
			await gamemode.playSpeech(this.lookUp)
			
			gamemode.renderUI("countdown", {
				time: this.waitTime / 1000,
				subtext: "Mafia",
				countdown: true,
			})
			
			await sleep(this.waitTime / 2)

			// check for mafia integreity
			let players = gamemode.getClientsFromPlayersByClass(MafiaPlayer)
			if(!gamemode.checkClientIntegreity(players)) {
				// if we have no integrity, then wait for some
				await gamemode.waitForClientIntegrity(gamemode.getPlayersByClass(MafiaPlayer))

				// grant mafia extra time for thier phones breaking
				gamemode.renderUI("countdown", {
					time: this.waitTime / 1000,
					subtext: "Mafia",
					countdown: true,
				})
				await sleep(this.waitTime / 2) 
			}

			await sleep(this.waitTime / 2)

			// get the votes from players
			let promiseArray: Promise<ServerResolve[]>[] = []
			for(let player of gamemode.getPlayersByClass(MafiaPlayer) as MafiaPlayer[]) {
				player.getVotedPlayer()
				promiseArray.push((gamemode.game.network as ServerNetwork).getLastRemoteReturns().promise);
			}

			let votes = []
			Promise.all(promiseArray).then(async (values) => {
				for(let resolve of values) {
					votes.push(resolve[0].value)
				}

				// check to see if all votes are the same. if they are not, then we don't kill anyone
				let testVote = votes[0]
				let allSame = true
				for(let vote of votes) {
					if(testVote != vote) {
						allSame = false
						break
					}
				}

				// kill the player
				if(allSame) {
					console.log("KILLING", testVote)
				}
				else {
					console.log("EVERYONE LIVES!")
				}

				gamemode.renderUI("message", {
					message: "Time's Up!"
				})

				await gamemode.playSpeech(this.lookDown)

				resolve()
			})
		})
	}

	@client(false, true)
	public getVotedPlayer(): string {
		return Range.getRandomInt(0, 10000).toString()
	}

	@client(true)
	public onKilled(killType: KillType): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			console.log("DING DONG THE MAFIA IS DEAD")
			resolve()
		})
	}
}