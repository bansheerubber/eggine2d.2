import Client from "../network/client";
import { gameClass, networkClass } from "../network/networkDecorators";

@networkClass()
@gameClass
export default class TestClient extends Client {

}