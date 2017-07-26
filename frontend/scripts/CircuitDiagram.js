'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');
var $ = require('jQuery');
//var SSAP = require('save-svg-as-png');

var NavBar = require('./NavBar');
var BottomNav = require('./BottomNav');
var GeneticCircuit = require('./GeneticCircuit');
var DiagramIllustration = require('./DiagramIllustration');
var DiagramIllustration3Input = require('./DiagramIllustration3Input');
var PrintPreview = require('./PrintPreview');
import * as constants from './constants';
import * as File from './GenerateFile';

/*
* The page the contains the display for the circuit diagram. Has its own navigation bar
* and uses the GeneticCircuit component to display the circuits
*/

const CircuitDiagram = React.createClass({
	/*
	* In the state for this page we have:
	*	data:
	*		an array of the circuits the should be displayed on the page
	*	circuitToShow:
	*		index of the circuit is currently being displayed on the page of the circuits returned
	*	hoveringOverState:
	*	  array; which state is hovered over = true
	*	popoutCircuit:
	*		similar to toolTip relationship w/ infoButton; window will appear during scroll
	* lastHovered:
	*		only set when hover in 3-input. Used to pass data to popup window
	*	pdfSettings:
	*		PDF popup window object (set configurations for PDF)
	*	circuitsPartMapping:
	* 	needed here to pass to new window
	*	geneMapping:
	* 	needed here to pass to new window
	*/
	getInitialState() {
		return {
			data: [],
			circuitToShow: 0,
			hoveringOverState: [false, false, false, false, false, false,
				false, false, false, false, false, false, false, false, false, false],
			popoutCircuit: {
				display: 'none',
			},
			lastHovered: 1,
			pdfSettings: {
				display: 'none',
			},
			partNameArray: []
		};
	},
	/*
	* event listener for when the user clicks on the tutorial link on this page
	*/
	onTutorialClick() {
		this.props.onTutorialClick();
	},
	/*
	*
	*/
	getGeneInformation(id) {
		return this.props.getGeneInformation(id);
	},
	/*
	* What to do when the page has mounted. This is when we want to send the data to the
	* server
	*/
	componentDidMount: function() {
		this.loadDataFromServer();
		//setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	/*
	* Load data from server. We send what the user has inputted (in a formatted way) to the
	* server and then in return we get the list of circuits that correspond to the design that
	* the user specified
	* TODO: make sure that circuit diagram is passed # of inputs
	*/
	loadDataFromServer() {
		let stateExp = null;
		// Make sure that the data passed is the right size/chunk of the array
		if (this.props.numInputs === 2) {
			let stateExpOriginal = this.props.stateExpressions;
			let hashMap ={
			1: stateExpOriginal[1],
			2: stateExpOriginal[2],
			3: stateExpOriginal[3],
			4: stateExpOriginal[4],
			5: stateExpOriginal[5]
		  };
			let stateExp = hashMap;
		}
		else if (this.props.numInputs === 3) {
			stateExp = this.props.stateExpressions;
		}
		let dataToSend = {
			numInputs: this.props.numInputs,
			//stateExpressions: stateExp,
			stateExpressions: this.props.stateExpressions,
			numberOfGenes: this.props.numberOfGenes,
		};

		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			data: dataToSend,
			success: function(data) {
				this.setState({
					data: data,
				});
			}.bind(this),
			failure: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	/*
	* Event listener for when the user clicks the 'Next' button
	*/
	onNextClick() {
		this.props.onNextClick();
	},

	/*
	* Event listener for when the user presses the right/left arrow keys
	*/
	onKeyDown(e) {
		/*console.log(e);
		switch(e.which) {
			case 39:
			  // 39 is the key code for the RIGHT arrow
				this.onShowNextCircuit()
			case 37:
			  // 37 is the key code for the LEFT arrow
				this.onShowPreviousCircuit();
				break;
		 default:
		 	break;
		}*/
	},

	/*
	* When the user clicks the next circuit button
	*/
	onShowNextCircuit() {
		if (this.state.data.length !== 0) {
			const numberOfCircuits = this.state.data[0].length;
			const newCircuitId = (this.state.circuitToShow + 1) % numberOfCircuits;
			this.setState({ circuitToShow: newCircuitId}, function() {
			    // console.log("state changed: " + this.state.circuitToShow);
			});
		}
	},

	/*
	* When the user clicks the previous circuit button
	*/
	onShowPreviousCircuit() {
		if (this.state.data.length !== 0) {
			const numberOfCircuits = this.state.data[0].length;
			const newCircuitId = Math.max(this.state.circuitToShow - 1, 0) % numberOfCircuits;
			this.setState({
				circuitToShow: newCircuitId,
			});
		}
	},
	/*
	* On the circuit diagram, when the mouse hover enters the state circle
	*/
	onMouseEnterState(stateId) {
		let oldHoveringState = this.state.hoveringOverState;
		oldHoveringState[stateId-1] = true;
		this.setState({
			hoveringOverState: oldHoveringState,
		});
		if (this.props.numInputs === 3 && stateId !== 1) {
			// then open the box that shows that circuit
			// stateId should not be 1 b/c that has a separate circuit already shown
			this.setState({
				popoutCircuit: {
					display: 'block',
				},
				lastHovered: stateId,
			});
		}
	},
	/*
	* On the circuit diagram, when the mouse hover leaves the state
	*/
	onMouseLeaveState(stateId) {
		this.setState({
			hoveringOverState: [false, false, false, false, false, false,
				false, false, false, false, false, false, false, false, false, false],
		})
		this.setState({
			popoutCircuit: {
				display: 'none',
			}
		});
	},

	setPartNameList(nameArray){
		this.setState({
			partNameArray: nameArray
		});
	},

	clickedDownload(){
		console.log("[CircuitDiagram:clickedDownload()]");

		const data = this.state.data;
		const circuitToShow = this.state.circuitToShow;

		let numberOfCircuits = 0;

		let circuitArray = [];
		let allCircuits = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

		let geneIdToPartMapping = [];
		let circuitsPartMapping = [];

		let noCircuitsWereFound = false;
		if (data.length !== 0) {
			numberOfCircuits = this.state.data[0].length;
			//Check for errors
			if (data[0][0] === 'Gene regulation program does not exist' || data[0][0] === 'No registers found' || data[0][0] === 'Design does not exist') {
				// console.log('No circuit was found');
				noCircuitsWereFound = true;
			}
			else {
				// Access by using state as index ... note that index 0 is just a filler (contents = same as index 1)
				allCircuits = [
				data[0][circuitToShow][0][0], data[0][circuitToShow][0][0], data[0][circuitToShow][0][1],
				data[0][circuitToShow][0][2], data[0][circuitToShow][0][3],
				data[0][circuitToShow][0][4], data[0][circuitToShow][0][5],
				data[0][circuitToShow][0][6], data[0][circuitToShow][0][7], data[0][circuitToShow][0][8],
				data[0][circuitToShow][0][9],data[0][circuitToShow][0][10],
				data[0][circuitToShow][0][11],data[0][circuitToShow][0][12],
				data[0][circuitToShow][0][13],data[0][circuitToShow][0][14], data[0][circuitToShow][0][15],
			];
			circuitArray = allCircuits[1];
			geneIdToPartMapping = data[0][circuitToShow][1];
			circuitsPartMapping = data[1];
		}
		}

		let geneMapping = {};
		if (geneIdToPartMapping.length !== 0) {
			for (let geneMap in geneIdToPartMapping) {
				const splitPartGene = geneMap.split('.');
				//Part id is stored at the second position, the gene position in that part is stored in the third position
				const partID = splitPartGene[1];
				const genePosition = splitPartGene[2];

				if (geneMapping[partID] === undefined) {
					geneMapping[partID] = {};
				}
				geneMapping[partID][genePosition] = geneIdToPartMapping[geneMap];
			};
		}



		let partNameList = [];
		let partIdForKey = 1;

		circuitsPartMapping = circuitsPartMapping[0];

		circuitArray.map((component) => {
			let componentId = component;

			if (typeof component === 'string') {
				componentId = constants.recombinaseToId[component];
			}

			let geneInfo = undefined;

			const partOriginalLocationId = circuitsPartMapping[partIdForKey-1]
			if (geneMapping[partOriginalLocationId]) {
				geneInfo = geneMapping[partOriginalLocationId];
			}
			partIdForKey += 1;

			const recombinaseID = Math.abs(componentId);
			// console.log("[GeneticCircuit:componentDidUpdate()] " + componentId);
			const components = constants.partIdToComponents[recombinaseID];
			// console.log("[GeneticCircuit:componentDidUpdate()] " + components);
			let geneNumber = 1;

			//flip == reverse the base pair sequence and then complement it, so ACAG -> GACA -> CTGT
			let curListLength = partNameList.length;
			components.map((component) => {
				let flip = false;
				if(componentId>0)
				{
					switch(component) {
						case 'R':
							partNameList.push({title:constants.Recombinases[recombinaseID].name, feature:"recombinase", flip:false});
							break;
						case '-P':
							flip = true;
						case 'P':
							partNameList.push({title:"proD",feature:"promoter",flip:flip});
							break;
						case '-G':
							flip = true;
						case 'G':
							const geneIdToAdd = geneInfo[geneNumber];
							const individualGeneInfo = this.getGeneInformation(geneIdToAdd);
							const geneName = individualGeneInfo['geneName'];
							const geneDatabase = individualGeneInfo['database'];
							const secondTitle = individualGeneInfo['secondTitle'];
							partNameList.push({title:geneName, uri:geneDatabase, secondTitle: secondTitle, feature:"CDS", flip:flip});
							geneNumber += 1;
							break;
						case '-T':
							flip = true;
						case 'T':
							partNameList.push({title:"terminator_black",feature:"terminator", flip:flip});
							break;
						case '-t':
							flip = true;
						case 't':
							partNameList.push({title:"terminator_red",feature:"terminator", flip:flip});
							break;
						default:
							break;
					}
				}
				else
				{
					switch(component) {
						case 'R':
							partNameList.splice(curListLength, 0, {title:constants.Recombinases[recombinaseID].flipname, feature:"recombinase", flip:true});
							break;
						case 'P':
							flip = true;
						case '-P':
							partNameList.splice(curListLength, 0, {title:"proD",feature:"promoter",flip:flip});
							break;
						case 'G':
							flip = true;
						case '-G':
							const geneIdToAdd = geneInfo[geneNumber];
							const individualGeneInfo = this.getGeneInformation(geneIdToAdd);
							const geneName = individualGeneInfo['geneName'];
							const geneDatabase = individualGeneInfo['database'];
							const secondTitle = individualGeneInfo['secondTitle'];
							partNameList.splice(curListLength, 0, {title:geneName, uri:geneDatabase, secondTitle: secondTitle, feature:"CDS", flip:flip});
							geneNumber += 1;
							break;
						case 'T':
							flip = true;
						case '-T':
							partNameList.splice(curListLength, 0, {title:"terminator_black",feature:"terminator", flip:flip});
							break;
						case 't':
							flip = true;
						case '-t':
							partNameList.splice(curListLength, 0, {title:"terminator_red",feature:"terminator", flip:flip});
							break;
						default:
							break;
					}
				}
				//Blade: Don't think this is necessary
				// recombinaseID += 1;
			})
		})
		console.log("[CircuitDiagram:clickedDownload()] " + partNameList);
		if(partNameList.length > 0) {
			File.GenerateFile(partNameList)
		}
		
	},

	/*
	* When PDF is clicked, display PDF popup window
	*/
	clickedPDF() {
		this.setState({
			pdfSettings: {
				display: 'block',
			},
		});
	},

	/*
	* When done w/ PDF box
	*	Return to circuit diagram page
	*/
	closeWindow() {
		this.setState({
			pdfSettings: {
				display: 'none',
			},
		});
	},

	onPrintPreviewClicked(startVal, endVal) {
		const data = this.state.data;
		const numCircuits = data[0].length;
		let dataToPrint = [];
		let genePartMapping = [];
		if (endVal > numCircuits) {
			// Correcting for if user types in # of circuits > total # of circuits
			endVal = numCircuits;
		}
		for (var i = (startVal - 1); i < endVal; i++) {
			dataToPrint.push(data[0][i][0][0]);
			let geneIdToPartMapping = data[0][i][1];
			let geneMapping = {};
			if (geneIdToPartMapping.length !== 0) {
				for (let geneMap in geneIdToPartMapping) {
					const splitPartGene = geneMap.split('.');
					//Part id is stored at the second position, the gene position in that part is stored in the third position
					const partID = splitPartGene[1];
					const genePosition = splitPartGene[2];

					if (geneMapping[partID] === undefined) {
						geneMapping[partID] = {};
					}
					geneMapping[partID][genePosition] = geneIdToPartMapping[geneMap];
				};
			}
			genePartMapping.push(geneMapping)
		}
		this.props.onPrintPreviewClicked(dataToPrint, genePartMapping, this.state.data[1][0]);
	},

	render() {
		const pageWidth = this.props.pageWidth;
		const pageHeight = this.props.pageHeight-40;

		/*
		* Styles of components in the bottom half of the page (the induced circuits and
		* the circuit diagram of the system)
		*/
		const oneThirdHeight = pageHeight/3;
		const bottomHalfStyles = {
			height: pageHeight - oneThirdHeight
		};
		const bottomHalfThirdStyles = {
			width: (pageWidth-18)/3,
			float: 'left',
		};

		const pageTitle = this.props.pageTitle;
		const stateExpressions = this.props.stateExpressions;

		const genes = this.props.genes;

		const data = this.state.data;
		const circuitToShow = this.state.circuitToShow;

		const numInputs = this.props.numInputs;

		const customButtonTitle = 'Show next register!'
		let numberOfCircuits = 0;

		let circuitArray = [];
		let allCircuits = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

		let geneIdToPartMapping = [];
		let circuitsPartMapping = [];

		let noCircuitsWereFound = false;
		if (data.length !== 0) {
			numberOfCircuits = this.state.data[0].length;
			//Check for errors
			if (data[0][0] === 'Gene regulation program does not exist' || data[0][0] === 'No registers found' || data[0][0] === 'Design does not exist') {
				// console.log('No circuit was found');
				noCircuitsWereFound = true;
			}
			else {
				// Access by using state as index ... note that index 0 is just a filler (contents = same as index 1)
				allCircuits = [
				data[0][circuitToShow][0][0], data[0][circuitToShow][0][0], data[0][circuitToShow][0][1],
				data[0][circuitToShow][0][2], data[0][circuitToShow][0][3],
				data[0][circuitToShow][0][4], data[0][circuitToShow][0][5],
				data[0][circuitToShow][0][6], data[0][circuitToShow][0][7], data[0][circuitToShow][0][8],
				data[0][circuitToShow][0][9],data[0][circuitToShow][0][10],
				data[0][circuitToShow][0][11],data[0][circuitToShow][0][12],
				data[0][circuitToShow][0][13],data[0][circuitToShow][0][14], data[0][circuitToShow][0][15],
			];
			circuitArray = allCircuits[1];
			geneIdToPartMapping = data[0][circuitToShow][1];
			circuitsPartMapping = data[1];
		}
		}
		/*
		* TODO: determine the gene mappings for the other circuits. Ideally just a mapping
		* from the uninduced circuit that points to where the genes are in the new states (this
		* is an index mapping)
		* Done. (Throughout)
		*/

		/*
		* Determining which state is being hovered over
		*/
		const highlighted = this.state.hoveringOverState;

		/*
		* Create a hash that has key part id which itself holds an array with position 0,1,2 which correspond
		* to genes 1, 2, 3 for that part. So looks like this:
		*	{
		*		5: [0]
		*		7: [1]
		*		9: [2,3]
		*	}
		*/
		let geneMapping = {};
		if (geneIdToPartMapping.length !== 0) {
			for (let geneMap in geneIdToPartMapping) {
				const splitPartGene = geneMap.split('.');
				//Part id is stored at the second position, the gene position in that part is stored in the third position
				const partID = splitPartGene[1];
				const genePosition = splitPartGene[2];

				if (geneMapping[partID] === undefined) {
					geneMapping[partID] = {};
				}
				geneMapping[partID][genePosition] = geneIdToPartMapping[geneMap];
			};
		}

		const popoutCircuit = this.state.popoutCircuit;
		const pdfSettings = this.state.pdfSettings;

		let toReturn = null;
		if (numInputs === 2 && noCircuitsWereFound === false) {
			toReturn = <div>
				<CircuitDiagramNavBar
					pageTitle={pageTitle}
					pageWidth={pageWidth}
					onShowNextCircuit={this.onShowNextCircuit}
					onShowPreviousCircuit={this.onShowPreviousCircuit}
					circuitToShow={circuitToShow}
					numberOfCircuits={numberOfCircuits}
					noCircuitsWereFound={noCircuitsWereFound}
					clickedPDF = {this.clickedPDF}
					clickedDownload = {this.clickedDownload}
				/>
				<GeneticCircuit
					pageWidth={pageWidth}
					pageHeight={oneThirdHeight}
					circuitArray={circuitArray}
					geneMapping={geneMapping}
					circuitsPartMapping={circuitsPartMapping[0]}
					getGeneInformation={this.getGeneInformation}
					noCircuitsWereFound={noCircuitsWereFound}
					isMainCircuit={true}
					highlight={highlighted[0]}
				/>
				<div style={bottomHalfStyles}>
					<div style={bottomHalfThirdStyles}>
						<GeneticCircuit
							pageWidth={bottomHalfThirdStyles.width}
							pageHeight={bottomHalfStyles.height/2}
							circuitArray={allCircuits[2]}
							geneMapping={geneMapping}
							circuitsPartMapping={circuitsPartMapping[1]}
							getGeneInformation={this.getGeneInformation}
							noCircuitsWereFound={noCircuitsWereFound}
							highlight={highlighted[1]}
						/>
						<GeneticCircuit
							pageWidth={bottomHalfThirdStyles.width}
							pageHeight={bottomHalfStyles.height/2}
							circuitArray={allCircuits[4]}
							geneMapping={geneMapping}
							circuitsPartMapping={circuitsPartMapping[3]}
							getGeneInformation={this.getGeneInformation}
							noCircuitsWereFound={noCircuitsWereFound}
							paddingBottom={true}
							highlight={highlighted[3]}
						/>
					</div>
					<div style={bottomHalfThirdStyles}>
						<DiagramIllustration
							height={bottomHalfStyles.height}
							width={bottomHalfThirdStyles.width}
							stateExpressions={stateExpressions}
							genes={genes}
							paddingBottom={true}
							onMouseEnterState={this.onMouseEnterState}
							onMouseLeaveState={this.onMouseLeaveState}
						/>
					</div>
					<div style={bottomHalfThirdStyles}>
						<GeneticCircuit
							pageWidth={bottomHalfThirdStyles.width}
							pageHeight={bottomHalfStyles.height/2}
							circuitArray={allCircuits[3]}
							geneMapping={geneMapping}
							circuitsPartMapping={circuitsPartMapping[2]}
							getGeneInformation={this.getGeneInformation}
							noCircuitsWereFound={noCircuitsWereFound}
							highlight={highlighted[2]}
						/>
						<GeneticCircuit
							pageWidth={bottomHalfThirdStyles.width}
							pageHeight={bottomHalfStyles.height/2}
							circuitArray={allCircuits[5]}
							geneMapping={geneMapping}
							circuitsPartMapping={circuitsPartMapping[4]}
							getGeneInformation={this.getGeneInformation}
							noCircuitsWereFound={noCircuitsWereFound}
							paddingBottom={true}
							highlight={highlighted[4]}
						/>
					</div>
				</div>
				<PDFSettings
						display = {pdfSettings.display}
						numCircuits = {numberOfCircuits}
						closeWindow = {this.closeWindow}
						numInputs = {numInputs}
						onShowNextCircuit = {this.onShowNextCircuit}
						onPrintPreviewClicked = {this.onPrintPreviewClicked}
				/>
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
					customText = {'Restart'}
				/>
			</div>
		} else if (numInputs === 3 && noCircuitsWereFound === false) {
			// Keep hover over the first state & large, overall circuit
			let lastHovered = this.state.lastHovered;
			let circuitHovered = allCircuits[lastHovered];
			toReturn = <div>
				<CircuitDiagramNavBar
					pageTitle={pageTitle}
					pageWidth={pageWidth}
					onShowNextCircuit={this.onShowNextCircuit}
					onShowPreviousCircuit={this.onShowPreviousCircuit}
					circuitToShow={circuitToShow}
					numberOfCircuits={numberOfCircuits}
					noCircuitsWereFound={noCircuitsWereFound}
					clickedPDF = {this.clickedPDF}
				/>
				<GeneticCircuit
					pageWidth={pageWidth}
					pageHeight={oneThirdHeight}
					circuitArray={circuitArray}
					geneMapping={geneMapping}
					circuitsPartMapping={circuitsPartMapping[0]}
					getGeneInformation={this.getGeneInformation}
					noCircuitsWereFound={noCircuitsWereFound}
					highlight={highlighted[0]}
				/>
				<div style={bottomHalfStyles}>
						<DiagramIllustration3Input
							height={bottomHalfStyles.height}
							width={pageWidth}
							stateExpressions={stateExpressions}
							genes={genes}
							paddingBottom={true}
							onMouseEnterState={this.onMouseEnterState}
							onMouseLeaveState={this.onMouseLeaveState}
						  radius = {20}
						/>
				</div>
				<PopoutWindow
							display = {popoutCircuit.display}
							circuit = {circuitHovered}
							width = {pageWidth}
							height = {pageHeight}
							geneMapping={geneMapping}
							circuitsPartMapping={circuitsPartMapping[lastHovered - 1]}
							getGeneInformation={this.getGeneInformation}
							noCircuitsWereFound={noCircuitsWereFound}
							paddingBottom={true}
							highlight={false}
				/>
				<PDFSettings
						display = {pdfSettings.display}
						numCircuits = {numberOfCircuits}
						closeWindow = {this.closeWindow}
						numInputs = {numInputs}
						onShowNextCircuit = {this.onShowNextCircuit}
						onPrintPreviewClicked = {this.onPrintPreviewClicked}
			  />
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
					customText = {'Restart'}
				/>
			</div>
		}
		else if (noCircuitsWereFound) {
			if (numInputs === 2) {
				toReturn =
				<div>
				<CircuitDiagramNavBar
					pageTitle={pageTitle}
					pageWidth={pageWidth}
					onShowNextCircuit={this.onShowNextCircuit}
					onShowPreviousCircuit={this.onShowPreviousCircuit}
					circuitToShow={circuitToShow}
					numberOfCircuits={numberOfCircuits}
					noCircuitsWereFound={noCircuitsWereFound}
					clickedPDF = {this.clickedPDF}
				/>
				<DiagramIllustration
					height={pageHeight - 50}
					width={pageWidth}
					stateExpressions={stateExpressions}
					genes={genes}
					paddingBottom={true}
					onMouseEnterState={this.onMouseEnterState}
					onMouseLeaveState={this.onMouseLeaveState}
				/>
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
					customText = {'Restart'}
				/>
				</div>
			}
			else if (numInputs === 3) {
				toReturn =
				  <div>
					<CircuitDiagramNavBar
						pageTitle={pageTitle}
						pageWidth={pageWidth}
						onShowNextCircuit={this.onShowNextCircuit}
						onShowPreviousCircuit={this.onShowPreviousCircuit}
						circuitToShow={circuitToShow}
						numberOfCircuits={numberOfCircuits}
						noCircuitsWereFound={noCircuitsWereFound}
						clickedPDF = {this.clickedPDF}
					/>
					<DiagramIllustration3Input
					height={pageHeight - 50}
					width={pageWidth}
					stateExpressions={stateExpressions}
					genes={genes}
					paddingBottom={true}
					onMouseEnterState={this.onMouseEnterState}
					onMouseLeaveState={this.onMouseLeaveState}
				  radius = {20}
				/>
				<BottomNav
					width={pageWidth}
					onNextClick={this.onNextClick}
					linkText={"First time using the app? Learn how here!"}
					onTutorialClick={this.onTutorialClick}
					customText = {'Restart'}
				/>
				</div>
			}
		}
		return (
			toReturn
		);
	}
});

const circuitDiagramNavBarStyles = {
	navBarStyles: {
		height: 40,
		backgroundColor: '#66ccff',
		marginTop: '-8px',
		marginLeft: '-8px',
		marginRight: '-8px',
		paddingLeft: '8px',
		color: 'white'
	},
	divsOfSvg: {
		float: 'left',
	},
	svgBoxStyles: {
		width: 100,
		height: 40,
	},
	nextButtonStyles: {
		stroke: 'white',
		strokeWidth: 1,
		fill: 'white',
		cursor: 'pointer',
		color: '#66ccff',
		transition: 'all 0.3s ease 0s',
	},
	previousButtonStyles: {
		stroke: 'white',
		strokeWidth: 1,
		fill: 'white',
		cursor: 'pointer',
		color: '#66ccff',
		transition: 'all 0.3s ease 0s',
	},
	titleStyles: {
		width: 200,
		textAlign: 'center',
		fontFamily: 'Open Sans, sans-serif',
		float: 'left',
		height: 40,
		lineHeight: '40px',
	},
	arrowTextStyle: {
		fontFamily: 'Open Sans, sans-serif',
		fontSize: "10px",
		fill: '#66ccff',
		cursor: 'pointer',
		textAnchor: 'middle',
		WebkitUserSelect: 'none',
		MozUserSelect: 'none',
		KhtmlUserSelect: 'none',
		MsUserSelect: 'none'
	},
	printButtonStyle: {
		float: 'right',
		backgroundColor: 'white',
		color: '#66ccff',
	}
}
/*
* Custom nav bar for the circuit diagram page that allows the user to navigate between
* different circuit designs
*/
const CircuitDiagramNavBar = React.createClass({
	/*
	* The state includes:
	* 	nextHover:
	*		true or false, whether the mouse is positioned over the next circuit button
	*	prevHover:
	*		same as nextHover, but for the previous button
	*/
	getInitialState() {
		return {
			nextHover: false,
			prevHover: false,
			printHover: false,
		};
	},
	/*
	* The four functions below handle the animation when the user mouses over the buttons.
	* TODO: add animation so that the button appears pressed when clicked
	*/
	onMouseEnterNext() {
		this.setState({
			nextHover: true
		})
	},
	onMouseEnterPrev() {
		this.setState({
			prevHover: true
		})
	},
	onMouseLeavePrev() {
		this.setState({
			prevHover: false
		})
	},
	onMouseLeaveNext() {
		this.setState({
			nextHover: false,
		});
	},
	onMouseEnterPrint() {
		this.setState({
			printHover: true
		})
	},
	onMouseLeavePrint() {
		this.setState({
			printHover: false
		})
	},

	/*
	* Show the next circuit
	*/
	onShowNextCircuit() {
		// console.log("CircuitDiagramNavBar show next circuit");
		this.props.onShowNextCircuit();
	},
	/*
	* Show the previous circuit
	*/
	onShowPreviousCircuit() {
		this.props.onShowPreviousCircuit();
	},

	/*
	* When PDF is clicked, display PDF popup window
	*/
	clickedPDF() {
		this.props.clickedPDF();
	},

	clickedDownload(){
		this.props.clickedDownload();
		// window.location.href='data:application/octet-stream;charset=utf-8;base64,Zm9vIGJhcg=='; 
	},

	render() {
		const pageTitle = this.props.pageTitle;
		const pageWidth = this.props.pageWidth;

		const elementWidths = 100 + 200 + 100;
		const buffer = (pageWidth - elementWidths)/2;

		const circuitToShow = this.props.circuitToShow;
		const numberOfCircuits = this.props.numberOfCircuits;

		const noCircuitsWereFound = this.props.noCircuitsWereFound;

		let circuitNumberFraction = '';
		if (this.props.noCircuitsWereFound) {
			circuitNumberFraction = 'No registers were found';
		}
		else if (numberOfCircuits === 0) {
			circuitNumberFraction = 'Register diagram loading...';
		}
		else {
			circuitNumberFraction = 'Register ' + (circuitToShow+1) + '/' + numberOfCircuits + ' Diagram';

		}

		let nextButtonStyles = JSON.parse(JSON.stringify(circuitDiagramNavBarStyles.nextButtonStyles));
		let previousButtonStyles = JSON.parse(JSON.stringify(circuitDiagramNavBarStyles.previousButtonStyles));

		//TODO: hover stuff for the arrows. done
		if (this.state.nextHover) {
			nextButtonStyles.fill = '#C8C8CA';
			nextButtonStyles.stroke = '#C8C8CA';
		}
		else {
			nextButtonStyles.fill = 'white';
			nextButtonStyles.stroke = 'white';
		}
		if (this.state.prevHover) {
			previousButtonStyles.fill = '#C8C8CA';
			previousButtonStyles.stroke = '#C8C8CA';
		}
		else {
			previousButtonStyles.fill = 'white';
			previousButtonStyles.stroke = 'white';
		}

		const printButtonStyle = JSON.parse(JSON.stringify(circuitDiagramNavBarStyles.printButtonStyle));
		if (this.state.printHover) {
			printButtonStyle.fill = '#C8C8CA';
			printButtonStyle.stroke = '#C8C8CA';
		}
		else {
			printButtonStyle.fill = 'white';
			printButtonStyle.stroke = 'white';
		}

		const navBarStyles = circuitDiagramNavBarStyles.navBarStyles;
		const divsOfSvg = circuitDiagramNavBarStyles.divsOfSvg;
		const svgBoxStyles = circuitDiagramNavBarStyles.svgBoxStyles;
		const titleStyles = circuitDiagramNavBarStyles.titleStyles;
		const bufferStyle = { width: buffer, height: 40, float: 'left' };
		const arrowTextStyle = circuitDiagramNavBarStyles.arrowTextStyle;

		const previousPoints = "40,20 60,10 60,15 100,15 100,25 60,25 60 30";
		const nextPoints = "0,15 40,15 40,10 60,20 40,30 40,25 0,25";

		let toReturn = null;
		if (noCircuitsWereFound) {
			// Do not show PDF button
			toReturn = <div style={navBarStyles}>
				<div style={bufferStyle}></div>
				<div style={divsOfSvg}>
					<svg width={svgBoxStyles.width} height={svgBoxStyles.height}>
						<polygon
							points={previousPoints}
							style={previousButtonStyles}
							onClick={this.onShowPreviousCircuit}
							onMouseEnter={this.onMouseEnterPrev}
							onMouseLeave={this.onMouseLeavePrev}
						/>
						<text x="70" y="23.5" style={arrowTextStyle}
							onClick={this.onShowPreviousCircuit}
							onMouseEnter={this.onMouseEnterPrev}
							onMouseLeave={this.onMouseLeavePrev}
						>
							Previous
						</text>
					</svg>
				</div>
				<div style={titleStyles}>{circuitNumberFraction}</div>
				<div style={divsOfSvg}>
					<svg width={svgBoxStyles.width} height={svgBoxStyles.height}>
						<polygon
							points={nextPoints}
							style={nextButtonStyles}
							onClick={this.onShowNextCircuit}
							onMouseEnter={this.onMouseEnterNext}
							onMouseLeave={this.onMouseLeaveNext}
						/>
						<text x="30" y="23.5" style={arrowTextStyle}
							onClick={this.onShowNextCircuit}
							onMouseEnter={this.onMouseEnterNext}
							onMouseLeave={this.onMouseLeaveNext}
						>
							Next
						</text>
					</svg>
				</div>
				<div style={bufferStyle}></div>
			</div>
		} else {
			// Then circuits were found
			// Show pdf button
			toReturn =
			<div style={navBarStyles}>
							<div style={bufferStyle}></div>
							<div style={divsOfSvg}>
								<svg width={svgBoxStyles.width} height={svgBoxStyles.height}>
									<polygon
										points={previousPoints}
										style={previousButtonStyles}
										onClick={this.onShowPreviousCircuit}
										onMouseEnter={this.onMouseEnterPrev}
										onMouseLeave={this.onMouseLeavePrev}
									/>
									<text x="70" y="23.5" style={arrowTextStyle}
										onClick={this.onShowPreviousCircuit}
										onMouseEnter={this.onMouseEnterPrev}
										onMouseLeave={this.onMouseLeavePrev}
									>
										Previous
									</text>
								</svg>
							</div>
							<div style={titleStyles}>{circuitNumberFraction}</div>
							<div style={divsOfSvg}>
								<svg width={svgBoxStyles.width} height={svgBoxStyles.height}>
									<polygon
										points={nextPoints}
										style={nextButtonStyles}
										onClick={this.onShowNextCircuit}
										onMouseEnter={this.onMouseEnterNext}
										onMouseLeave={this.onMouseLeaveNext}
									/>
									<text x="30" y="23.5" style={arrowTextStyle}
										onClick={this.onShowNextCircuit}
										onMouseEnter={this.onMouseEnterNext}
										onMouseLeave={this.onMouseLeaveNext}
									>
										Next
									</text>
								</svg>
							</div>
							<input
								type = {'button'} value = {'Download .gb File'}
								onClick = {this.clickedDownload} style = {printButtonStyle}
								onMouseEnter = {this.onMouseEnterPrint} height="31" onMouseLeave = {this.onMouseEnterPrint}/>
							<input
								type = {'button'} value = {'Print Preview'}
								onClick = {this.clickedPDF} style = {printButtonStyle}
								onMouseEnter = {this.onMouseEnterPrint} height="31" onMouseLeave = {this.onMouseEnterPrint}/>
							<div style={bufferStyle}></div>
						</div>
		}
		return (
			toReturn
		);
	}
});

const popoutStyles = {
	divStyle: {
		position: 'absolute',
		backgroundColor: '#8fcceb',
		top: '40%',
		left: '30%',
		marginTop: '-50px',
		marginLeft: '-50px',
		pointerEvents: 'none',
	},
	circuitStyle: {
		position: 'absolute',
		top: '50%',
		marginTop: '-50px',
		marginLeft: '15px',
	}
};

const PopoutWindow = React.createClass({
	render() {
		const width = this.props.width;
		const height = this.props.height;

		let popStyle = JSON.parse(JSON.stringify(popoutStyles.divStyle));
		popStyle.width = width/2;
		popStyle.display = this.props.display;
		popStyle.height = height/2;

		const circuitArray = this.props.circuit;
		const geneMapping = this.props.geneMapping;
		const circPartMap = this.props.circuitsPartMapping;
		const geneInfo = this.props.getGeneInformation;
		const noCircFound = this.props.noCircuitsWereFound;
		const highlight = this.props.highlight;

		let circuitStyle = JSON.parse(JSON.stringify(popoutStyles.circuitStyle));
		circuitStyle.width = popStyle.width;
		circuitStyle.height = popStyle.height/2;

		return (
			<div style = {popStyle}>
				<div style = {circuitStyle}>
					<GeneticCircuit
						pageWidth={popStyle.width}
						pageHeight={popStyle.height/2}
						circuitArray={circuitArray}
						geneMapping={geneMapping}
						circuitsPartMapping={circPartMap}
						getGeneInformation={geneInfo}
						noCircuitsWereFound={noCircFound}
						paddingBottom = {true}
						highlight={highlight}
					/>
				</div>
			</div>
		);
	}
});

const settingsStyles = {
  divStyle: {
    position: 'absolute',
    backgroundColor: '#abd3e8',
    top: '47%',
    left: '43%',
    marginTop: '-50px',
    marginLeft: '-50px',
		fontFamily: 'Open Sans, sans-serif',
		stroke: 'black',
		strokeWidth: '3px',
  },
	alignment: {
		textAlign: 'center',
		float: 'center',
	},
	closeButton: {
		float: 'left',
		backgroundColor: 'white',
	},
	enterButton: {
		float: 'right',
		backgroundColor: 'white',
	}
}

// This is the pop-out window to create the PDF
const PDFSettings = React.createClass({

	getInitialState: function() {
    return {
			startVal: '1',
			endVal: '1',
			doc: new jsPDF('portrait', 'pt'),
			circIndex: 0,
			counter: 0,
		};
  },

  handleChange: function(event) {
    this.setState({startVal: event.target.value});
  },

	handleChange2: function(event) {
		this.setState({endVal: event.target.value});
	},

	submit: function() {
		// PDF is ready to be made w/ the current numCircuits
		// Close window -- return to circuits
		this.props.closeWindow();
		// Create PDF
		//this.createPDF();
		// Create printPreview page ----> link
		this.onPrintPreviewClicked();
	},

	getGeneInformation: function() {
		this.props.getGeneInformation();
	},

	onShowNextCircuit: function() {
		// console.log("PDF show next circuit");
		this.props.onShowNextCircuit();
	},

	onPrintPreviewClicked: function() {
		// TODO: expand error checking
		if (this.state.startVal > this.state.endVal) {
			// Corrects for accidental swap of start and end vals
			let startVal = startVal;
			let endVal = endVal;
			this.setState({
				startVal: endVal,
				endVal: startVal,
			})
		};
		this.props.onPrintPreviewClicked(this.state.startVal, this.state.endVal);
	},

	closeWindow: function() {
		this.props.closeWindow();
	},

  render() {
    let settingsStyle = JSON.parse(JSON.stringify(settingsStyles.divStyle));
    settingsStyle.width = 220;
    settingsStyle.height = 100;
    settingsStyle.display = this.props.display;
		const alignStyle = JSON.parse(JSON.stringify(settingsStyles.alignment));
		const closeButton = JSON.parse(JSON.stringify(settingsStyles.closeButton));
		const enterButton = JSON.parse(JSON.stringify(settingsStyles.enterButton));
    return (
			<div style = {settingsStyle}>
				<div style = {alignStyle}>
					{"Register Range: "}
				</div>
				<div style = {alignStyle}>
					{"Start: "}
					<input type = "text" value = {this.state.startVal} onChange = {this.handleChange}/>
			  </div>
				<div style = {alignStyle}>
					{"End:   "}
					<input type = "text" value = {this.state.endVal} onChange = {this.handleChange2}/>
				</div>
				<div>
					<input type ={'button'} value = {'X'} onClick = {this.closeWindow} style = {closeButton}/>
					<input type ={'button'} value = {'Enter'} onClick = {this.submit} style = {enterButton}/>
				</div>
			</div>
    );
  }
});

module.exports = CircuitDiagram;
