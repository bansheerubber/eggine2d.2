"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// base class for the server/client network classes, has some abstract functions
class NetworkBase {
    constructor(game) {
        this.remoteObjects = {};
        this.remoteObjectsSet = new Set();
        this.remoteClassReferences = {};
        this.hasBeenReconstructed = {};
        this.clients = new Set();
        this.remoteReturns = {};
        this.remoteReturnCount = 0;
        this.remoteResolves = {};
        this.remoteRejects = {};
        this.nextRemoteID = 0;
        this.game = game;
    }
    addRemoteObject(remoteObject, customRemoteID) {
        if (customRemoteID && this.remoteObjects[customRemoteID]) {
            this.removeRemoteObject(this.remoteObjects[customRemoteID]);
        }
        let remoteID = customRemoteID != undefined ? customRemoteID : this.nextRemoteID;
        this.remoteObjects[remoteID] = remoteObject;
        remoteObject.remoteID = remoteID;
        if (customRemoteID == undefined) {
            this.nextRemoteID++;
        }
        this.remoteObjectsSet.add(remoteObject);
    }
    removeRemoteObject(remoteObject) {
        delete this.remoteObjects[remoteObject.remoteID];
        this.remoteObjectsSet.delete(remoteObject);
    }
    setRemoteClassReferences(ownerObject, array) {
        this.remoteClassReferences[ownerObject.remoteID] = array;
    }
    addRemoteClassReference(ownerObject, otherObject, position) {
        if (!this.getRemoteClassReferences(ownerObject)) {
            this.remoteClassReferences[ownerObject.remoteID] = [];
        }
        this.remoteClassReferences[ownerObject.remoteID][position] = otherObject;
    }
    getRemoteClassReferences(ownerObject) {
        return this.remoteClassReferences[ownerObject.remoteID];
    }
    resolveRemoteReturn(returnID, data) {
        if (this.remoteResolves[returnID]) {
            this.remoteResolves[returnID](data);
            // cleanup the various data structures we shat the promise into
            this.remoteResolves[returnID] = undefined;
            this.remoteRejects[returnID] = undefined;
            this.remoteReturns[returnID] = undefined;
        }
    }
    rejectRemoteReturn(returnID, reason) {
        if (this.remoteRejects[returnID]) {
            this.remoteRejects[returnID](reason);
            // cleanup the various data structures we shat the promise into
            this.remoteResolves[returnID] = undefined;
            this.remoteRejects[returnID] = undefined;
            this.remoteReturns[returnID] = undefined;
        }
    }
}
exports.default = NetworkBase;
//# sourceMappingURL=networkBase.js.map