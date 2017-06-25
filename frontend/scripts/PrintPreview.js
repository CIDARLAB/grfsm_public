'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');
var $ = require('jQuery');

var NavBar = require('./NavBar');
var BottomNav = require('./BottomNav');
var GeneticCircuit = require('./GeneticCircuit');
var DiagramIllustration = require('./DiagramIllustration');
var DiagramIllustration3Input = require('./DiagramIllustration3Input');

const PrintPreview = React.createClass({

	returnToCircuitPage: function() {
		this.props.returnToCircuitPage();
	},

	printScreen: function() {
		// Make the two buttons disappear
    let div = document.getElementById('buttons');
    div.style.visibility = 'hidden';
		window.print();
		div.style.visibility = 'visible';
	},

	render() {
		const pageWidth = this.props.pageWidth;
		const pageHeight = this.props.pageHeight;
		const numInputs = this.props.numInputs;

		const genes = this.props.genes;
		const stateExpressions = this.props.stateExpressions;

		const circuitsPartMapping = this.props.circuitsPartMapping;
		const geneMapping = this.props.geneMapping;
		const getGeneInfo = this.props.getGeneInformation;

		// This data holds the circuits from the startVal -> endVal to be rendered
		const dataToPrint = this.props.dataToPrint;

		//console.log(dataToPrint);

		let diagram = null;
		if (numInputs === 2) {
			diagram =  <DiagramIllustration
										height={pageHeight/2}
										width={pageWidth/2}
										stateExpressions={stateExpressions}
										genes={genes}
										paddingBottom={true}
									/>
		}

		else if (numInputs === 3) {
			diagram =  <DiagramIllustration3Input
										height={pageHeight/2}
										width={pageWidth/2}
										stateExpressions={stateExpressions}
										genes={genes}
										paddingBottom={true}
										radius = {20}
									/>
		}

		let toReturn = diagram; //Change ...

		let dataID = 0;
		let circuit = null;
		/*
		<CornerButton customText = {'Back'} onClick = {this.returnToCircuitPage} width = {75}/>
		<CornerButton customText = {'Print'} onClick = {this.printScreen} width = {75}/>
		*/
		return (
			<div>
				<div id = {'buttons'}>
					<input type = {'button'} value = {'Back'} onClick = {this.returnToCircuitPage}/>
					<input type = {'button'} value = {'Print'} onClick = {this.printScreen}/>
				</div>
				<div id ={'circuits'}>
					{diagram}
					{dataToPrint.map((data) => {
						// console.log(dataID);
						circuit = <GeneticCircuit
											pageWidth={pageWidth}
											pageHeight={150}
											circuitArray={data}
											geneMapping={geneMapping[dataID]}
											circuitsPartMapping={circuitsPartMapping}
											getGeneInformation={getGeneInfo}
											noCircuitsWereFound={false}
											key = {dataID}
										/>
				  dataID += 1;
					return circuit;
					})}
			</div>
		</div>
		)
	}
});

module.exports = PrintPreview;
