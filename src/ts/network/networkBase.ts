import RemoteObject from "./remoteObject";
import Game from "../game/game";
import Client from "./client"
import { RemoteMethodPayload, ClientRemoteReturn } from "./remoteMethod";

// base class for the server/client network classes, has some abstract functions
export default abstract class NetworkBase {
	public remoteObjects: { [key: number]: RemoteObject } = {}
	public remoteObjectsSet: Set<RemoteObject> = new Set<RemoteObject>()
	public remoteClassReferences: { [key: number]: RemoteObject[] } = {}
	public game: Game
	public hasBeenReconstructed: { [key: number]: boolean } = {}
	public clients: Set<Client> = new Set<Client>()

	public remoteReturns: { [key: number]: any } = {}

	protected remoteReturnCount: number = 0
	protected remoteResolves: { [key: number]: (value: any) => void } = {}
	protected remoteRejects: { [key: number]: (reason: any) => void } = {}

	private nextRemoteID: number = 0



	constructor(game: Game) {
		this.game = game
	}

	public addRemoteObject(remoteObject: RemoteObject, customRemoteID?: number): void {	
		if(customRemoteID && this.remoteObjects[customRemoteID]) {
			this.removeRemoteObject(this.remoteObjects[customRemoteID])
		}
		
		let remoteID = customRemoteID != undefined ? customRemoteID : this.nextRemoteID
		this.remoteObjects[remoteID] = remoteObject
		remoteObject.remoteID = remoteID
		
		if(customRemoteID == undefined) {
			this.nextRemoteID++
		}

		this.remoteObjectsSet.add(remoteObject)
	}

	public removeRemoteObject(remoteObject: RemoteObject): void {
		delete this.remoteObjects[remoteObject.remoteID]
		this.remoteObjectsSet.delete(remoteObject)
	}

	public setRemoteClassReferences(ownerObject: RemoteObject, array: RemoteObject[]): void {
		this.remoteClassReferences[ownerObject.remoteID] = array
	}

	public addRemoteClassReference(ownerObject: RemoteObject, otherObject: RemoteObject, position: number): void {
		if(!this.getRemoteClassReferences(ownerObject)) {
			this.remoteClassReferences[ownerObject.remoteID] = []
		}

		this.remoteClassReferences[ownerObject.remoteID][position] = otherObject
	}

	public abstract executeRemoteMethod(...args: any[]): void

	public getRemoteClassReferences(ownerObject: RemoteObject): RemoteObject[] {
		return this.remoteClassReferences[ownerObject.remoteID]
	}

	public resolveRemoteReturn(returnID: number, data: any): any {
		if(this.remoteResolves[returnID]) {
			this.remoteResolves[returnID](data)

			// cleanup the various data structures we shat the promise into
			this.remoteResolves[returnID] = undefined
			this.remoteRejects[returnID] = undefined
			this.remoteReturns[returnID] = undefined
		}
	}

	public rejectRemoteReturn(returnID: number, reason?: any): void {
		if(this.remoteRejects[returnID]) {
			this.remoteRejects[returnID](reason)

			// cleanup the various data structures we shat the promise into
			this.remoteResolves[returnID] = undefined
			this.remoteRejects[returnID] = undefined
			this.remoteReturns[returnID] = undefined
		}
	}
}