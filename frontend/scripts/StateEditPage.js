'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var NavBar = require("./NavBar");
var BottomNav = require('./BottomNav');
var GeneList = require("./GeneList");
var StateExpressionCircle = require('./StateExpressionCircle');
var AddNameInput = require('./AddNameInput');
var EditPageBody = require('./EditPageBody');


/*
* StateEditPage
*
* Allows users to edit a specific state of the state machine
*/
const stateEditPageStyles = {
	editPageBodyStyles: {
		margin: 'auto',
		fontFamily: 'Open Sans, sans-serif',
	}
};
const StateEditPage = React.createClass({
	/*
	* The state includes:
	*	dragging:
	*		whether or not the user is currently dragging a gene
	*	geneDragged:
	*		information about the gene that the user is currently dragging
	*	circleFill:
	*		the color filling of the cirle.
	*		TODO: make this an array of colors that should be displayed
	*/
	getInitialState() {
		return{
			dragging: false,
			geneDragged: {},
			circleFill: 'white',
		};
	},
	onTutorialClick() {
		this.props.onTutorialClick();
	},
	onUserChangeColor(geneId, color) {
		this.props.onUserChangeColor(geneId, color);
	},
	onUserEnter() {
		this.props.onUserEnter();
	},
	changeGeneName(newGeneName, newDatabase, newSecondTitle) {
		this.props.changeGeneName(newGeneName, newDatabase, newSecondTitle);
		this.props.changeGeneCount(1);
	},
	/*
	* Event listener for when the user hits the next button in the bottom nav
	*/
	onNextClick() {
		this.props.onNextClick();
	},
	/*
	* What to do when the delete button is clicked on a gene
	*
	* geneId:
	* 	the id of the gene whose expression should be set to false for this state
	*/
	onUndoSelection(geneId) {
		let genesSelected = this.props.stateExpressions;
		genesSelected[geneId] = false;
		//Need to update the color as well
		this.props.onUpdateStateExpressions(
			this.props.stateId,
			genesSelected
		);
	},
	/*
	* What to do on drag. This is specificially on the dragStart event
	*/
	onDrag(geneId, color) {
		this.setState({
			dragging: true,
			geneDragged: {
				geneId: geneId,
				color: color
			}
		});
	},
	/*
	* How to react to a gene being dropped into the expression circle
	*/
	onDrop() {
		const circleFill = this.state.geneDragged.color;
		const geneSelectedId = this.state.geneDragged.geneId;
		let genesSelected = this.props.stateExpressions;
		genesSelected[geneSelectedId] = true;

		this.setState({
			dragging: false,
			geneDragged: {},
			circleFill: circleFill,
		});

		this.props.onUpdateStateExpressions(
			this.props.stateId,
			genesSelected
		);
	},
	/*
	* Render function that sets up the page
	*/
	render() {
		const stateId = this.props.stateId;
		const pageTitle = this.props.pageTitle + ' ' + stateId;
		const genes = this.props.genes;
		const newGeneName = this.props.newGeneName;

		const pageWidth = this.props.pageWidth;
		const pageHeight = this.props.pageHeight;

		//TODO: change these variables so UI is correct.
		const editBodyWidth = pageWidth - 40;
		const editBodyHeight = pageHeight;

		// const stateExpressions = this.props.stateExpressions;
		const circleFill = this.state.circleFill;
		const genesSelected = this.props.stateExpressions;

		const editPageBodyStyles = stateEditPageStyles.editPageBodyStyles;

		return (
			<div>
				<NavBar pageTitle={pageTitle} toolTipText={"Use this page to select which genes are expressed in this state. Drag and drop genes from the gene list on the right into the circle on the left. The genes that are expressed in this state will be highlighted in the list and their color will appear in the circle. Once finished, click the continue button to go back to the state diagram page"}/>
				<div style={editPageBodyStyles}>
					<EditPageBody
						width={editBodyWidth}
						height={editBodyHeight}
						genes={genes}
						circleFill={circleFill}
						onDrop={this.onDrop}
						onDrag={this.onDrag}
						genesSelected={genesSelected}
						onUndoSelection={this.onUndoSelection}
						newGeneName={newGeneName}
						onUserEnter={this.onUserEnter}
						changeGeneName={this.changeGeneName}
						onUserChangeColor={this.onUserChangeColor}
					/>
				</div>
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
				/>
			</div>
		);
	}
});

module.exports = StateEditPage;
