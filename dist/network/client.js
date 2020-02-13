"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Client_1;
Object.defineProperty(exports, "__esModule", { value: true });
const remoteObject_1 = require("./remoteObject");
const game_1 = require("../game/game");
const networkDecorators_1 = require("./networkDecorators");
const clientInterpreter_1 = require("./clientInterpreter");
const network_1 = require("./network");
// represents a connection that may send various network commands to objects in our server/client scene
let Client = Client_1 = class Client extends remoteObject_1.default {
    constructor(game, websocket, request) {
        super(game);
        this.interpreter = new clientInterpreter_1.default(this);
        this.ping = 0;
        this.lastPing = 0;
        this.lastActive = 0;
        this.canSend = false;
        if (websocket && request) {
            this.websocket = websocket;
            this.ip = request.connection.remoteAddress;
            console.log(`${this.ip} has joined`);
            this.websocket.on("close", () => {
                console.log(`${this.ip} has left`);
                this.destroy();
            });
            this.websocket.on("message", (data) => {
                this.interpreter.interpret(data);
                this.lastActive = performance.now();
            });
            this.websocket.on("pong", () => {
                this.ping = Math.ceil((performance.now() - this.lastPing)) / 2;
                this.lastActive = performance.now();
                this.send(4, this.ping);
            });
            // send all remote objects to the client
            setTimeout(() => {
                this.canSend = true;
                this.send(0, this.game.network.generateRemoteObjectsInit());
            }, 1);
        }
    }
    tick(deltaTime) {
        super.tick(deltaTime);
        // ping every x seconds
        let time = performance.now();
        if (time - this.lastPing > Client_1.pingTime) {
            this.websocket.ping();
            this.lastPing = time;
        }
    }
    reconstructor(game) {
        super.reconstructor(game);
        this.game.network.clients.add(this);
        this.owner = this;
        if (this.game.isServer) {
            setTimeout(() => {
                this.send(3, this.remoteID);
            }, 33);
        }
    }
    send(commandID, payload) {
        if (this.websocket.readyState == 1 && this.canSend) {
            let data = network_1.Network.stringifyObject([commandID, payload]);
            this.websocket.send(data);
        }
    }
    sendRemoteObject(remoteObject) {
        this.send(0, [remoteObject]);
    }
    sendRemoteReturn(id, data) {
        this.send(2, {
            id,
            data
        });
    }
    sendRemoteMethod(objectID, methodID, returnID, args) {
        this.send(1, {
            objectID,
            methodID,
            returnID,
            args,
        });
    }
    destroy() {
        super.destroy();
        this.game.network.clients.delete(this);
        // disconnect the client form the server
        this.websocket.close();
    }
    getLastActive() {
        return this.lastActive;
    }
};
Client.pingTime = 100;
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", Object)
], Client.prototype, "websocket", void 0);
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", String)
], Client.prototype, "ip", void 0);
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", clientInterpreter_1.default)
], Client.prototype, "interpreter", void 0);
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", Number)
], Client.prototype, "ping", void 0);
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", Number)
], Client.prototype, "lastPing", void 0);
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", Number)
], Client.prototype, "lastActive", void 0);
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", Boolean)
], Client.prototype, "canSend", void 0);
Client = Client_1 = __decorate([
    networkDecorators_1.networkClass(),
    networkDecorators_1.gameClass,
    __metadata("design:paramtypes", [game_1.default, Object, Object])
], Client);
exports.default = Client;
//# sourceMappingURL=client.js.map