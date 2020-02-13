"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const remoteObject_1 = require("../../network/remoteObject");
const vector_1 = require("../../helpers/vector");
const grass_1 = require("./types/grass");
const binaryFileReader_1 = require("../../helpers/binaryFileReader");
class HexMap extends remoteObject_1.default {
    constructor() {
        super(...arguments);
        this.hexes = [];
        this.size = new vector_1.default();
    }
    // adds a hex to our map
    addHex(hex) {
        this.hexes[hex.position.unique()] = hex;
        return hex;
    }
    // removes a hex from our map
    removeHex(hex) {
        this.hexes[hex.position.unique()] = undefined;
        return hex;
    }
    *getHexes() {
        let iterator = new vector_1.default(0, 0);
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                iterator.set(x, y);
                yield this.hexes[iterator.unique()];
            }
        }
    }
    createTestMap() {
        let sizeX = 100, sizeY = 100;
        for (let x = 0; x < sizeX; x++) {
            for (let y = 0; y < sizeY; y++) {
                let hex = new grass_1.default(this.game);
                hex.setPosition(hex.position.set(x, y));
            }
        }
        this.size.set(sizeX, sizeY);
    }
    static registerHexClass(id, classReference) {
        this.hexIdToClass[id] = classReference;
    }
    createHex(id, x, y) {
        let hex = new HexMap.hexIdToClass[id](this.game);
        hex.setPosition(hex.position.set(x, y));
        this.addHex(hex);
        return hex;
    }
    async loadMap(resource) {
        return new Promise((resolve, reject) => {
            let file = new binaryFileReader_1.default(resource);
            file.readFile().then((bytes) => {
                let width = file.readInt();
                let height = file.readInt();
                this.size.set(width, height);
                let index = 0;
                let hexCount = 0;
                while (!file.isEOF()) {
                    let hexId = file.readByte();
                    let x = index % width;
                    let y = Math.floor(index / width);
                    this.createHex(hexId, x, y);
                    hexCount++;
                    index++;
                }
                console.log(`${hexCount} hexes loaded`);
                resolve();
            });
        });
    }
}
HexMap.hexIdToClass = [];
exports.default = HexMap;
//# sourceMappingURL=hexMap.js.map