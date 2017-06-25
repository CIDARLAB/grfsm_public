'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

const stateExpressionCircleStyle = {
	circleStyle: {
		strokeWidth: 3,
		stroke: 'black', 
	},
};
const StateExpressionCircle = React.createClass({
	/* What happens when the circle is clicked */
	onClick() {
		//This only happens for the state edit page so add some check
		if (this.props.onClick !== undefined) {
			this.props.onClick(
				this.props.stateId
			);
		}
	},
	/* Required for dragging */
	onDragOver(evt) {
		evt.preventDefault();
	},
	/* Required for dragging */
	onDragEnter(evt) {
		evt.preventDefault();
	},
	/*
	* Function called when a gene is dropped on the circle
	*/
	onDrop(evt) {
		evt.preventDefault();
		this.props.onDrop();
	},
	/*
	* On the circuit diagram, when the mouse hover enters the state circle
	*/
	onMouseEnter() {
		if (this.props.onMouseEnterState) {
			this.props.onMouseEnterState(this.props.stateId);
		}
	},
	/*
	* On the circuit diagram, when the mouse hover leaves the state
	*/
	onMouseLeave() {
		if (this.props.onMouseLeaveState) {
			this.props.onMouseLeaveState(this.props.stateId);
		}
	},
	/*
	* Render function for the circle
	*/
	render() {
		const fill = this.props.fill;

		//This needs to be moved to the parent page that requires this logic (i.e,
		//the state edit page). All three of these below in fact
		//const maxEdge = Math.min(height, width);
		const cx = this.props.cx;
		const cy = this.props.cy;

		const radius = this.props.radius;
		const cursor = this.props.cursor;

		let circleStyle = JSON.parse(JSON.stringify(stateExpressionCircleStyle.circleStyle));
		circleStyle.cursor = cursor;

		//const strokeWidth = circleStyle.strokeWidth;
		//const stroke = circleStyle.stroke;

		return(
			<circle style={circleStyle}
				cx={cx} 
				cy={cy} 
				r={radius} 
				fill={fill}
				onDrop={this.onDrop}
				onDragOver={this.onDragOver}
				onDragEnter={this.onDragEnter}
				onClick={this.onClick}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			/>
		);
	}
});

module.exports = StateExpressionCircle;