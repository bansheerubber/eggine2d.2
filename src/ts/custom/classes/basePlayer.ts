import RemoteObject from "../../network/remoteObject";
import { gameClass, networkClass, client } from "../../network/networkDecorators";
import Client from "../../network/client";
import MafiaClient from "../mafiaClient";
import DinnerPartyGamemode from "../dinnerPartyGamemode";
import Game from "../../game/game";

export enum KillType {
	LYNCHED,
	SHOT,
	MAFIA_SHOT,
}

@networkClass("%[BasePlayer: gamemode]")
@gameClass
export default class BasePlayer extends RemoteObject {
	public username: string = ""
	public gamemode: DinnerPartyGamemode
	
	constructor(game: Game, gamemode: DinnerPartyGamemode) {
		super(game)
		this.gamemode = gamemode
	}

	public reconstructor(game: Game, gamemode: DinnerPartyGamemode) {
		super.reconstructor(game)
		this.gamemode = gamemode
	}

	// the action this class does during the night
	public static nightAction(gamemode: DinnerPartyGamemode): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			resolve()
		})
	}

	public getClient(): MafiaClient {
		for(let client of (this.game.network.clients as Set<MafiaClient>).values()) {
			if(client.username == this.username) {
				this.owner = client // reset the owner if required
				return client
			}
		}
		return undefined
	}

	@client(true)
	public setUsername(username: string): void {
		this.username = username
	}

	// the action this class does when they are killed
	public onKilled(killType: KillType): Promise<void> {
		return new Promise<void>((resolve, reject) => {

		})
	}
}