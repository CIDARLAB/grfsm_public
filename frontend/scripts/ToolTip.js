'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

const toolTipStyles = {
	divStyle: {
		position: 'absolute',
    fontFamily: 'Hind, sans-serif',
		fontSize: 14,
		color: 'white',
		backgroundColor: 'black',
		opacity: '0.8',
		borderRadius: 3,
		padding: 2,
		textAlign: 'center',
		fontWeight: 'normal',
	}
};
const ToolTip = React.createClass({
	render() {
		const width = this.props.width;
		const toolTipText = this.props.toolTipText;

		let toolTipStyle = JSON.parse(JSON.stringify(toolTipStyles.divStyle));
		toolTipStyle.maxWidth = width;
		toolTipStyle.display = this.props.display;
		toolTipStyle.left = this.props.left;

		//If the user has scrolled at all, then have to factor that in
		let scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
		toolTipStyle.top = this.props.top + scrollTop;

		return(
			<div style={toolTipStyle}>
				{toolTipText}
			</div>
		);

	}
});

module.exports = ToolTip;
