"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const networkBase_1 = require("./networkBase");
const network_1 = require("./network");
const serverNetwork_1 = require("./serverNetwork");
// handles the websocket connection for a ClientNetwork instance
class ClientNetworkConnection {
    constructor(network) {
        this.connectionOptions = {};
        this.ping = -1;
        this.url = "";
        this.network = network;
        this.connect("wss://bansheerubber.com:" + serverNetwork_1.ServerNetworkHost.port);
    }
    // connect to the server
    connect(url, options = {}) {
        this.url = url;
        this.connectionOptions = options;
        // create the websocket
        this.websocket = new WebSocket(url);
        this.websocket.onmessage = this.onMessage.bind(this);
        this.websocket.onopen = this.onConnected.bind(this);
        this.websocket.onclose = this.onClosed.bind(this);
        this.websocket.onerror = this.onError.bind(this);
        this.bytesReceived = 0;
    }
    // disconnect from the server
    disconnect() {
        this.websocket.close();
    }
    // called when we connect up to the server
    onConnected(event) {
        this.ping = 0;
    }
    onClosed(event) {
        this.ping = -1;
        this.url = "";
    }
    onError(error) {
    }
    onMessage(event) {
        try {
            var message = network_1.Network.parseObject(event.data);
        }
        catch (error) {
            console.error("Client Network: Failed to parse server message.", error);
        }
        // parse the command
        switch (message[0]) {
            // initialize remote object references
            // [commandID, RemoteObjectPayload[]]
            case 0: {
                let remoteObjects = message[1];
                this.network.parseRemoteObjectsInit(remoteObjects);
                break;
            }
            // handle remote methods
            // [commandID, RemoteMethodPayload]
            case 1: {
                let remoteMethod = message[1];
                this.network.executeRemoteMethod(remoteMethod);
                break;
            }
            // handle remote returns
            // [commandID, RemoteReturnPayload]
            case 2: {
                let remoteReturn = message[1];
                this.network.resolveRemoteReturn(remoteReturn.id, remoteReturn.data);
                break;
            }
            // tell the game that we own this paticular client
            case 3: {
                let remoteID = message[1];
                this.network.game.client = this.network.remoteObjects[remoteID];
                break;
            }
            // handle receiving latency
            // [commandID, latency: number]
            case 4: {
                this.ping = message[1];
                break;
            }
        }
    }
    send(commandID, payload) {
        this.websocket.send(network_1.Network.stringifyObject([commandID, payload]));
    }
}
// handles the client-sided connection with the server over websockets
class ClientNetwork extends networkBase_1.default {
    constructor(game) {
        super(game);
        this.remoteReturns = {};
        this.client = new ClientNetworkConnection(this);
    }
    // when the server sends a payload that wants us to create a bunch of objects, we will parse it here and do all the object creation here
    parseRemoteObjectsInit(payload) {
        let newObjects = [];
        for (let remoteObjectSend of payload) {
            newObjects.push(network_1.Network.parseObject(remoteObjectSend.remoteObjectString)); // parse the object properties string. this will create the object and assign them correct positions in our remoteID lists
        }
        // generate the class reference object lists before we reconstruct, so every new object has their references ready before anything is reconstructed
        for (let i in newObjects) {
            let object = newObjects[i]; // our new object
            let classReferences = payload[i].remoteObjectReferences; // the class references associated with this object
            let objectReferences = []; // the object references we will need to generate
            // go through the remoteIDs we were received and replace them with their corresponding class references
            for (let i = 0; i < classReferences.length; i++) {
                objectReferences[i] = this.game.network.remoteObjects[classReferences[i]];
            }
            this.game.network.setRemoteClassReferences(object, objectReferences); // set the class references so when we call the reconstructor the class reference creator will handle everything smoothly
        }
        // now we need to handle reconstruction. go through the objects we were sent in the order they were created in on the server and reconstruct each one
        for (let object of newObjects) {
            let remoteObject = object;
            if (!this.game.network.hasBeenReconstructed[remoteObject.remoteID]) { // only reconstruct the object if it hasn't been reconstructed before
                remoteObject.reconstructor(network_1.Network.game, ...network_1.Network.buildInstanceVariables(remoteObject.getNetworkMetadata(), remoteObject)); // call reconstructor with correct instance variables
                this.game.network.addRemoteObject(object, object.remoteID);
            }
        }
    }
    // asks the server to call a method on a paticular remote object
    requestServerMethod(objectID, methodID, args) {
        // create a promise object so we can do remote returns
        let returnID = this.remoteReturnCount;
        this.remoteReturns[returnID] = {
            object: this.remoteObjects[objectID],
            promise: new Promise((resolve, reject) => {
                this.remoteResolves[returnID] = resolve;
                this.remoteRejects[returnID] = reject;
                // have a timeout so that we cancel a remote return after a certain amount of time
                setTimeout(() => {
                    this.rejectRemoteReturn(returnID, "timeout");
                }, 5000);
            }),
        };
        // send the command to the server
        this.client.send(0, {
            objectID,
            methodID,
            returnID,
            args,
        });
        this.remoteReturnCount++;
    }
    sendRemoteReturn(id, data) {
        this.client.send(1, {
            id,
            data,
        });
    }
    // execute a remote method sent by the server
    executeRemoteMethod(payload) {
        let { objectID, methodID, returnID, args } = payload;
        if (this.remoteObjects[objectID]) {
            let object = this.remoteObjects[objectID];
            // make sure we're the client and we have an actual remote method to call in the first place
            if (this.game.isClient && object.getNetworkMetadata().remoteMethods[methodID]) {
                let data = object.getNetworkMetadata().remoteMethods[methodID].receiveFromServer(object, ...args);
                this.sendRemoteReturn(returnID, data);
            }
        }
    }
    getLastRemoteReturn() {
        return this.remoteReturns[this.remoteReturnCount - 1];
    }
}
exports.default = ClientNetwork;
//# sourceMappingURL=clientNetwork.js.map