import Client from "../network/client";
import DinnerPartyGamemode from "./dinnerPartyGamemode";
import BasePlayer from "./classes/basePlayer";
import { gameClass, networkClass, server, client } from "../network/networkDecorators";
import Game from "../game/game";
import ServerNetwork from "../network/serverNetwork";
import { ServerResolve } from "../network/remoteMethod";
import AudioEngine from "../game/audioEngine";
import TextToSpeech from "./textToSpeech";

@networkClass()
@gameClass
export default class MafiaClient extends Client {
	public username: string = ""
	public gamemode: DinnerPartyGamemode

	constructor(game: Game, websocket?: any, request?: any) {
		super(game, websocket, request)
		this.gamemode = this.game.gamemode as DinnerPartyGamemode

		this.getBasePlayer() // reset the owner of our base player when we are created
	}

	reconstructor(game: Game) {
		super.reconstructor(game)
		this.gamemode = this.game.gamemode as DinnerPartyGamemode
	}

	public getBasePlayer(): BasePlayer {
		for(let player of this.gamemode.players) {
			if(player.username == this.username) {
				player.owner = this // reset the owner of our player
				return player
			}
		}
		return undefined
	}

	@server()
	public setUsername(username: string): void {
		this.username = username
		this.getBasePlayer() // reset the owner of our base player when we are created
		this.updateUsername(username)
	}

	@client()
	public updateUsername(username: string): void {
		this.username = username
	}

	@client(false, true)
	public playSpeech(text: string): void {
		AudioEngine.playMP3(`./audio/${TextToSpeech.textToFileName(text)}`)
	}
}