import Gamemode from "../game/gamemode";
import Client from "../network/client";
import MafiaClient from "./mafiaClient";
import BasePlayer from "./classes/basePlayer";
import { gameClass, networkClass, illegal, server, player, client } from "../network/networkDecorators";
import InnocentPlayer from "./classes/innocentPlayer";
import ButlerPlayer from "./classes/butlerPlayer";
import OfficerPlayer from "./classes/officerPlayer";
import MafiaPlayer from "./classes/mafiaPlayer";
import DoctorPlayer from "./classes/doctorPlayer";
import Range from "../helpers/range";
import sleep from "../helpers/sleep";
import * as React from "react";
import StringToUI from "./ui/stringToUI";
import Game from "../game/game";
import TextToSpeech from "./textToSpeech";
import AudioEngine from "../game/audioEngine";

@networkClass()
@gameClass
export default class DinnerPartyGamemode extends Gamemode {
	@illegal public clientClass: typeof Client = MafiaClient
	public players: BasePlayer[] = []
	public isCommunal: boolean = true
	@illegal public dayTimeout: number
	public static dayLength: number = 10 * 60 * 1000

	public currentNight: number = 1

	public static lynchedText: string = "<speak>You all have chosen to poison %s. A grand idea, if I were to say so myself.</speak>"
	public static killedText: string = "<speach>I regretfully inform you all that %s has been found dead from ingesting poison. Such a tragedy."

	@illegal public currentUI: React.Component

	constructor(game: Game) {
		super(game)

		// create all the required speech
		TextToSpeech.createTextToSpeechAPI()
		let file = TextToSpeech.saveToMP3("<speak>Good evening ladies and gentlemen, welcome to night 1 of Sir Cobblepot's exquisite dinner party. We gather here in celebration of Sir's brand new railway built in North America. All proceeds will go to furthering the construction of the Sir's railway, which will soon encircle the entire world. Unfortunately, I must report that there are MAD, MEAN, MYSTERIOUS, MISCHIEVOUS, MURDEROUS, MAFIA MEMBERS hiding amongst you. I dare say that the Americans have infiltrated this once fabulous ball. It is of the Cobblepot House Rule to not become involved in such disputes, so you must figure out who is responsible for your future deaths on your own. And with that, I bid you sweet dreams, and god save you all.</speak>")
		
		for(let i = 1; i <= 20; i++) {
			TextToSpeech.saveToMP3(`<speak>Now we start night ${i}. Everyone, please place your heads down.</speak>`)
		}

		TextToSpeech.saveToMP3(`<speak>Welcome back to the dinner party. Everyone please look up and enjoy your meals. Also, please do try to figure out who is murdering you all. God save Mr Cobblepot.</speak>`)

		TextToSpeech.saveToMP3(MafiaPlayer.lookUp)
		TextToSpeech.saveToMP3(MafiaPlayer.lookDown)

		TextToSpeech.saveToMP3(DoctorPlayer.lookUp)
		TextToSpeech.saveToMP3(DoctorPlayer.lookDown)

		TextToSpeech.saveToMP3(OfficerPlayer.lookUp)
		TextToSpeech.saveToMP3(OfficerPlayer.lookDown)

		TextToSpeech.saveToMP3("<speak>Whoops, looks like all of you innocent folks have died. Mr. Cobblepot won't be pleased to hear about this.</speak>")
		TextToSpeech.saveToMP3("<speak>A grand champagne is in order. You innocent lot have won against your mafioso foes.</speak>")

		TextToSpeech.saveToMP3("<speak>It seems we're at an impasse. How unfortunate. I'm sure the mafia will not be as forgiving.</speak>")


		AudioEngine.initServerSideAudio()

		AudioEngine.getLengthOfMP3(file).then((value) => {
			console.log(value)
		})
	}

