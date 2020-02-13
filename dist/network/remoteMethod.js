"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("./network");
class ServerRemoteReturnCollection {
    constructor(network, id, methodID, requiredResolveCount) {
        this.resolvedReturns = [];
        this.requiredResolveCount = 0;
        this.network = network;
        this.id = id;
        this.methodID = methodID;
        this.requiredResolveCount = requiredResolveCount;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
        });
    }
    // resolves one return
    resolveRemoteReturn(resolve) {
        this.resolvedReturns.push(resolve);
        this.attemptResolve();
    }
    // rejects one return
    rejectRemoteReturn(reject) {
        this.requiredResolveCount--; // subtract from the resolve count so even if we fail one of the clients, we still are able to resolve later
        this.attemptResolve();
    }
    attemptResolve() {
        // if we've resolved everything, then resolve our promise
        if (this.resolvedReturns.length == this.requiredResolveCount) {
            this.resolve(this.resolvedReturns);
            this.network.remoteReturnCollections[this.id] = undefined; // reset the collection map
        }
    }
}
exports.ServerRemoteReturnCollection = ServerRemoteReturnCollection;
class RemoteMethod {
    constructor(networkMetadata, call) {
        this.validatedParameters = [];
        this.playerParameters = []; // the index of all parameters we should substitute with the player who invoked it
        this.isClientMethod = false;
        this.isServerMethod = false;
        this.isInstantCall = false;
        this.id = -1;
        this.networkMetadata = networkMetadata;
        this.networkMetadata.remoteMethods.push(this);
        this.id = this.networkMetadata.remoteMethods.indexOf(this);
        this.call = call;
        this.name = this.call.name;
    }
    recalculateIndex() {
        this.id = this.networkMetadata.remoteMethods.indexOf(this);
    }
    addValidatedParameter(index, typeClass) {
        if (!this.validatedParameters[index]) {
            this.validatedParameters[index] = {
                validateClass: typeClass,
                index,
            };
        }
    }
    addValidatedReturn(typeClass) {
        this.validatedReturn = typeClass;
    }
    addPlayerParameter(index) {
        this.playerParameters[index] = true;
    }
    // makes the client request the server to call this remote method on the input object
    requestToServer(remoteObject, ...args) {
        if (remoteObject.game.isClient && this.isServerMethod) {
            let methodID = -1;
            for (let remoteMethod of remoteObject.getNetworkMetadata().remoteMethods) {
                if (this.call == remoteMethod.call) {
                    methodID = remoteMethod.id;
                    break;
                }
            }
            remoteObject.game.network.requestServerMethod(remoteObject.remoteID, methodID, args);
            if (this.isInstantCall) {
                this.call.apply(remoteObject, args);
            }
        }
    }
    // makes the server request all clients to call this remote method on the input object
    requestToClients(remoteObject, onlyCallOnOwner, ...args) {
        if (remoteObject.game.isServer && this.isClientMethod) {
            let methodID = -1;
            for (let remoteMethod of remoteObject.getNetworkMetadata().remoteMethods) {
                if (this.call == remoteMethod.call) {
                    methodID = remoteMethod.id;
                    break;
                }
            }
            remoteObject.game.network.requestClientMethod(remoteObject, remoteObject.remoteID, methodID, onlyCallOnOwner, args);
            if (this.isInstantCall) {
                this.call.apply(remoteObject, args);
            }
        }
    }
    // receives a request from a client to run a paticular remote method
    receiveFromClient(remoteObject, client, ...args) {
        // validate the arguments
        for (let i = 0; i < this.validatedParameters.length; i++) {
            let validation = this.validatedParameters[i];
            if (validation.validateClass) {
                let validator = network_1.Network.validators.get(validation.validateClass);
                if (!validator) {
                    console.error(`Remote Method: Undefined validator for ${validation.validateClass.name}`);
                    return { error: "undefined validator" };
                }
                else if (!validator.validate(args[i])) {
                    console.error(`Remote Method: Failed to validate ${validation.validateClass.name} at arg index ${i} for method ${this.name}`);
                    // disconnect the client for failing their argument check
                    client.destroy();
                    return { error: "failed validation" };
                }
            }
        }
        // add any player arguments as needed
        for (let i = 0; i < this.playerParameters.length; i++) {
            let isPlayerParameter = this.playerParameters[i];
            if (isPlayerParameter) {
                args[i] = client;
            }
        }
        // make sure the client either owns the remote objecct or the remote object is communal
        if (remoteObject.isCommunal || remoteObject.owner == client) {
            return this.call.apply(remoteObject, args); // call the method
        }
    }
    // receives a request from the server to run a paticular remote method
    receiveFromServer(remoteObject, ...args) {
        // validate the arguments
        return this.call.apply(remoteObject, args);
    }
}
exports.default = RemoteMethod;
//# sourceMappingURL=remoteMethod.js.map