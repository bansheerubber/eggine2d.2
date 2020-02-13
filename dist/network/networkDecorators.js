"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const extensionTree_1 = require("../game/extensionTree");
const network_1 = require("./network");
// registers a class as a game class, allows us to look up their inheritance tree
function gameClass(classReference) {
    let parentClass = Object.getPrototypeOf(classReference);
    if (parentClass.name) {
        extensionTree_1.default.addExtendedClass(parentClass, classReference);
    }
    let returnClass = class extends classReference {
        constructor(...args) {
            super(...args);
            this.c = classReference.name;
            if (this.reconstructor && this.c == this.constructor.name) {
                this.reconstructor.apply(this, args);
            }
        }
    };
    Object.defineProperty(returnClass, "name", {
        writable: true,
    });
    returnClass.name = classReference.name;
    Object.defineProperty(returnClass, "name", {
        writable: false,
    });
    return returnClass;
}
exports.gameClass = gameClass;
// marks this class as a network class
function networkClass(...args) {
    return (classReference) => {
        network_1.Network.registerRemoteObject(classReference, ...args).inheritEverything();
    };
}
exports.networkClass = networkClass;
// marks this class as a validator class
function validator(targetClass) {
    return (classReference) => {
        setTimeout(() => {
            network_1.Network.registerValidator(classReference, targetClass);
        }, 1);
    };
}
exports.validator = validator;
// marks a class property as illegal for network recreation/sending
function illegal(classReference, key) {
    network_1.Network.registerRemoteObject(classReference.constructor).addIllegalProperty(key);
}
exports.illegal = illegal;
function addValidators(classReference, methodName) {
    let remoteMethod = network_1.Network.registerRemoteObject(classReference.constructor).addRemoteMethod(classReference[methodName]);
    let types = Reflect.getMetadata("design:paramtypes", classReference, methodName);
    for (let i = 0; i < types.length; i++) {
        remoteMethod.addValidatedParameter(i, types[i]);
    }
    remoteMethod.addValidatedReturn(Reflect.getMetadata("design:returntype", classReference, methodName));
    return remoteMethod;
}
// tells the remote method that the recipient is the client. if callOnServer is true, that means we will request the client to call this method and also call it on our server
function client(callOnServer = false, onlyCallOnOwner = false) {
    return function (classReference, methodName, descriptor) {
        // add validators to the remote method
        let remoteMethod = addValidators(classReference, methodName);
        remoteMethod.isClientMethod = true;
        remoteMethod.isInstantCall = callOnServer;
        descriptor.value = function (...args) {
            remoteMethod.requestToClients(this, onlyCallOnOwner, ...args);
        };
    };
}
exports.client = client;
// tells the remote method that the recipient is the server. if callOnClient is true, that means we will request the server to call this method and also call it on our client
function server(callOnClient = false) {
    return function (classReference, methodName, descriptor) {
        // add validators to the remote method
        let remoteMethod = addValidators(classReference, methodName);
        remoteMethod.isServerMethod = true;
        remoteMethod.isInstantCall = callOnClient;
        descriptor.value = function (...args) {
            remoteMethod.requestToServer(this, ...args);
            return "frog";
        };
    };
}
exports.server = server;
// tells the remote method to not validate this paramater
function novalidate(classReference, methodName, parameterIndex) {
    // holy shit this is long. first, make sure the networkMetadata object is created. next, make sure the remote method is created. last, remove the validated paramater
    network_1.Network.registerRemoteObject(classReference.constructor).addRemoteMethod(classReference[methodName]).addValidatedParameter(parameterIndex, undefined);
}
exports.novalidate = novalidate;
// tells the remote method that the argument at this index should be supplied with the value of the client who invoked it. also, does not validate this parameter
function player(classReference, methodName, parameterIndex) {
    network_1.Network.registerRemoteObject(classReference.constructor).addRemoteMethod(classReference[methodName]).addPlayerParameter(parameterIndex);
    network_1.Network.registerRemoteObject(classReference.constructor).addRemoteMethod(classReference[methodName]).addValidatedParameter(parameterIndex, undefined);
}
exports.player = player;
//# sourceMappingURL=networkDecorators.js.map