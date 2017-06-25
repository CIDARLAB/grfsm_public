'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var NavBar = require('./NavBar');
var BottomNav = require('./BottomNav');
var AddNameInput = require('./AddNameInput');
var GeneList = require('./GeneList');

//AddGenePage class
const addGenePageStyles = {
	inputAndListStyle: {
    fontFamily: 'Open Sans, sans-serif',
		margin: '0 auto',
		width: '600px',
		paddingTop: '30px'
	}
};
const AddGenePage = React.createClass({
	getInitialState() {
		return {
			noGenesEntered: false,
			numGenes: this.props.geneCount,
		}
	},
	onTutorialClick() {
		this.props.onTutorialClick();
	},
	onUserChangeColor(geneId, color) {
		this.props.onUserChangeColor(geneId, color);
	},
	onUserEnter() {
		this.setState({numGenes: (this.state.numGenes + 1)}, function() {
			// console.log("added: " + this.state.numGenes);
		});
		this.props.changeGeneCount(1);
		this.props.onUserEnter();
	},
	changeGeneName(newGeneName) {
		this.props.changeGeneName(newGeneName);
	},
	onNextClick() {
		if (this.state.numGenes <= 0) {
			this.setState({noGenesEntered: true});
		}
		else {
			this.setState({noGenesEntered: false});
			this.props.onNextClick();
		}
	},
	closeWindow() {
		this.setState({noGenesEntered: false});
	},
	removeGene(id) {
		this.setState({numGenes: (this.state.numGenes - 1)}, function() {
			// console.log("removed: " + this.state.numGenes);
		});
		this.props.changeGeneCount(-1);
		this.props.removeGene(id);
	},
	render() {
		const pageTitle = this.props.pageTitle;
		const inputAndListWidth = this.props.inputAndListWidth;

		const pageWidth = this.props.pageWidth;
		const pageHeight = this.props.pageHeight;

		const genes = this.props.genes;
		const newGeneName = this.props.newGeneName;

		// Turn CSS stylesheet into a dictionary --- more malleable code
		let inputAndListStyle = JSON.parse(JSON.stringify(addGenePageStyles.inputAndListStyle));
		inputAndListStyle['width'] = inputAndListWidth;

		let toReturn = null;
		if (this.state.noGenesEntered) {
			toReturn = <div>
				<NavBar
					pageTitle={pageTitle}
					toolTipText={"Use this page to add the names of the genes you want to express in your state machine. For each gene, use the 'choose color' button to select the color you want to assign to this gene to visualize it in your design."}
				/>
				<div style={inputAndListStyle}>
					<AddNameInput
						height={50}
						width={inputAndListWidth}
						newGeneName={newGeneName}
						onUserEnter={this.onUserEnter}
						changeGeneName={this.changeGeneName}
					/>
					<GeneList
						width={inputAndListWidth}
						genes={genes}
						draggableElements={false}
						onUserChangeColor={this.onUserChangeColor}
						displayColorPicker={1}
						onDeleteClick={this.removeGene}
					/>
					<ErrorView
						closeWindow = {this.closeWindow}
					/>
				</div>
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
					customPadding = {50}
				/>
			</div>
		} else {
			toReturn = <div>
				<NavBar
					pageTitle={pageTitle}
					toolTipText={"Use this page to add the names of the genes you want to express in your state machine. For each gene, use the 'choose color' button to select the color you want to assign to this gene to visualize it in your design."}
				/>
				<div style={inputAndListStyle}>
					<AddNameInput
						height={50}
						width={inputAndListWidth}
						newGeneName={newGeneName}
						onUserEnter={this.onUserEnter}
						changeGeneName={this.changeGeneName}
					/>
					<GeneList
						width={inputAndListWidth}
						genes={genes}
						draggableElements={false}
						onUserChangeColor={this.onUserChangeColor}
						displayColorPicker={1}
						onDeleteClick={this.removeGene}
					/>
				</div>
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
					customPadding = {50}
				/>
			</div>
		}

		return (
			toReturn
		);
	}
});

const errorStyles = {
  divStyle: {
    position: 'absolute',
    backgroundColor: '#abd3e8',
    top: '43%',
    left: '43%',
    marginTop: '-50px',
    marginLeft: '-50px',
		fontFamily: 'Open Sans, sans-serif',
		stroke: 'black',
		strokeWidth: '3px',
		width: 250,
		height: 100,
  },
	alignment: {
		textAlign: 'center',
		float: 'center',
	},
	okayButton: {
		float: 'right',
		backgroundColor: 'white',
	}
};

// This is the pop-out window to let the user know that they must enter a gene
const ErrorView = React.createClass({

	closeWindow: function() {
		this.props.closeWindow();
	},

  render() {
    return (
			<div style = {errorStyles.divStyle}>
				<div style = {errorStyles.alignStyle}>
					{"Please enter at least one gene before moving forwards"}
				</div>
				<div>
					<input type ={'button'} value = {'Okay'} onClick = {this.closeWindow} style = {errorStyles.okayButton}/>
				</div>
			</div>
    );
  }
});


module.exports = AddGenePage;
