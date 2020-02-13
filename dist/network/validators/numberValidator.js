"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const networkDecorators_1 = require("../networkDecorators");
const validator_1 = require("./validator");
let NumberValidator = class NumberValidator extends validator_1.default {
    static validate(value) {
        if (typeof value == "number" || value == undefined) {
            return true;
        }
        else {
            return false;
        }
    }
};
NumberValidator = __decorate([
    networkDecorators_1.validator(Number)
], NumberValidator);
exports.default = NumberValidator;
//# sourceMappingURL=numberValidator.js.map