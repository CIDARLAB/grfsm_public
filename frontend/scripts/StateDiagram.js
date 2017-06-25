'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var NavBar = require("./NavBar");
var BottomNav = require('./BottomNav');
var StateExpressionCircle = require('./StateExpressionCircle');
var DiagramIllustration = require('./DiagramIllustration');
var DiagramIllustration3Input = require('./DiagramIllustration3Input');

/*
* StateDiagram
*
* The overall state diagram of the state machine
*/
const stateDiagramStyles = {
	diagramIllustrationStyle: {
		margin: 'auto'
	},
	radioButtonStyle: {
		verticalAlign: 'middle',
		height: '20',
		backgroundColor: 'red',
	},
	textStyle: {
		fontFamily: 'Open Sans, sans-serif',
		fontSize: '18px',
	}
};
const StateDiagram = React.createClass({

	/*
	* Called when the tutorial link is clicked at the bottom of the page
	*/
	onTutorialClick() {
		this.props.onTutorialClick();
	},
	/*
	* Handles event when a specific state on the state diagram is clicked
	*/
	onDiagramStateClick(stateId) {
		this.props.onDiagramStateClick(stateId);
	},
	/* Handles the even when the user clicks on the next button in the bottom nav */
	onNextClick() {
		this.props.onNextClick();
	},

	/*
	* Handles event when user selects to display two input state diagram
	*/
	onTwoInputClicked() {
		this.props.toggleNumInputs(2);
	},

	/*
	* Handles event when user selects to display two input state diagram
	*/
	onThreeInputClicked() {
		this.props.toggleNumInputs(3);
	},

	/* Renders the component */
	render() {
		const pageTitle = this.props.pageTitle;
		const stateExpressions = this.props.stateExpressions;
		const genes = this.props.genes;
		const pageWidth = this.props.pageWidth;
		const pageHeight = this.props.pageHeight;

		//TODO: pick good values for these
		const diagramWidth = pageWidth - 40;
		const diagramHeight = pageHeight;

		const diagramIllustrationStyle = stateDiagramStyles.diagramIllustrationStyle;
		const radioButtonStyle = stateDiagramStyles.radioButtonStyle;
		const textStyle = stateDiagramStyles.textStyle;

		const numInputs = this.props.numInputs;

		let toReturn = null;
		if (numInputs === 2) {
			toReturn = <div>
										<NavBar pageTitle={pageTitle} toolTipText={"Use this page to visualize and edit the expression of genes in the state machine. To edit the expression profile of a certain state, click on that state."}/>
										<div style = {textStyle}>
											{"2 Input: "}
											<input style = {radioButtonStyle} type={"radio"} name={"inputNum"} id={"inputNum_Two"} value={"Two"} onChange = {this.onTwoInputClicked} defaultChecked = {"inputNum_Two"}/>
										</div>
										<div style = {textStyle}>
											{"3 Input (one gene programs only): "}
											<input style = {radioButtonStyle} type={"radio"} name={"inputNum"} id={"inputNum_Three"} value={"Three"} onChange = {this.onThreeInputClicked}/>
										</div>
										<div style={diagramIllustrationStyle}>
											<DiagramIllustration
												height={diagramHeight}
												width={diagramWidth}
												onDiagramStateClick={this.onDiagramStateClick}
												stateExpressions={stateExpressions}
												genes={genes}
											/>
										</div>
										<BottomNav
											width={pageWidth}
											onNextClick={this.onNextClick}
											linkText={"First time using the app? Learn how here!"}
											onTutorialClick={this.onTutorialClick}
										/>
						</div>;
		} else if (numInputs === 3) {
			toReturn = <div>
										<NavBar pageTitle={pageTitle} toolTipText={"Use this page to visualize and edit the expression of genes in the state machine. To edit the expression profile of a certain state, click on that state."}/>
										<div style = {textStyle}>
											{"2 Input: "}
											<input style = {radioButtonStyle} type={"radio"} name={"inputNum"} id={"inputNum_Two"} value={"Two"} onChange = {this.onTwoInputClicked}/>
										</div>
										<div style = {textStyle}>
											{"3 Input (one gene programs only): "}
											<input style = {radioButtonStyle} type={"radio"} name={"inputNum"} id={"inputNum_Three"} value={"Three"} onChange = {this.onThreeInputClicked} defaultChecked = {"inputNum_Three"}/>
										</div>
										<div style={diagramIllustrationStyle}>
											<DiagramIllustration3Input
												height={diagramHeight}
												width={diagramWidth}
												onDiagramStateClick={this.onDiagramStateClick}
												stateExpressions={stateExpressions}
												genes={genes}
												radius = {30}
											/>
										</div>
										<BottomNav
											width={pageWidth}
											onNextClick={this.onNextClick}
											linkText={"First time using the app? Learn how here!"}
											onTutorialClick={this.onTutorialClick}
										/>
						</div>;
		}
		return (
			toReturn
		);
	}
});

module.exports = StateDiagram;
