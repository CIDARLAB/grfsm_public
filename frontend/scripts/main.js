"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var AddGenePage = require('./AddGenePage');
var StateEditPage = require('./StateEditPage');
var StateDiagram = require('./StateDiagram');
var CircuitDiagram = require('./CircuitDiagram');
var TutorialPage = require('./TutorialPage');
var PrintPreview = require('./PrintPreview');

var ColorsPicker = require('react-colors-picker');

/*
* Main app react class
*
* The highest level class. Manages which pages are displayed, which genes
* are being used in the state machine as well as the current state design of
* the system
*/
const App = React.createClass({
	/*
	* The state includes:
	*	pageId:
	*		the id of the page that we are now such as the gene addition page,
	*		the state diagram page, the state edit page and the circuit digram page
	*	pagePriorTotTutorial:
	*		the id of the page that the user was on before they clicked on the tutorial
	*		link. That way when they close out of the tutorial they return to the page
	*		that they were viewing before
	*	newGeneName:
	*		the name of the gene that the user is entering in on the gene
	*		gene addition page
	*	genes:
	*		a list that keeps track of all the genes that the user added with some
	*		additional information including the color assigned to it and its name
	*	stateExpressions:
	*		a dictionary keyed by the state number which holds the ids
	*		of the genes that are expressed in that state (the key must
	*		have its value set to true, otherwise it is considered not
	*		expressed)
	*	stateBeingEdited:
	*		the current state being edited when on the state edit page
	*	width:
	*		the width of the broswer window. Changes on window resize
	*	height:
	*		the height of the browser window. Changes on resize
	*	numInputs:
	*		number of inputs for the state machine. Changes based on toggle
	* dataToPrint:
	*		the data to be rendered in PrintPreview
	*/
	getInitialState() {
		return {
			pageId: 0,
			pagePriorToTutorial: undefined,
			newGeneName: '',
			genes: [],
			// TODO: this is harcoded
			// Make a way to have this array of arrays to change dynamically based on the # of states
			stateExpressions: {
				1: {},
				2: {},
				3: {},
				4: {},
				5: {},
				6: {},
				7: {},
				8: {},
				9: {},
				10: {},
				11: {},
				12: {},
				13: {},
				14: {},
				15: {},
				16: {},
			},
			stateBeingEdited: 0,
			width: undefined,
			height: undefined,
			numInputs: 2,
			dataToPrint: [],
			geneMapping: undefined,
			circuitsPartMapping: undefined,
			geneCount: 0,
		};
	},
	/*
	* Updates the values of height and width in the state
	* Function required to react to the resizing event
	*/
	updateDimensions() {
	    this.setState({width: window.innerWidth, height: window.innerHeight});
	},
	componentWillMount() {
	    this.updateDimensions();
	},
	componentDidMount() {
	    window.addEventListener("resize", this.updateDimensions);
	},
	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
	},
	/*
	* Navigate to the state edit page
	*
	* stateId:
	*	the state that we are editting
	*/
	goToStateEdit(stateId) {
		this.setState({
			pageId: 2,
			stateBeingEdited: stateId,
		});
	},

	changeNumInputs(inputNumber) {
		this.setState({
			numInputs: inputNumber
		});
	},

	onTutorialClick() {
		const currentPageId = this.state.pageId;
		this.setState({
			pageId: 4,
			pagePriorToTutorial: currentPageId
		});
	},

	changeGeneCount(modifier) {
		this.setState({
			geneCount: (this.state.geneCount + modifier)
		}, function() {
			// console.log("this.state.geneCount");
		})
	},

	returnToCircuitPage() {
		this.setState({
			pageId: 3,
		})
	},

	onPrintPreviewClicked(dataToPrint, geneMapping, circuitsPartMapping) {
		this.setState({
			pageId: 5,
			dataToPrint: dataToPrint,
			geneMapping: geneMapping,
			circuitsPartMapping: circuitsPartMapping,
		}, function() {
			// console.log(this.state.dataToPrint + " " + geneMapping + " " + circuitsPartMapping);
		});
		// console.log("main.js: " + this.state.dataToPrint);
	},
	/*
	* Event listener for when we click the next page button on the nav bar at the
	* bottom of the page. Changes the pageId based on the current page we are on
	*/
	onNextClick() {
		const currentPage = this.state.pageId;
		let newPageId = currentPage;
		switch (currentPage) {
			case 1:
				//Go to the circuit diagram page
				this.setState({
					pageId: 3,
					stateBeingEdited: 0
				});
				break;
			case 0:
			case 2:
				//Go back to State Diagram page
				this.setState({
					pageId: 1,
					stateBeingEdited: 0
				});
				break;
			case 3:
				//Go back to the home page and reset the state
				this.setState(this.getInitialState());
				//Have to call the dimensions function to set the height and width variables
				this.updateDimensions();
				break;
			case 4:
				const pageToGoTo = this.state.pagePriorToTutorial;
				this.setState({
					pageId: pageToGoTo,
				});
				break;
			default:
				break;
		}
	},
	/*
	* Updates the genes stored for a certain states state expression.
	*
	* stateID:
	*	the id of the state that was edited
	* genesSelected:
	*	hash of geneids that are either true or false based on if they are expressed
	*	in this state
	*/
	onUpdateStateExpressions(stateId, genesSelected) {
		let stateExpressions = this.state.stateExpressions;
		stateExpressions[stateId] = genesSelected;
		this.setState({
			stateExpressions: stateExpressions,
		});
	},
	/*
	* Adds a new gene to the gene list. This is currently used only for when the user
	* hits enter or the add button on the gene addition page
	*/
	onUserEnter() {
		const newGeneName = this.state.newGeneName;
		const newID = this.state.genes.length;

		//Chooses the color to associate with this gene randomly at first
		let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);;

		const genes = this.state.genes.concat({
			id: newID,
			geneName: newGeneName,
			color: color,
		});
		this.setState({
			newGeneName: '',
			genes: genes,
		});
	},
	onUserChangeColor(geneId, color) {
		const genes = this.state.genes;
		let newGenesArray = [];
		for (let index in genes) {
			const gene = genes[index];
			if (gene.id === geneId) {
				newGenesArray.push({
					id: geneId,
					color: color,
					geneName: gene.geneName,
				})
			}
			else {
				newGenesArray.push(gene);
			}
		}
		this.setState({
			genes: newGenesArray,
		});
	},
	/*
	* Changes the value of the newGeneName state variable
	*/
	changeGeneName(newGeneName) {
		this.setState({
			newGeneName: newGeneName,
		});
	},
	/*
	* Given a gene id, removes that gene from the list of genes in the state.
	* TODO: Currently unused but should be implemented
	*/
	removeGene(id) {
		const genes = this.state.genes;
		let newGenesArray = [];
		for (let index in genes) {
			const gene = genes[index];
			if (gene.id !== id) {
				newGenesArray.push(gene);
			}
		}
		this.setState({
			genes: newGenesArray,
		});
	},
	/*
	* Returns the information about the gene matching the id given
	*/
	getGeneInformation(id) {
		let geneInfoToReturn = undefined;
		this.state.genes.forEach((gene) => {
			if (gene.id === id) {
				geneInfoToReturn = gene;
				return;
			}
		});
		return geneInfoToReturn;
	},
	/*
	* Render function. Decently self-explanatory. Returns which page to display based
	* on the value of the pageId variable in the state
	*/
	render() {
		const genes = this.state.genes;
		const newGeneName = this.state.newGeneName;
		const stateExpressions = this.state.stateExpressions;

		//TODO: determine what the nav bar heights are and subtract that from what
		//the page dimensions should be
		const pageWidth = this.state.width;

		//Need to account for the description boxes
		//40 => top nav bar height
		//20 => top nav bar margin space
		//40 => bottom nav bar height
		//Extra 10 => no idea.. need to identify...
		const pageHeight = this.state.height - 40 - 20 - 40 - 10;

		const stateBeingEdited = this.state.stateBeingEdited;
		const singleStateExpression = stateExpressions[stateBeingEdited];
		const numberOfGenes = this.state.genes.length;

		let pageToDisplay = null;
		switch (this.state.pageId) {
			case 0:
				pageToDisplay = <AddGenePage
					pageWidth={pageWidth}
					pageHeight={pageHeight}
					pageTitle={"Gene Addition"}
					inputAndListWidth={600}
					newGeneName={newGeneName}
					genes={genes}
					onUserEnter={this.onUserEnter}
					changeGeneName={this.changeGeneName}
					onUserChangeColor={this.onUserChangeColor}
					onNextClick={this.onNextClick}
					removeGene={this.removeGene}
					onTutorialClick={this.onTutorialClick}
					changeGeneCount = {this.changeGeneCount}
					geneCount = {this.state.geneCount}
				/>;
				break;
			case 1:
				pageToDisplay = <StateDiagram
					pageWidth={pageWidth}
					pageHeight={pageHeight - 60}
					pageTitle={"State Diagram"}
					stateExpressions={stateExpressions}
					genes={genes}
					onNextClick={this.onNextClick}
					onDiagramStateClick={this.goToStateEdit}
					onTutorialClick={this.onTutorialClick}
					numInputs = {this.state.numInputs}
					toggleNumInputs = {this.changeNumInputs}
				/>
				break;
			case 2:
				pageToDisplay = <StateEditPage
					pageWidth={pageWidth}
					pageHeight={pageHeight}
					pageTitle={"State Edit"}
					genes={genes}
					stateExpressions={singleStateExpression}
					stateId={stateBeingEdited}
					onUpdateStateExpressions={this.onUpdateStateExpressions}
					onNextClick={this.onNextClick}
					newGeneName={newGeneName}
					changeGeneName={this.changeGeneName}
					onUserEnter={this.onUserEnter}
					onUserChangeColor={this.onUserChangeColor}
					onTutorialClick={this.onTutorialClick}
				/>;
				break;
			case 3:
				pageToDisplay = <CircuitDiagram
					pageWidth={pageWidth}
					pageHeight={pageHeight}
					pageTitle={"Circuit Diagram"}
					stateExpressions={stateExpressions}
					numberOfGenes={numberOfGenes}
					onNextClick={this.onNextClick}
					getGeneInformation={this.getGeneInformation}
					genes={genes}
					url="/api/rankedCircuitFromDesign"
					onTutorialClick={this.onTutorialClick}
					numInputs = {this.state.numInputs}
					onPrintPreviewClicked = {this.onPrintPreviewClicked}
				/>;
				break;
			case 4:
				pageToDisplay = <TutorialPage
					pageWidth={pageWidth}
					onNextClick={this.onNextClick}
				/>;
				break;
			case 5:
				pageToDisplay = <PrintPreview
					pageWidth = {pageWidth}
					pageHeight = {pageHeight}
					numInputs = {this.state.numInputs}
					dataToPrint = {this.state.dataToPrint}
					stateExpressions={stateExpressions}
					getGeneInformation={this.getGeneInformation}
					genes={genes}
					geneMapping = {this.state.geneMapping}
					circuitsPartMapping = {this.state.circuitsPartMapping}
					returnToCircuitPage = {this.returnToCircuitPage}
				/>;
				break;
			default:
				pageToDisplay = <h2>Page not found</h2>
				break;
		}

		return (
			pageToDisplay
		);
	}
});

//Display the app
let node = document.getElementById("content");
ReactDOM.render(
	<App />,
	node
);
