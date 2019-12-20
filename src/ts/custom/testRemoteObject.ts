import RemoteObject from "../network/remoteObject";
import Game from "../game/game";
import { gameClass, networkClass, server, client, player, novalidate } from "../network/networkDecorators";
import Client from "../network/client";

@gameClass
@networkClass("%[TestRemoteObject: test]")
export default class TestRemoteObject extends RemoteObject {
	public test: string = ""


	
	constructor(game: Game, test: string) {
		super(game)
		
		this.test = test

		this.isCommunal = true
	}

	public reconstructor(game: Game, test: string) {
		super.reconstructor(game)

		console.log("called reconstructor")

		this.test = test

		if(game.isClient) {
			console.log("frog:", this)
		}

		console.log("frog's enemy:", test)
	}

	public announce(): void {
		console.log("frog will defeat this enemy:", this.test)
	}

	@server()
	public serverTest(test1: number, test2: string, @novalidate test3: TestRemoteObject, @player client?: Client): number {
		// console.log(test1, test2, test3, client)
		return 53
	}

	@client()
	public clientTest(): string {
		console.log("executed client command")
		return "we did it"
	}
}