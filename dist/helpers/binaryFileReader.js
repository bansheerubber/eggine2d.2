"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pako = require("pako");
const fs = require("fs");
class BinaryFileReader {
    constructor(fileName) {
        this.fileName = "";
        this.fileName = fileName;
    }
    // reads file using fs or XMLHttpRequest based on client or not
    async readFile() {
        return new Promise((resolve, reject) => {
            if (fs) {
                fs.readFile(this.fileName, (error, data) => {
                    if (!error) {
                        this.bytes = new Uint8Array(data);
                        // read the first byte to determine compression level (supports levels 0-9. if the first byte == 10, that means there's no compression
                        let firstByte = this.bytes[0];
                        this.bytes = this.bytes.slice(1, this.bytes.length);
                        if (firstByte <= 9) {
                            this.bytes = pako.inflate(this.bytes);
                        }
                        this.byteIndex = 0;
                        resolve(this.bytes);
                    }
                    else {
                        reject(error);
                    }
                });
            }
            else {
                let request = new XMLHttpRequest();
                request.open("GET", this.fileName, true);
                request.responseType = "blob";
                request.onload = (event) => {
                    let fileReader = new FileReader();
                    fileReader.addEventListener("loadend", () => {
                        let arrayBuffer = fileReader.result;
                        this.bytes = new Uint8Array(arrayBuffer);
                        // read the first byte to determine compression level (supports levels 0-9. if the first byte == 10, that means there's no compression
                        let firstByte = this.bytes[0];
                        this.bytes = this.bytes.slice(1, this.bytes.length);
                        if (firstByte <= 9) {
                            this.bytes = pako.inflate(this.bytes);
                        }
                        this.byteIndex = 0;
                        resolve(this.bytes);
                    });
                    fileReader.readAsArrayBuffer(request.response);
                };
                request.send();
            }
        });
    }
    // if we're at the end of the file or not
    isEOF() {
        if (this.byteIndex >= this.bytes.length) {
            return true;
        }
        else {
            return false;
        }
    }
    // reads a byte from our data
    readByte() {
        if (!this.isEOF()) {
            this.byteIndex++;
            return this.bytes[this.byteIndex - 1];
        }
        else {
            return undefined;
        }
    }
    // reads an int from the bytes
    readInt() {
        if (!this.isEOF()) {
            this.byteIndex += 4;
            return this.bytes[this.byteIndex - 4] << 24 | this.bytes[this.byteIndex - 3] << 16 | this.bytes[this.byteIndex - 2] << 8 | this.bytes[this.byteIndex - 1];
        }
        else {
            return undefined;
        }
    }
    // reads x amount of bytes into a new array
    readBytesIntoArray(amount) {
        let array = [];
        for (let i = 0; i < amount; i++) {
            array.push(this.readByte());
        }
        return array;
    }
    // reads a character from our bytes array
    readChar() {
        return String.fromCharCode(this.readByte());
    }
    // reads the first int, and treats that as a string length. reads that many bytes forwards to construct a string
    readString() {
        let length = this.readInt();
        let output = "";
        for (let i = 0; i < length; i++) {
            output += this.readChar();
        }
        return output;
    }
}
exports.default = BinaryFileReader;
//# sourceMappingURL=binaryFileReader.js.map