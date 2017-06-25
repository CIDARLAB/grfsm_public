'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

const bottomNavStyles = {
	divStyle: {
		display: 'flex',
		alignItems: 'center',
		lineHeight: '30px',
		paddingTop: 10,
		height: 30,
    fontFamily: 'Open Sans, sans-serif'
	},
	spanStyle: {
		textAlign: 'left',
		float: 'left',
		color: 'white'
	},
	buttonDivStyle: {
		float: 'right',
		width: 110,
		height: 30,
		cursor: 'pointer'
	},
	buttonContainerDiv: {
		transition: 'all 0.3s ease 0s',
		height: 30,
		paddingLeft: 5,
		borderRadius: 10,
	},
	linkStyle: {
		fontSize: 14,
		cursor: 'pointer',
		color: '#4078c0',
		fontFamily: 'Hind, sans-serif',
	}
};
const BottomNav = React.createClass({
	getInitialState() {
		return {
			onLinkHover: false,
		};
	},
	onTutorialClick() {
		if (this.props.onTutorialClick !== undefined) {
			this.props.onTutorialClick();
		}
	},
	onNextClick() {
		this.props.onNextClick();
	},
	onMouseEnterLinkText() {
		this.setState({
			onLinkHover: true
		});
	},
	onMouseExitLinkText() {
		this.setState({
			onLinkHover: false
		});
	},
	render() {

		let divStyle = JSON.parse(JSON.stringify(bottomNavStyles.divStyle));
		divStyle.width = this.props.width-8;
		if (this.props.customPadding) {
			divStyle['paddingTop'] = this.props.customPadding;
		}

		const width = this.props.width;
		let linkStyle = JSON.parse(JSON.stringify(bottomNavStyles.linkStyle));

		if (this.state.onLinkHover) {
			//linkStyle.color = '#4078c0';
			linkStyle.textDecoration = 'underline';
		}

		const divLinkStyle = {
			width: width-bottomNavStyles.buttonDivStyle.width-20
		};

		const linkText = this.props.linkText;
		const customText = this.props.customText;

		return (
			<div style={divStyle}>
				<div style={divLinkStyle}>
					<span
						style={linkStyle}
						onClick={this.onTutorialClick}
						onMouseEnter={this.onMouseEnterLinkText}
						onMouseLeave={this.onMouseExitLinkText}
					>
						{linkText}
					</span>
				</div>
				<NextButton
					width={width}
					onNextClick={this.onNextClick}
					customText={customText}
				/>
			</div>
		);
	}
});

const NextButton = React.createClass({
	getInitialState() {
		return {
			hover: false,
		};
	},
	onMouseEnter() {
		this.setState({
			hover: true
		})
	},
	onMouseLeave() {
		this.setState({
			hover:false
		})
	},
	onNextClick() {
		this.props.onNextClick();
	},
	render() {
		const buttonWidth = 30;
		let divStyle = JSON.parse(JSON.stringify(bottomNavStyles.divStyle));
		divStyle.width = this.props.width;

		const spanStyle = bottomNavStyles.spanStyle;
		let buttonDivStyle = JSON.parse(JSON.stringify(bottomNavStyles.buttonDivStyle));

		let buttonContainerDiv = JSON.parse(JSON.stringify(bottomNavStyles.buttonContainerDiv));
		if (this.state.hover) {
			buttonContainerDiv.backgroundColor = '#cc7a00'
		}
		else {
			buttonContainerDiv.backgroundColor = '#ff9900';
		}

		let buttonText = 'Continue';
		if (this.props.customText) {
			buttonText = this.props.customText;
			//Arbitrarily picked 8 as the length before the font size change
			if (buttonText.length > 8) {
				buttonDivStyle.fontSize = '12px';
			}
		}

		return(
			<div style={buttonDivStyle}
				onClick={this.onNextClick}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<div style={buttonContainerDiv}>
				<span style={spanStyle}>{buttonText}</span>
				<NextButtonArrow width={buttonWidth} height={buttonDivStyle.height} />
				</div>
			</div>
		);
	}
});

const nextButtonArrowStyles = {
	lineColor: 'white',
	lineStrokeWidth: 2,
	divStyle: {
		float: 'left',
	},
	arrowPoint: {
		fill: 'white',
		stroke: 'white',
		strokeWidth: 1,
	}
};
const NextButtonArrow = React.createClass({
	render() {
		const divStyle = nextButtonArrowStyles.divStyle;
		const lineColor = nextButtonArrowStyles.lineColor;
		const lineStrokeWidth = nextButtonArrowStyles.lineStrokeWidth;

		const width = this.props.width;
		const height = this.props.height/2;

		const pointPosition = width - 10;
		const points = ""+width+","+height+" "+pointPosition+",10 "+pointPosition+",20";

		return (
			<div style={divStyle} width={width} height={height} onClick={this.onClick}>
				<svg width={width} height={height*2}>
					<g stroke={lineColor}>
						<line x1="5" y1={height} x2={pointPosition} y2={height} strokeWidth={lineStrokeWidth} />
						<polygon points={points} style={nextButtonArrowStyles.arrowPoint} />
					</g>
				</svg>
			</div>
		);
	}
});

module.exports = BottomNav;