	// plays speech on host and waits for audio
	public async playSpeech(text: string): Promise<void> {
		for(let client of (this.game.network.clients as Set<MafiaClient>).values()) {
			if(client.username == "Host") {
				client.playSpeech(text)
			}
		}
		
		await AudioEngine.waitForMP3(TextToSpeech.audioOutput + TextToSpeech.textToFileName(text))
	}

	@server()
	public async startGame(@player client?: MafiaClient): Promise<void> {
		if(client.username == "Host") {
			/*let mafiaClasses: typeof BasePlayer[] = []
			this.addPlayers(mafiaClasses, MafiaPlayer, 0.3, 2, 100, 0)
			this.addPlayers(mafiaClasses, OfficerPlayer, 0, 1, 100, 0)
			this.addPlayers(mafiaClasses, DoctorPlayer, 0, 1, 100, 0)
			this.addPlayers(mafiaClasses, ButlerPlayer, 0, 1, 100, 8)
			this.fillPlayers(mafiaClasses, InnocentPlayer)*/

			let mafiaClasses = [MafiaPlayer, MafiaPlayer]
			this.assignRoles(mafiaClasses)

			this.renderUI("message", {
				message: "Welcome! Enjoy your stay.",
			})
			await this.playSpeech("<speak>Good evening ladies and gentlemen, welcome to night 1 of Sir Cobblepot's exquisite dinner party. We gather here in celebration of Sir's brand new railway built in North America. All proceeds will go to furthering the construction of the Sir's railway, which will soon encircle the entire world. Unfortunately, I must report that there are MAD, MEAN, MYSTERIOUS, MISCHIEVOUS, MURDEROUS, MAFIA MEMBERS hiding amongst you. I dare say that the Americans have infiltrated this once fabulous ball. It is of the Cobblepot House Rule to not become involved in such disputes, so you must figure out who is responsible for your future deaths on your own. And with that, I bid you farewell, goodnight, sweet dreams, and finally, god save you all.</speak>")

			await sleep(500)

			this.doPhase()
		}
		else {
			console.log("client is not the host")
		}
	}

	public async doPhase(): Promise<void> {
		this.renderUI("message", {
			message: "Bed time!",
		})
		await this.playSpeech(`<speak>Now we start night ${this.currentNight}. Everyone, please place your heads down.</speak>`)
		await sleep(1500)
		
		await this.enterNightPhase()
		this.currentNight++

		this.renderUI("countdown", {
			time: DinnerPartyGamemode.dayLength / 1000,
			subtext: "Dinnertime",
			mode: "Vote Early",
			countdown: false,
		})
		await this.playSpeech("<speak>Welcome back to the dinner party. Everyone please look up and enjoy your meals. Also, please do try to figure out who is murdering you all. God save Mr Cobblepot.</speak>")

		await this.enterDayPhase()
		this.enterVotePhase()
	}

	// renders a UI to clients
	@client()
	public renderUI(name: string, state: {}): void {
		this.currentUI = StringToUI.renderUI(name, this.game)
		this.currentUI.setState(state)
	}

	public async enterNightPhase(): Promise<void> {
		let classOrder = [MafiaPlayer, DoctorPlayer, OfficerPlayer]
		return new Promise<void>(async (resolve, reject) => {
			for(let mafiaClass of classOrder) {
				await mafiaClass.nightAction(this)

				this.renderUI("message", {
					message: "Time's Up!"
				})
				await sleep(1500)
			}
			
			resolve()
		})
	}

	public async enterDayPhase(): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			this.renderUI("countdown", {
				time: DinnerPartyGamemode.dayLength / 1000,
				subtext: "Dinnertime",
				mode: "Vote Early",
				countdown: true,
			})
			
