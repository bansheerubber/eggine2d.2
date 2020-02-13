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
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
const remoteObject_1 = require("../network/remoteObject");
const networkDecorators_1 = require("../network/networkDecorators");
let Gamemode = class Gamemode extends remoteObject_1.default {
    constructor(game) {
        super(game);
    }
    reconstructor(game) {
        super.reconstructor(game);
        this.game.gamemode = this;
    }
    createClientClass(game, websocket, request) {
        return new this.clientClass(game, websocket, request);
    }
};
__decorate([
    networkDecorators_1.illegal,
    __metadata("design:type", Object)
], Gamemode.prototype, "clientClass", void 0);
Gamemode = __decorate([
    networkDecorators_1.networkClass(),
    networkDecorators_1.gameClass,
    __metadata("design:paramtypes", [game_1.default])
], Gamemode);
exports.default = Gamemode;
//# sourceMappingURL=gamemode.js.map