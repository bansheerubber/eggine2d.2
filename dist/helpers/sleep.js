"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds);
    });
}
exports.default = sleep;
//# sourceMappingURL=sleep.js.map