"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const remoteMethod_1 = require("./remoteMethod");
const extensionTree_1 = require("../game/extensionTree");
const network_1 = require("./network");
// holds the metadata for a paticular NetworkObject derived class
class NetworkMetadata {
    constructor(classReference, ...args) {
        this.constructorArgumentNames = [];
        this.illegalProperties = ["owner", "isCommunal", "game", "gameObjectOptions"];
        this.remoteMethods = [];
        this.classReference = classReference;
        this.className = classReference.name;
        this.constructorArgumentNames = args;
    }
    // inherits all networkMetadata things from parent classes
    inheritEverything() {
        // inherit all the illegal properties from parent classes
        let leaf = extensionTree_1.default.getLeaf(this.classReference);
        if (leaf) {
            for (let parentClass of leaf.parents()) {
                let parentNetworkMetadata = network_1.Network.classToMetadata(parentClass.getClassReference());
                // go through parent metadata and inherit all illegal properties and remote methods
                if (parentNetworkMetadata) {
                    this.illegalProperties = this.illegalProperties.concat(parentNetworkMetadata.illegalProperties);
                    // copy the remote methods over
                    for (let remoteMethod of parentNetworkMetadata.remoteMethods) {
                        this.remoteMethods.push(new remoteMethod_1.default(this, remoteMethod.call));
                    }
                    // recalculate remote method id's
                    for (let remoteMethod of this.remoteMethods) {
                        remoteMethod.recalculateIndex();
                    }
                }
            }
        }
    }
    addIllegalProperty(key) {
        this.illegalProperties.push(key);
    }
    addRemoteMethod(call) {
        let remoteMethod;
        if ((remoteMethod = this.getRemoteMethod(call)) == undefined) {
            remoteMethod = new remoteMethod_1.default(this, call);
        }
        return remoteMethod;
    }
    getRemoteMethod(call) {
        for (let remoteMethod of this.remoteMethods) {
            if (remoteMethod.call == call) {
                return remoteMethod;
            }
        }
        return undefined;
    }
    // returns if property is illegal or not
    isIllegalProperty(key) {
        for (let property of this.illegalProperties) {
            if (property == key) {
                return true;
            }
        }
        return false;
    }
}
exports.default = NetworkMetadata;
//# sourceMappingURL=networkMetadata.js.map