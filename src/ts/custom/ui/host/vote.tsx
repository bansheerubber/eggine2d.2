import * as React from "react"
import DinnerPartyGamemode from "../../dinnerPartyGamemode"
import Game from "../../../game/game"

interface VoteUIProperties {
	game: Game
}

interface VoteUIState {
	names: string[]
}

export default class VoteUI extends React.Component<VoteUIProperties, VoteUIState> {
	public game: Game
	public selectValue: string = "Nobody"
	
	
	constructor(props: any) {
		super(props)

		this.game = props.game

		this.state = {
			names: []
		}
	}

	public render(): JSX.Element {
		let options: JSX.Element[] = []
		for(let name of this.state.names) {
			options.push(<option key={options.length} value={name}>{name}</option>)
		}
		
		return <div className="message">
			<div>
				<select onChange={(event) => {
					this.selectValue = event.target.value
				}}>
					{options}
				</select>

				<button onClick={() => {
					(this.game.gamemode as DinnerPartyGamemode).voteToKill(this.selectValue)
				}} style={{
					width: 400,
					display: "block",
					margin: "auto",
				}}>Poison</button>
			</div>
		</div>
	}
}