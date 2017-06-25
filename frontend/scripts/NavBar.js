'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var ToolTip = require('./ToolTip');

const navBarStyle = {
	divStyle: {
		display: 'block',
	  fontSize: '2em',
		WebkitMarginBefore: 5,
		WebkitMarginAfter: 5,
		WebkitMarginStart: 0,
		WebkitMarginEnd: 0,
		fontWeight: 'bold',
    fontFamily: 'Open Sans, sans-serif',
		height: 43,
		backgroundColor: '#66ccff',
		marginTop: '-8px',
		marginLeft: '-8px',
		marginRight: '-8px',
		marginBottom: '20px',
		paddingLeft: '8px',
		color: 'white',
		cursor: 'default'
	},
	customDivStyle: {
		marginBottom: 20,
	},
	infoButtonStyle: {
		width: 20,
		height: 20,
		float: 'left',
		marginTop: 12,
		marginLeft: 4,
		cursor: 'pointer',
	},
	titleStyle: {
		float: 'left',
		textAlign: 'center',
	}
};
const NavBar = React.createClass({
	onCustomButtonClick() {
		this.props.onCustomButtonClick();
	},
	render() {
		const pageTitle = this.props.pageTitle;
		const customButton = this.props.customButton;

		const customButtonTitle = this.props.customButtonTitle;
		const numberOfCircuits = this.props.numberOfCircuits;
		const circuitToShow = this.props.circuitToShow + 1;

		const divStyle = navBarStyle.divStyle;
		const titleStyle = navBarStyle.titleStyle;


		let toReturn = null;
		if (customButton === 1) {
			const customDivStyle = navBarStyle.customDivStyle;
			let customPageTitleForCircuitDiagram = 'Circuit Diagram for circuit ' + circuitToShow + '/' + numberOfCircuits;
			if (numberOfCircuits === 0) {
				customPageTitleForCircuitDiagram = 'Circuit Diagram';
			}
			toReturn = <div style={customDivStyle}><span>{customPageTitleForCircuitDiagram}</span>
				<CustomButton
					buttonTitle={customButtonTitle}
					onClick={this.onCustomButtonClick}
				/>
				</div>;
		}
		else {
			toReturn = <div>
					<div style={divStyle}>
							<div style={titleStyle}>{pageTitle}</div>
						<InfoIcon toolTipText={this.props.toolTipText}/>
					</div>
				</div>;
		}
		return (
				toReturn
		);
	}
});

const InfoIcon = React.createClass({
	getInitialState() {
		return {
			toolTip: {
				display: 'none'
			}
		}
	},
	/*
	* Should display the informational tool tip when the mouse enters the button
	*/
	onMouseEnter(evt) {
		const coordinates = evt.target.getBoundingClientRect();
		this.setState({
			toolTip: {
				display: 'block',
				left: (parseInt(coordinates.left)+parseInt(coordinates.right))/2-20,
				top: parseInt(coordinates.top) + 35,
			},
		});
	},
	/*
	* Should remove the tool tip when the mouse leaves
	*/
	onMouseLeave(evt) {
		this.setState({
			toolTip: {
				display: 'none',
			}
		});
	},
	render() {
		const infoButtonStyle = navBarStyle.infoButtonStyle;
		const toolTip = this.state.toolTip;
		const toolTipText = this.props.toolTipText;
		return(
			<div>
				<img
					src={"./img/noun_90272_cc.svg"}
					style={infoButtonStyle}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				/>
				<ToolTip
					display={toolTip.display}
					left={toolTip.left}
					top={toolTip.top}
					width={300}
					toolTipText={toolTipText}
				/>
			</div>
		);
	}
});

const buttonStyles = {
	divStyle: {
		float: 'right',
		backgroundColor: '#ff9900', // 'was 'green'
		width: 80,
		height: 40,
	}
};
const CustomButton = React.createClass({
	onClick() {
		this.props.onClick();
	},
	render() {
		const divStyle = buttonStyles.divStyle;
		const buttonTitle = this.props.buttonTitle;
		return(
			<div style={divStyle} onClick={this.onClick}>
				{buttonTitle}
			</div>
		);
	}
});

module.exports = NavBar;
