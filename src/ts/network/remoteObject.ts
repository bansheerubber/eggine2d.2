import Game from "../game/game";
import GameObjectOptions from "../game/gameObjectOptions";
import NetworkMetadata from "./networkMetadata";
import GameObject from "../game/gameObject";
import { gameClass, networkClass } from "./networkDecorators";
import { ServerResolve } from "./remoteMethod";
import ServerNetwork from "./serverNetwork";
import ClientNetwork from "./clientNetwork";
import Network from "./network";
import RemoteGroup from "./remoteGroup";

// classes that need to communicate over the network inherits from this object
export default class RemoteObject extends GameObject {
	public owner: RemoteObject
	public isCommunal: boolean = false

	public remoteID: number = -1
	public remoteGroupID: number = -1
	public remoteGroup: RemoteGroup
	

	
	constructor(game: Game, gameObjectOptions?: GameObjectOptions) {
		super(game, gameObjectOptions)
		Object.assign(this)

		if(this.game.isServer) {
			this.game.network.addRemoteObject(this, gameObjectOptions?.customRemoteGroupID, gameObjectOptions?.customRemoteID)
			setTimeout(() => {
				(this.game.network as ServerNetwork).sendRemoteObjectToClients(this)
			}, 1)
		}
		else if(gameObjectOptions?.customRemoteID !== undefined) {
			this.game.network.addRemoteObject(this, gameObjectOptions?.customRemoteGroupID, gameObjectOptions?.customRemoteID)
		}
	}

	// called when the constructor is called. however, when recreating a remote object from network information, we do not call the constructor and instead call only this.
	public reconstructor(game: Game, ...args: any[]): void {
		this.game = game
		let options = args[0] as GameObjectOptions

		if(options) {
			this.remoteGroupID = options.customRemoteGroupID === undefined ? -1 : options.customRemoteGroupID
			this.remoteID = options.customRemoteID === undefined ? -1 : options.customRemoteID
		}

		if(this.remoteGroupID != -1 && this.remoteID != -1) {
			this.game.network.hasBeenReconstructed[this.remoteGroupID][this.remoteID] = true
		}
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