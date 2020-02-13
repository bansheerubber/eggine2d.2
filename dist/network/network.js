"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const networkMetadata_1 = require("./networkMetadata");
const remoteObject_1 = require("./remoteObject");
const gameObject_1 = require("../game/gameObject");
const util_1 = require("util");
const numberValidator_1 = require("./validators/numberValidator");
const stringValidator_1 = require("./validators/stringValidator");
class Network {
    static setGame(game) {
        this.game = game;
    }
    // blank function that just loads the modules up correctly
    static loadValidator(validator) {
    }
    static registerValidator(validator, targetClass) {
        this.validators.set(targetClass, validator);
    }
    // stringifies an object into a network safe string
    static stringifyObject(object, ignoreFirstRemoteification = false) {
        try {
            return JSON.stringify(this.convertObject(object, ignoreFirstRemoteification));
        }
        catch (error) {
            console.error(`Network: Failed to stingify object ${object.constructor.name}`, error);
            return undefined;
        }
    }
    // parse a network safe string and converts it into a real object
    static parseObject(input) {
        try {
            return this.deConvertObject(JSON.parse(input));
        }
        catch (error) {
            console.error("Network: Failed to parse object.", error);
            return undefined;
        }
    }
    // recursively converts an object to something that can acceptably be sent over the network. if ignoreFirstRemoteification is true, then we send all properties on a remote object (only for the first iteration). if false, we only send the classname and RID
    static convertObject(object, ignoreFirstRemoteification = false) {
        // handle objects differently than primitives
        if (typeof object == "object" && !util_1.isNull(object) && typeof object != "undefined") {
            if (Array.isArray(object)) {
                var replacementObject = [];
            }
            else {
                var replacementObject = {};
            }
            if (object instanceof remoteObject_1.default) {
                var networkMetadata = object.getNetworkMetadata(); // get the network data if this is a remote object, handle for later
                // if we choose to turn this remoteObject into an RID reference object, then do it
                if (!ignoreFirstRemoteification) {
                    replacementObject.__RID__ = object.remoteID;
                    return replacementObject;
                }
            }
            if (object.c) {
                replacementObject.__ClassName__ = object.c; // add its classname to the final object
            }
            else if (object.constructor.name != "Object") {
                replacementObject.__ClassName__ = object.constructor.name;
            }
            // loop through all the object's properties
            for (let i of Object.getOwnPropertyNames(object)) {
                if (networkMetadata) {
                    if (!networkMetadata.isIllegalProperty(i)) { // only copy over legal properties
                        replacementObject[i] = this.convertObject(object[i]);
                    }
                }
                else { // if this object is not a remote object, do not check to see if it has illegal properties
                    replacementObject[i] = this.convertObject(object[i]);
                }
            }
            return replacementObject; // return the object, which is now ready to be sent over the network
        }
        // if we have a primitive, then we don't even modify it
        else {
            return object;
        }
    }
    // recursively deconvert an object received over thet network
    static deConvertObject(object) {
        let object2 = object;
        // recursively handle objects
        if (typeof object2 == "object") {
            // if we have an RID, then lookup the object with that RID and return it
            if (object2.__RID__) {
                let remoteObject = this.game.network.remoteObjects[object2.__RID__];
                if (remoteObject) {
                    return remoteObject;
                }
                // if the remote object doesn't exist, then add a stub object that we can change later
                else {
                    let stub = this.setStubObject(object2.__RID__);
                    this.game.network.addRemoteObject(stub, object2.__RID__); // add them to the remote objects list
                    return stub;
                }
            }
            // if they have a remote ID, then add them to the remote objects list
            if (object2.remoteID) {
                this.game.network.addRemoteObject(object2, object2.remoteID);
            }
            // check to see if this object has a stub object. if so, then that becomes our newObject
            // stub objects replace objects that hold the RID of an object. the same stub object is used between different properties that refer to the same remoteObject, so when the stub object is deconverted later the changes made to it in here are reflected upon all property values
            let newObject = {};
            if (this.stubObjects[object2.remoteID]) {
                newObject = this.stubObjects[object2.remoteID];
                var isStubObject = true;
            }
            let networkMetadata = this.nameToMetadata(object2.__ClassName__); // get the network metadata so we can get the class reference based on the classname of the object
            if (object2.__ClassName__) { // if we have a classname, recreate that object (without calling the constructor)
                if (object2.__ClassName__ == "Array") { // special case for array, manually create an array object for this
                    newObject = [];
                }
                else if (networkMetadata) {
                    if (isStubObject) { // we have to do this creation process differntly if we have found a stub object. fuck
                        Object.setPrototypeOf(newObject, networkMetadata.classReference.prototype);
                        // once we have created a stub object, delete the stub object metadata slot
                        delete newObject.__stub__;
                    }
                    else {
                        newObject = Object.create(networkMetadata.classReference.prototype); // create a new object with the same prototype as the class we received without calling its constructor
                    }
                    var classReference = networkMetadata.classReference;
                }
                else {
                    console.error("INVALID CLASSNAME", object2.__ClassName__);
                }
            }
            else if (Array.isArray(object2)) { // if we're an array, do something funky
                newObject = [];
            }
            // go through the received object properties and deconvert those
            for (let i of Object.getOwnPropertyNames(object2)) {
                if (classReference) { // if we have a class reference, pull out the descriptor for the property we're looking at and determine if we can write to it or not
                    var descriptor = Object.getOwnPropertyDescriptor(classReference, i);
                }
                // make sure the property isn't eggine metadata and make sure we can write to this property
                if (!this.metadataNames[i] && ((descriptor && descriptor.writable) || !descriptor)) {
                    newObject[i] = this.deConvertObject(object2[i]);
                }
            }
            return newObject;
        }
        else {
            return object2;
        }
    }
    // registers a remote object class with our metadata system
    static registerRemoteObject(networkClass, ...constructorArgumentNames) {
        let networkMetadata;
        if (!(networkMetadata = this.classToMetadata(networkClass))) { // if we do not have a class reference made already, then create one
            networkMetadata = new networkMetadata_1.default(networkClass, ...constructorArgumentNames);
            this.networkMetadata.push(networkMetadata);
        }
        else { // if it is already created, then update the constructor arguments
            networkMetadata.constructorArgumentNames = constructorArgumentNames;
        }
        return networkMetadata;
    }
    // builds the instance variables of a remote object based on network received properties. these variables are then used to construct/reconstruct the object
    static buildInstanceVariables(networkMetadata, objectProperties) {
        let output = [];
        for (let argument of networkMetadata.constructorArgumentNames) {
            if (argument == "%[GameObject: game]") {
                output.push(this.game);
            }
            else {
                output.push(objectProperties[argument]);
            }
        }
        return output;
    }
    // returns a NetworkMetadata object that is assigned to the coresponding class name
    static nameToMetadata(className) {
        for (let networkMetadata of this.networkMetadata) {
            if (networkMetadata.className == className) {
                return networkMetadata;
            }
        }
        return undefined;
    }
    // looks up a class reference and returns its metadata
    static classToMetadata(classReference) {
        return this.nameToMetadata(classReference.name);
    }
    // creates a stub object whose properties we will modify as soon as we receive information about it
    static setStubObject(remoteID) {
        if (!this.stubObjects[remoteID]) {
            this.stubObjects[remoteID] = {
                __stub__: remoteID
            };
        }
        return this.stubObjects[remoteID];
    }
    // creates a remote class reference, which is used to make networking less complex
    static createRemoteClass(ownerObject, position, remoteClass, ...args) {
        // if we find a class reference at the position, then return that reference
        if (this.game.network.remoteClassReferences[ownerObject.remoteID] && this.game.network.remoteClassReferences[ownerObject.remoteID][position]) {
            let object = this.game.network.remoteClassReferences[ownerObject.remoteID][position];
            object.reconstructor(this.game, ...this.buildInstanceVariables(this.classToMetadata(remoteClass), object)); // call the reconstructor with correct instance variables
            return object;
        }
        else { // if we do not find a class reference at the position, then create a new reference
            let remoteObject = new remoteClass(...args);
            this.game.network.addRemoteClassReference(ownerObject, remoteObject, position);
            return remoteObject;
        }
    }
}
Network.networkMetadata = [];
Network.stubObjects = {};
Network.validators = new Map();
Network.metadataNames = {
    "%[SendObject: __ClassName__]": true,
    "%[StubObject: __stub__]": true,
    "%[RemoteObject: owner]": true,
    "%[RemoteObject: isCommunal]": true,
};
exports.Network = Network;
// register GameObject n shit, b/c we can't do it with decorators because of import conflicts
Network.registerRemoteObject(gameObject_1.default, "%[GameObject: game]");
Network.classToMetadata(gameObject_1.default).addIllegalProperty("%[GameObject: game]");
Network.classToMetadata(gameObject_1.default).addIllegalProperty("%[GameObject: gameObjectOptions]");
Network.loadValidator(numberValidator_1.default);
Network.loadValidator(stringValidator_1.default);
//# sourceMappingURL=network.js.map