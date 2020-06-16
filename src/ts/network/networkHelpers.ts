import RemoteObject from "./remoteObject";
import { ServerResolve } from "./remoteMethod";

// wrapper for resolving remote returns
export async function remoteReturn<T>(object: RemoteObject, func: (...args) => T, ...args: any[]): Promise<T> {
	func.apply(object, args)

	if(object.game.isClient) {
		return object.getRemoteReturn()
	}
	else {
		return object.getRemoteReturn().then((values: ServerResolve[]) => {
			return new Promise((resolve, reject) => {
				resolve(values[0] as any as T)
			})
		})
	}
}