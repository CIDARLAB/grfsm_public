'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

const addNameInputStyles = {
	textStyle: {
		borderRadius: '1em 0em 0em 1em',
		borderColor: 'black transparent black black',
		borderStyle: 'solid',
		outline: 'none',
		paddingLeft: 10,
		fontSize: 20,
		fontFamily: 'Open Sans, sans-serif',
	},
	submitStyle: {
		color: 'white',
		transition: 'all 0.3s ease 0s',
		borderRadius: '0em 1em 1em 0em',
		borderColor: 'black',
		borderStyle: 'solid',
		marginLeft: -2,
		outline: 'none',
		fontSize: 20,
		fontFamily: 'Open Sans, sans-serif',
		cursor: 'pointer',
	},
};
//AddName box
const AddNameInput = React.createClass({
	getInitialState() {
		return {
			hover: false
		};
	},
	onMouseEnter() {
		this.setState({ hover: true });
	},
	onMouseLeave() {
		this.setState({ hover: false });
	},
	onUserEnter(evt) {
		evt.preventDefault();
		this.props.onUserEnter();
	},
	handleChange(evt) {
		evt.preventDefault();
		this.props.changeGeneName(
			this.refs.newGeneName.value
		);
	},
	render() {
		const height = this.props.height;
		const width = this.props.width;
		const submitWidth = 105;
		const placeholder = 'Enter gene name...';
		const submitValue = "Add gene"

		//All the css goes in these dictionaries
		let textStyle = JSON.parse(JSON.stringify(addNameInputStyles.textStyle));
		textStyle['height'] = height;
		textStyle['width'] = width - submitWidth;

		let submitStyle = JSON.parse(JSON.stringify(addNameInputStyles.submitStyle));
		submitStyle['height'] = height;
		submitStyle['width'] = submitWidth;

		if (this.state.hover) {
			// Original color #078C07
			submitStyle.backgroundColor = '#cc7a00'
		}
		else {
			// Original color: #0AA20A
			submitStyle.backgroundColor = '#ff9900';
		}

		const newGeneName = this.props.newGeneName;

		let formStyle = {};
		if (this.props.centerInput) {
			formStyle.textAlign = 'center';
		}
		return (
			<div>
				<form style={formStyle} onSubmit={this.onUserEnter}>
					<input
						ref="newGeneName"
						type="text"
						style={textStyle}
						placeholder={placeholder}
						value={newGeneName}
						onChange={this.handleChange}
					/>
					<input
						type="submit"
						style={submitStyle}
						value={submitValue}
						onMouseEnter={this.onMouseEnter}
						onMouseLeave={this.onMouseLeave}
					/>
				</form>
			</div>
		);
	}
});

module.exports = AddNameInput;
