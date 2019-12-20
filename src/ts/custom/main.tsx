import Game from "../game/game";
import DinnerPartyGamemode from "./dinnerPartyGamemode";
import CountdownUI from "./ui/host/countdown";
import StringToUI from "./ui/stringToUI";
import MessageUI from "./ui/host/message";
import VoteUI from "./ui/host/vote";

export default async function(game: Game) {
	if(game.isServer) {
		game.gamemode = new DinnerPartyGamemode(game)
	}
	else {
		StringToUI.registerUI("countdown", CountdownUI)
		StringToUI.registerUI("message", MessageUI)
		StringToUI.registerUI("vote", VoteUI)
	}
}