"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const networkBase_1 = require("./networkBase");
const network_1 = require("./network");
const fs = require("fs");
const scheduler_1 = require("../game/scheduler");
const client_1 = require("./client");
const remoteMethod_1 = require("./remoteMethod");
const ws = require("ws");
const https = require("https");
// handles the ws server
class ServerNetworkHost {
    constructor(network) {
        this.publicIP = "N/A";
        this.isSecure = false;
        this.network = network;
        this.listen(ServerNetworkHost.port, "/etc/letsencrypt/live/bansheerubber.com/fullchain.pem", "/etc/letsencrypt/live/bansheerubber.com/privkey.pem");
    }
    listen(port, certificatePath, keyPath) {
        // if we have valid certification info, then construct partial options
        if (certificatePath && fs.existsSync(certificatePath) // make sure certificate path exists
            && keyPath && fs.existsSync(keyPath)) { // make sure key path exists
            // create a https server with the different certificates
            const httpsServer = new https.createServer({
                cert: fs.readFileSync(certificatePath),
                key: fs.readFileSync(keyPath),
            });
            var partialOptions = {
                server: httpsServer
            };
            httpsServer.listen(port);
            this.isSecure = true;
            console.log("Secure server is being hosted.");
        }
        else {
            if (certificatePath || keyPath) {
                scheduler_1.default.schedule(100, console.error, `Could not find certificate or key files at "${certificatePath}" or "${keyPath}"`);
            }
            var partialOptions = {
                port: port,
                server: true
            };
            this.isSecure = false;
        }
        // combine the partial options into a big option list, then create the server with said options
        let options = Object.assign({
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 9,
                    level: 9
                },
                zlibInflateOptions: {
                    chunkSize: 15 * 1024
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 15,
                concurrencyLimit: 10,
                threshold: 64 // Size (in bytes) below which messages should not be compressed
            }
        }, partialOptions);
        this.server = new ws.Server(options);
        console.log(`Server listening on port ${port}...`);
        // handle a connection
        this.server.on("connection", (connection, request) => {
            // new Client(this.network.game, connection, request)
            this.network.game.gamemode.createClientClass(this.network.game, connection, request);
        });
        this.server.on("error", (error) => {
            console.log("connection error", error);
        });
    }
}
ServerNetworkHost.port = 8329;
exports.ServerNetworkHost = ServerNetworkHost;
// handles the server-sided connection with clients via the websocket
class ServerNetwork extends networkBase_1.default {
    constructor(game) {
        super(game);
        this.remoteReturns = {};
        this.remoteReturnCollections = {};
        this.remoteReturnCollectionCount = 0;
        this.host = new ServerNetworkHost(this);
    }
    // generates the remote objects init command, which when parsed by the client will recreate all the remote objects we have here on the server
    generateRemoteObjectsInit() {
        let array = []; // create an array of objects we will sent
        for (let remoteObject of this.remoteObjectsSet.values()) { // go through all of our remote objects
            let remoteObjectReferences = [];
            let temp;
            if ((temp = this.getRemoteClassReferences(remoteObject))) { // get the class references of a paticular object, and create a new array that holds all their remoteIDs
                for (let remoteObject of temp) {
                    remoteObjectReferences.push(remoteObject.remoteID);
                }
            }
            // once everything is completed, stringify the object and put it with its class references
            array.push({
                remoteObjectString: network_1.Network.stringifyObject(remoteObject, true),
                remoteObjectReferences: remoteObjectReferences
            });
        }
        // return the final payload
        return array;
    }
    sendRemoteObjectToClients(remoteObject) {
        for (let client of this.clients.values()) {
            let remoteObjectReferences = [];
            let temp;
            if ((temp = this.getRemoteClassReferences(remoteObject))) { // get the class references of a paticular object, and create a new array that holds all their remoteIDs
                for (let remoteObject of temp) {
                    remoteObjectReferences.push(remoteObject.remoteID);
                }
            }
            // once everything is completed, stringify the object and put it with its class references
            client.sendRemoteObject({
                remoteObjectString: network_1.Network.stringifyObject(remoteObject, true),
                remoteObjectReferences: remoteObjectReferences
            });
        }
    }
    createRemoteReturn(collection, objectID, client) {
        let object = this.remoteObjects[objectID];
        let returnID = this.remoteReturnCount;
        this.remoteReturns[returnID] = {
            client,
            collection,
            object,
            promise: new Promise((resolve, reject) => {
                this.remoteResolves[returnID] = (value) => {
                    // make sure the value is correctly validated
                    let remoteMethod = this.remoteObjects[objectID].getNetworkMetadata().remoteMethods[collection.methodID];
                    let validator = network_1.Network.validators.get(remoteMethod.validatedReturn);
                    if (validator != undefined) {
                        let validated = validator.validate(value);
                        // reject if we do not have a properly validated return
                        if (validated == false) {
                            console.error(`Remote Return: Failed to validate a return ${remoteMethod.validatedReturn.name} for method ${remoteMethod.name}`);
                            client.destroy();
                            return reject({
                                client,
                                error: "unvalidated",
                            });
                        }
                    }
                    // tell the collection we've resolved this
                    collection.resolveRemoteReturn({
                        client,
                        value,
                    });
                    // resolve the value
                    resolve({
                        client,
                        value,
                    });
                };
                this.remoteRejects[returnID] = (error) => {
                    // tell the collection we've rejected
                    collection.rejectRemoteReturn({
                        client,
                        error,
                    });
                    // reject the value
                    reject({
                        client,
                        error,
                    });
                };
                setTimeout(() => {
                    this.rejectRemoteReturn(returnID, "timeout");
                }, 2000);
            }),
        };
        this.remoteReturns[returnID].promise.catch((error) => {
            console.error(`Remote return error: ${error}`);
        });
        this.remoteReturnCount++;
        return returnID;
    }
    requestClientMethod(remoteObject, objectID, methodID, onlyCallOnOwner, args) {
        if (onlyCallOnOwner == false) {
            var collection = new remoteMethod_1.ServerRemoteReturnCollection(this, this.remoteReturnCollectionCount, methodID, this.clients.size); // create a promise object so we can do remote returns
            for (let client of this.clients.values()) {
                let returnID = this.createRemoteReturn(collection, objectID, client);
                client.sendRemoteMethod(objectID, methodID, returnID, args);
            }
        }
        else { // only call the method on the owner of the object
            var collection = new remoteMethod_1.ServerRemoteReturnCollection(this, this.remoteReturnCollectionCount, methodID, 1); // create a promise object so we can do remote returns
            let client = remoteObject.owner;
            if (client instanceof client_1.default) {
                let returnID = this.createRemoteReturn(collection, objectID, client);
                client.sendRemoteMethod(objectID, methodID, returnID, args);
            }
        }
        this.remoteReturnCollections[this.remoteReturnCollectionCount] = collection;
        this.remoteReturnCollectionCount++;
    }
    // executes a remote method on the server side
    executeRemoteMethod(payload, client) {
        let { objectID, methodID, returnID, args, } = payload;
        if (this.remoteObjects[objectID]) {
            let object = this.remoteObjects[objectID];
            // make sure we're the server and we have an actual remote method to call in the first place
            if (this.game.isServer && object.getNetworkMetadata().remoteMethods[methodID]) {
                let data = object.getNetworkMetadata().remoteMethods[methodID].receiveFromClient(object, client, ...args);
                client.sendRemoteReturn(returnID, data);
            }
        }
    }
    handleRemoteReturn(payload, client) {
        let remoteReturn = this.remoteReturns[payload.id];
        if (remoteReturn && remoteReturn.client == client && (remoteReturn.object.isCommunal || remoteReturn.object.owner == client)) {
            this.resolveRemoteReturn(payload.id, payload.data);
        }
    }
    getLastRemoteReturns() {
        return this.remoteReturnCollections[this.remoteReturnCollectionCount - 1];
    }
}
exports.default = ServerNetwork;
//# sourceMappingURL=serverNetwork.js.map