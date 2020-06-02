import GameObject from "./gameObject";
import Client from "../network/client";
import Game from "./game";
import RemoteObject from "../network/remoteObject";
import { gameClass, networkClass, illegal } from "../network/networkDecorators";

@networkClass()
@gameClass
export default class Gamemode extends RemoteObject {
	@illegal public clientClass: typeof Client

	constructor(game: Game) {
		super(game)
	}

	public reconstructor(game: Game, ...args: any[]): void {
		super.reconstructor(game)
		this.game.gamemode = this
	}

	public createClientClass(game: Game, websocket?: any, request?: any): Client {
		return new this.clientClass(game, websocket, request)
	}
}