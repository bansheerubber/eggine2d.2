"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const range_1 = require("../../helpers/range");
class TextBox extends React.Component {
    constructor(properties) {
        super(properties);
        this.randomName = "";
        this.state = {
            enabled: true,
        };
        this.randomName = `editorTextBox_${range_1.default.getRandomInt(0, 500000)}`;
    }
    render() {
        return React.createElement("div", { className: "textbox" },
            React.createElement("label", { htmlFor: this.randomName }, this.props.label),
            React.createElement("input", { type: "text", name: this.randomName }));
    }
}
exports.default = TextBox;
//# sourceMappingURL=textBox.js.map