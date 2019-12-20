import * as React from "react"
import * as ReactDOM from "react-dom"
import Game from "../../game/game"

export default class StringToUI {
	public static table: { [key: string]: typeof React.Component } = {}
	
	public static registerUI(name: string, uiClass: typeof React.Component) {
		this.table[name] = uiClass
	}

	public static renderUI(name: string, game: Game): React.Component {
		let Variable = this.table[name]
		return ReactDOM.render(<Variable game={game}></Variable>, document.getElementById("reactContainer")) as unknown as React.Component
	}
}