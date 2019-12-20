import * as React from "react"
import EditorProperties from "./editorProperties";
import EditorState from "./editorState";
import Range from "../../helpers/range";

export default class TextBox extends React.Component<EditorProperties, EditorState> {
	public randomName: string = ""
	
	
	
	constructor(properties: EditorProperties) {
		super(properties)

		this.state = {
			enabled: true,
		}

		this.randomName = `editorTextBox_${Range.getRandomInt(0, 500000)}`
	}

	public render(): JSX.Element {
		return <div className="textbox">
			<label htmlFor={this.randomName}>{this.props.label}</label>
			<input type="text" name={this.randomName}></input>
		</div>
	}
}