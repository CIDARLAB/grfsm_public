'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var GeneList = require("./GeneList");
var NavBar = require("./NavBar");
var BottomNav = require('./BottomNav');
var AddNameInput = require('./AddNameInput');
var EditPageBody = require('./EditPageBody');
/*
* Page that explains briefly how to interact with the application
*/
const tutorialPageStyles = {
	explanationParagraph: {
		clear: 'both',
		padding: 10,
		fontFamily: 'Hind, sans-serif',
	},
	editPageBodyStyles: {
		margin: 'auto',
		fontFamily: 'Open Sans, sans-serif',
	},
	geneListStyles: {
		textAlign: 'center'
	}
};
const TutorialPage = React.createClass({
	/*
	* The state includes:
	*	geneListGeneName:
	*		this is the name that the user is entering for the top list
	*	stateEditGeneName:
	*		this is the name that the user is entering for the bottom list
	*	geneListGenes:
	*		the list of genes in the top list
	*	stateEditGenes:
	*		the list of genes in the bottom list
	*	stateEditGenesSelected:
	*		dictionary containg the ids of genes and whether or not they are selected
	*		in the list (whether they are expressed in the state diagram)
	*	dragging:
	*		whether or not an element is currently being dragged
	*	geneDragged:
	*		information about the gene currently being dragged
	*	circleFill:
	*		the colors that should be included in the fill of the circle
	*/
	getInitialState() {
		return {
			geneListGeneName: '',
			stateEditGeneName: '',
			geneListGenes: [],
			stateEditGenes: [{
				id: 0,
				geneName: "GFP",
				color: "#1ABD06",
			},
			{
				id: 1,
				geneName: 'RFP',
				color: '#DE0D0D',
			}],
			stateEditGenesSelected: {},
			dragging: false,
			geneDragged: {},
			circleFill: 'white',
		};
	},
	onNextClick() {
		this.props.onNextClick();
	},
	onGeneListUserEnter() {
		const newGeneName = this.state.geneListGeneName;
		const newID = this.state.geneListGenes.length;

		//Chooses the color to associate with this gene randomly at first
		let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);;

		const genes = this.state.geneListGenes.concat({
			id: newID,
			geneName: newGeneName,
			color: color,
		});
		this.setState({
			geneListGeneName: '',
			geneListGenes: genes,
		});
	},
	onGeneListChangeName(newName) {
		this.setState({
			geneListGeneName: newName,
		});
	},
	onGeneListDelete(id) {
		const genes = this.state.geneListGenes;
		let newGenesArray = [];
		for (let index in genes) {
			const gene = genes[index];
			if (gene.id !== id) {
				newGenesArray.push(gene);
			}
		}
		this.setState({
			geneListGenes: newGenesArray,
		});
	},
	onGeneListChangeColor(geneId, color) {
		const genes = this.state.geneListGenes;
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
			geneListGenes: newGenesArray,
		});
	},
	onStateEditDrop() {
		const circleFill = this.state.geneDragged.color;
		const geneSelectedId = this.state.geneDragged.geneId;
		let genesSelected = this.state.stateEditGenesSelected;
		genesSelected[geneSelectedId] = true;

		this.setState({
			dragging: false,
			geneDragged: {},
			circleFill: circleFill,
			stateEditGenesSelected: genesSelected,
		});
	},
	onStateEditDrag(geneId, color) {
		this.setState({
			dragging: true,
			geneDragged: {
				geneId: geneId,
				color: color
			}
		});
	},
	onStateEditUndoSelection(geneId) {
		let genesSelected = this.state.stateEditGenesSelected;
		genesSelected[geneId] = false;

		this.setState({
			stateEditGenesSelected: genesSelected,
		});
	},
	onStateEditUserEnter() {
		const newGeneName = this.state.stateEditGeneName;
		const newID = this.state.stateEditGenes.length;

		//Chooses the color to associate with this gene randomly at first
		let color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);;

		const genes = this.state.stateEditGenes.concat({
			id: newID,
			geneName: newGeneName,
			color: color,
		});
		this.setState({
			stateEditGeneName: '',
			stateEditGenes: genes,
		});
	},
	onStateEditChangeName(newName) {
		this.setState({
			stateEditGeneName: newName,
		});
	},
	onStateEditChangeColor(geneId, color) {
		const genes = this.state.stateEditGenes;
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
			stateEditGenes: newGenesArray,
		});
	},
	render() {
		const explanationParagraph = tutorialPageStyles.explanationParagraph;
		const pageWidth = this.props.pageWidth;

		const tutorialElementWidths = Math.min(400, pageWidth-40);
		const bottomTutorialElementWidth = pageWidth-40;

		const editBodyHeight = 200;

		const geneListGeneName = this.state.geneListGeneName;
		const stateEditGeneName = this.state.stateEditGeneName;

		const geneListGenes = this.state.geneListGenes;
		const stateEditGenes = this.state.stateEditGenes;

		const stateEditGenesSelected = this.state.stateEditGenesSelected;

		const circleFill = 'white';

		let editPageBodyStyles = JSON.parse(JSON.stringify(tutorialPageStyles.editPageBodyStyles));
		editPageBodyStyles.width = pageWidth;

		let geneListStyles = JSON.parse(JSON.stringify(tutorialPageStyles.geneListStyles));
		geneListStyles.width = pageWidth;

		return(
		<div>
		<NavBar pageTitle={'Tutorial page'} toolTipText={"Learn how to use the application by reading though the instructions on this page!"}/>
		<div>
			<div style={explanationParagraph}>
				The first screen you come to prompts you to add genes to a currently empty list.
				Using the input text box, type in the name of the genes you want to include in
				your system. If you do not know what these are yet, you can add them later as well.
				Once you have added a gene and hit enter or clicked on the 'add gene' button, you
				will see the gene you created appear in the list. You can change the color
				assigned to this gene by clicking the 'choose color...' link. This will change the
				color of the box next to that gene's name to the color selected. Try adding,
				removing (by clicking on the 'x'), and changing the colors of a few genes.
			</div>
			<div>
				<AddNameInput
					height={50}
					width={tutorialElementWidths}
					newGeneName={geneListGeneName}
					onUserEnter={this.onGeneListUserEnter}
					changeGeneName={this.onGeneListChangeName}
					centerInput={true}
				/>
				<GeneList
						width={tutorialElementWidths}
						genes={geneListGenes}
						onDeleteClick={this.onGeneListDelete}
						onUserChangeColor={this.onGeneListChangeColor}
						displayColorPicker={1}
						centerList={true}
						maxHeight={150}
				/>
			</div>
			<div style={explanationParagraph}>
				After hitting the continue button, you will see the page containing the overall
				state diagram. Each circle represents one of the states and the colored arrows
				represents how to transitiion between each state. A blank white circle means that
				a state does not express any genes while circles that are striped have one or more
				genes being expressed (with the color of the stripes associated with the genes
				expressed in that state). To edit a given state, click on the circle corresponding
				to the state you want to edit which will take you to the page described below.
			</div>
			<div style={explanationParagraph}>
				To edit a given state, you will see a state circle on the left side of the page
				and a list of genes on the right side. Genes can be added to this list and the colors
				of the different genes can be changed as well. To have a gene expressed in this state,
				simply drag and drop the gene you want to have expressed into the circle. Stripes
				corresponding to that gene's color will appear in the circle and the name of the gene
				will be highlighted in green in the list, indicating that this gene is expressed.
				When you are done editting the gene expression in this state, hit the continue button
				to return to the state diagram page.
			</div>
			<div style={editPageBodyStyles}>
				<EditPageBody
					width={bottomTutorialElementWidth}
					height={editBodyHeight}
					genes={stateEditGenes}
					circleFill={circleFill}
					onDrop={this.onStateEditDrop}
					onDrag={this.onStateEditDrag}
					genesSelected={stateEditGenesSelected}
					onUndoSelection={this.onStateEditUndoSelection}
					newGeneName={stateEditGeneName}
					onUserEnter={this.onStateEditUserEnter}
					changeGeneName={this.onStateEditChangeName}
					onUserChangeColor={this.onStateEditChangeColor}
					geneListMaxHeight={100}
				/>
				</div>
			<div style={explanationParagraph}>
				Once you are done setting up the design of your system, click continue to see what
				circuits will give you your desired design. Some designs have many circuits while
				others have none at all. Depending on your design, you will be able to view
				all its circuits on the next page.
			</div>
		</div>
		<BottomNav
			width={pageWidth-20}
			onNextClick={this.onNextClick}
			linkText={""}
			customText={'Back to app'}
		/>
		</div>
		);
	}
});

module.exports = TutorialPage;
