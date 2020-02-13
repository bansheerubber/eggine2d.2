"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameObject_1 = require("../game/gameObject");
const network_1 = require("./network");
// classes that need to communicate over the network inherits from this object
class RemoteObject extends gameObject_1.default {
    constructor(game, gameObjectOptions) {
        super(game, gameObjectOptions);
        this.isCommunal = false;
        this.remoteID = -1;
        Object.assign(this);
        if (this.game.isServer) {
            this.game.network.addRemoteObject(this);
            setTimeout(() => {
                this.game.network.sendRemoteObjectToClients(this);
            }, 1);
        }
    }
    // called when the constructor is called. however, when recreating a remote object from network information, we do not call the constructor and instead call only this.
    reconstructor(game, ...args) {
        this.game = game;
        this.game.network.hasBeenReconstructed[this.remoteID] = true;
    }
    getNetworkMetadata() {
        return network_1.Network.classToMetadata(this.constructor);
    }
    // returns the last remote return created by our network
    getRemoteReturn() {
        return this.game.network.getLastRemoteReturn().promise;
    }
    // gets the last remote returns created by the server network
    getRemoteReturns() {
        return this.game.network.getLastRemoteReturns().promise;
    }
    destroy() {
        super.destroy();
        this.game.network.removeRemoteObject(this);
    }
}
exports.default = RemoteObject;
//# sourceMappingURL=remoteObject.js.map