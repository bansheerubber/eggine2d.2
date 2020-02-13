"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("./network");
// interprets commands sent by a client to the server. this class solely exists on the server
class ClientInterpreter {
    constructor(client) {
        this.client = client;
    }
    interpret(data) {
        try {
            var payload = network_1.Network.parseObject(data);
            switch (payload[0]) {
                case 0: {
                    let remoteMethod = payload[1];
                    this.client.game.network.executeRemoteMethod(remoteMethod, this.client);
                    break;
                }
                case 1: {
                    let remoteReturn = payload[1];
                    this.client.game.network.handleRemoteReturn(remoteReturn, this.client);
                    break;
                }
            }
        }
        catch (error) {
            console.log("Player: Failed to parse message", error);
            this.client.destroy();
        }
    }
}
exports.default = ClientInterpreter;
//# sourceMappingURL=clientInterpreter.js.map