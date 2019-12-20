import Game from "../game/game";
import GameObjectOptions from "../game/gameObjectOptions";
import NetworkMetadata from "./networkMetadata";
import GameObject from "../game/gameObject";
import { gameClass, networkClass } from "./networkDecorators";
import { ServerResolve } from "./remoteMethod";
import ServerNetwork from "./serverNetwork";
import ClientNetwork from "./clientNetwork";
import { Network } from "./network";

// classes that need to communicate over the network inherits from this object
export default class RemoteObject extends GameObject {
	public owner: RemoteObject
	public isCommunal: boolean = false

	public remoteID: number = -1
	

	
	constructor(game: Game, gameObjectOptions?: GameObjectOptions) {
		super(game, gameObjectOptions)
		Object.assign(this)

		if(this.game.isServer) {
			this.game.network.addRemoteObject(this);
			setTimeout(() => {
				(this.game.network as ServerNetwork).sendRemoteObjectToClients(this)
			}, 1)
		}
	}

	// called when the constructor is called. however, when recreating a remote object from network information, we do not call the constructor and instead call only this.
	public reconstructor(game: Game, ...args: any[]): void {
		this.game = game
		
		this.game.network.hasBeenReconstructed[this.remoteID] = true
	}

	public getNetworkMetadata(): NetworkMetadata {
		return Network.classToMetadata(this.constructor as any)
	}

	// returns the last remote return created by our network
	public getRemoteReturn(): Promise<any> {
		return (this.game.network as ClientNetwork).getLastRemoteReturn().promise
	}

	// gets the last remote returns created by the server network
	public getRemoteReturns(): Promise<ServerResolve[]> {
		return (this.game.network as ServerNetwork).getLastRemoteReturns().promise
	}

	public destroy(): void {
		super.destroy()

		this.game.network.removeRemoteObject(this)
	}
}