			this.dayTimeout = setTimeout(async () => {
				this.renderUI("message", {
					message: "Time's Up! Now you must vote."
				})
				await sleep(2000)

				resolve()
			}, DinnerPartyGamemode.dayLength) as any as number // i hate nodejs
		})
	}

	public enterVotePhase(): void {
		this.renderUI("vote", {
			names: ["Nobody", ...this.players.map((value: BasePlayer) => {
				return value.username
			})]
		})
	}

	@server()
	public voteToKill(name: string, @player client?: MafiaClient): void {
		if(client.username == "Host") {
			console.log(`Ouch! ${name} dies.`);
			(async () => {
				if(name == "Nobody") {
					await this.playSpeech("<speak>It seems we're at an impasse. How unfortunate. I'm sure the mafia will not be as forgiving.</speak>")
				}
				else {
					await this.playSpeech(DinnerPartyGamemode.lynchedText.replace("%s", name.toLowerCase()))
				}
				await sleep(500)
				this.doPhase()
			})()
		}
	}

	@server()
	public voteEarly(@player client?: MafiaClient): void {
		if(client.username == "Host") {
			clearTimeout(this.dayTimeout)
			this.enterVotePhase()
		}
	}

	// checkes to see if all the required clients are avaliable or not
	public checkClientIntegreity(clients: MafiaClient[]): boolean {
		// make sure the clients are correctly defined and have been active recently
		for(let client of clients) {
			if(client == undefined || (performance.now() - client.getLastActive()) > 700) {
				return false
			}
		}
		return true
	}

	public async waitForClientIntegrity(players: BasePlayer[]): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			function getClients(players: BasePlayer[]): MafiaClient[] {
				let output = []
				for(let player of players) {
					output.push(player.getClient())
				}
				return output
			}

			let clients = getClients(players)
			while(!this.checkClientIntegreity(clients)) {
				await sleep(100)
				clients = getClients(players)
			}
			resolve()
		})
	}

	public assignRoles(classArray: typeof BasePlayer[]): void {
		for(let client of (this.game.network.clients as Set<MafiaClient>).values()) {
			let index = Range.getRandomInt(0, classArray.length - 1)
			let mafiaClass = classArray[index]

			let player = new mafiaClass(this.game, this)
			player.owner = client
			player.setUsername(client.username)
			this.players.push(player)

			// generate text to speech stuff for each player
			TextToSpeech.saveToMP3(DinnerPartyGamemode.lynchedText.replace("%s", client.username.toLowerCase()))
			TextToSpeech.saveToMP3(DinnerPartyGamemode.killedText.replace("%s", client.username.toLowerCase()))

			classArray.splice(index, 1) // remove the class from the class list

			console.log(`${client.username} has been assigned ${mafiaClass.name}`)
		}
		this.sendPlayers(this.players)
	}

	@client()
	public sendPlayers(players: BasePlayer[]): void {
		this.players = players
	}

	// adds a certain amount of players to the class array
	public addPlayers(classArray: typeof BasePlayer[], playerClass: typeof BasePlayer, percent: number, min: number, max: number, playerMin: number): void {
		let playerCount = this.getPlayerCount()
		if(playerCount >= playerMin) {
			let count = Math.min(Math.max(Math.ceil(playerCount * percent), min), max)
			for(let i = 0; i < count; i++) {
				classArray.push(playerClass)
			}
		}
	}

	// fills the rest of the class array with hte specified mafia player class
	public fillPlayers(classArray: typeof BasePlayer[], playerClass: typeof BasePlayer): void {
		let playerCount = this.getPlayerCount()
		for(let i = playerCount - classArray.length; i >= 0; i--) {
			classArray.push(playerClass)
		}
	}

	public getClientsFromPlayers(): MafiaClient[] {
		let output = []
		for(let player of this.players) {
			output.push(player.getClient())
		}
		return output
	}

	public getClientsFromPlayersByClass(mafiaClass: typeof BasePlayer): MafiaClient[] {
		let output = []
		for(let player of this.players) {
			if(player instanceof mafiaClass) {
				output.push(player.getClient())
			}
		}
		return output
	}

	public getPlayersByClass(mafiaClass: typeof BasePlayer): BasePlayer[] {
		let output = []
		for(let player of this.players) {
			if(player instanceof mafiaClass) {
				output.push(player)
			}
		}
		return output
	}

	private getPlayerCount(): number {
		return this.game.network.clients.size
	}
}