"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const range_1 = require("../../helpers/range");
class ToggleBox extends React.Component {
    constructor(properties) {
        super(properties);
        this.randomName = "";
        this.state = {
            enabled: true,
        };
        this.randomName = `editorTextBox_${range_1.default.getRandomInt(0, 500000)}`;
    }
    render() {
        return React.createElement("div", { className: "togglebox" },
            React.createElement("label", { htmlFor: this.randomName }, this.props.label),
            React.createElement("input", { type: "checkbox", name: this.randomName }),
            React.createElement("span", { className: "checkbox" }));
    }
}
exports.default = ToggleBox;
//# sourceMappingURL=toggleBox.js.map