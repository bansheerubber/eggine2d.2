import * as React from "react"

interface MessageUIState {
	message: string
}

export default class MessageUI extends React.Component<{}, MessageUIState> {
	constructor(props: any) {
		super(props)
		this.state = {
			message: ""
		}
	}

	public render(): JSX.Element {
		return <div className="message">
			<div>
				{this.state.message}
			</div>
		</div>
	}
}