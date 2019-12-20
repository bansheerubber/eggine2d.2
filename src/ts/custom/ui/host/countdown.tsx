import * as React from "react"
import Game from "../../../game/game"
import DinnerPartyGamemode from "../../dinnerPartyGamemode"

interface CountdownUIProperties {
	game: Game
}

interface CountdownUIState {
	time: number
	subtext: string
	mode: string
	countdown: boolean
}

export default class CountdownUI extends React.Component<CountdownUIProperties, CountdownUIState> {
	private game: Game
	private intervalID: NodeJS.Timeout
	
	constructor(props: CountdownUIProperties) {
		super(props)

		this.game = props.game

		this.state = {
			time: 0,
			subtext: "",
			mode: "",
			countdown: true,
		}

		this.intervalID = setInterval(() => {
			if(this.state.countdown) {
				this.setState({
					time: Math.max(this.state.time - 1, 0)
				})	
			}
		}, 1000)
	}

	public componentWillUnmount(): void {
		clearInterval(this.intervalID)
	}

	public render(): JSX.Element {
		let seconds = this.state.time % 60
		let timeString = Math.floor(this.state.time / 60) + ":" + (seconds >= 10 ? seconds : "0" + seconds)
		
		return <div className="countdown">
			<div>
				{timeString}
				<div>{this.state.subtext}</div>
				<button onClick={() => {
					switch(this.state.mode) {
						case "Vote Early": {
							(this.game.gamemode as DinnerPartyGamemode).voteEarly()
							break
						}
					}
				}} style={{
					display: this.state.mode ? "inline" : "none",
				}}>{this.state.mode}</button>
			</div>
		</div>
	}
}