'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var ColorsPicker = require('react-colors-picker');
var ToolTip = require('./ToolTip');

//Gene list component
const geneListStyles = {
	noGenesDivStyle: {
		textAlign: 'center',
		height: 260,
		lineHeight: '260px',
	},
	geneElementContainerStyle: {
		maxHeight: 260,
		overflowY: 'auto',
		borderRadius: '0px 0px 10px 10px',
		paddingBottom: 8,
	},
	divStyle: {
			height: 300,
			marginTop: 10,
			borderRadius: '5px 5px 10px 10px',
			border: '1px solid black',
			overflow: 'hidden',
		},
		headerStyle: {
			borderRadius: '5px 5px 0px 0px',
			backgroundColor: '#66ccff',
			paddingLeft: 5,
			height: 40,
			fontSize: 30,
		  fontFamily: 'Open Sans, sans-serif',
			color: 'white', //was 'black'
		}
	};
/*
* GeneList
*
* A list of gene elements. Used on the gene addition page as well as the state edit
* page to see which genes are available in the state machine
*/
const GeneList = React.createClass({
	onUndoSelection(geneId) {
		this.props.onUndoSelection(geneId);
	},
	onUserChangeColor(geneId, color) {
		this.props.onUserChangeColor(geneId, color);
	},
	/* How to react to drag event */
	onDrag(geneId, color) {
		this.props.onDrag(geneId, color);
	},
	/*
	* How to react to the delete button being clicked (generally, on an individual
	* geneElement
	*/
	onDeleteClick(geneId) {
		this.props.onDeleteClick(geneId);
	},
	/* Renders the component */
	render() {
		const width = this.props.width;
		const elementHeight = 45;
		const draggableElement = this.props.draggableElements;
		const displayColorPicker = this.props.displayColorPicker;

		/*
		* Removes the error message that occurs in the browser, which was happening because
		* the original divStyle object (at the top) was being changed before, because
		* a reference was being passed of it rather than the object being copied. This copys
		* the object, but we will have to see if there are any bugs or performance problems
		* from doing it this way
		*/
		let divStyle = (JSON.parse(JSON.stringify(geneListStyles.divStyle)));
		divStyle['width'] = width;

		//For the tutorial page
		if (this.props.centerList) {
			divStyle.margin = 'auto';
		}
		let headerStyle = geneListStyles.headerStyle;

		let genes = this.props.genes;
		const genesSelected = this.props.genesSelected;

		let noGenesDivStyle = JSON.parse(JSON.stringify(geneListStyles.noGenesDivStyle));
		let geneElementContainerStyle = JSON.parse(JSON.stringify(geneListStyles.geneElementContainerStyle));
		if (this.props.maxHeight !== undefined) {
			divStyle.height = this.props.maxHeight;

			const containerHeight = this.props.maxHeight - 40;
			geneElementContainerStyle.maxHeight = containerHeight;
			geneElementContainerStyle.height = containerHeight;
			noGenesDivStyle.height = containerHeight;
			noGenesDivStyle.lineHeight = containerHeight + 'px';
		}

		let noGenesDiv = null;
		if (genes.length === 0) {
			noGenesDiv = <div style={noGenesDivStyle}>No genes have been added yet!</div>;
		}
		return (
			<div style={divStyle}>
				<header style={headerStyle}>Genes in State Machine</header>
					<div style={geneElementContainerStyle}>
					{noGenesDiv}
					{genes.map((gene) => {
						const geneId = gene.id;
						let backgroundColor = 'transparent';

						//On the Adding gene page, there is no need for state
						//Expression to be known, so it is not passed meaning that
						//this.props.genesSelected is undefined, so we want to check for
						//that here before conitnuing
						if (genesSelected) {
							if (genesSelected[geneId]) {
								backgroundColor = 'rgba(36, 109, 218, 0.5)'
							}
						}
						return <GeneElement
							key={gene.id}
							geneId={gene.id}
							geneName={gene.geneName}
							color={gene.color}
							width={width}
							elementHeight={elementHeight}
							draggable={draggableElement}
							onDrag={this.onDrag}
							backgroundColor={backgroundColor}
							onUndoSelection={this.onUndoSelection}
							onDeleteClick={this.onDeleteClick}
							onUserChangeColor={this.onUserChangeColor}
							displayColorPicker={displayColorPicker}
						/>;
					})}
				</div>
			</div>
		);
	}
});

//GeneElement styling
let geneElementStyles = {
	divStyle: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: 10,
		//borderTop: '1px solid #C3C3C3',
		//TODO: fix the gene list last element so that its border shows correctly. The
		//reason it is incorrect at the moment is because of the rounded corners of the gene
		//list element
		borderBottom: '1px solid #C3C3C3',
		paddingRight: 10,
	},
	dragDivStyle: {
		display: 'flex',
		alignItems: 'center',
		cursor: 'pointer',
	},
	spanStyle: {
		paddingLeft: 10,
		paddingRight: 10,
	},
};
/*
* GeneElement
*
* A single element in the gene list, corresponding to a gene. Displays the gene
* name, color chosen for it as well as a remove button to remove it from the list
*/
const GeneElement = React.createClass({
	onUndoSelection() {
		this.props.onUndoSelection(
			this.props.geneId
		);
	},
	onUserChangeColor(target) {
		this.props.onUserChangeColor(
			this.props.geneId,
			target.color
		);
	},
	/*
	* What happens when the element is dragged
	*/
	onDrag(evt) {
		this.props.onDrag(
			this.props.geneId,
			this.props.color
		);
	},
	/*
	* What to do when the delete button is clicked
	*/
	onDeleteClick() {
		this.props.onDeleteClick(
			this.props.geneId
		);
	},
	/* The render function, to create the element */
	render() {
		const geneName = this.props.geneName;
		const color = this.props.color;
		const width = this.props.width;
		const height = this.props.elementHeight;
		const draggable = this.props.draggable;
		const displayColorPicker = this.props.displayColorPicker;

		let divStyle = JSON.parse(JSON.stringify(geneElementStyles.divStyle));
		divStyle.width = width-divStyle.paddingLeft-divStyle.paddingRight;
		divStyle.height = height;
		divStyle.backgroundColor = this.props.backgroundColor;

		let dragDivStyle = JSON.parse(JSON.stringify(geneElementStyles.dragDivStyle));
		dragDivStyle.width = divStyle.width-20;

		let spanStyle = JSON.parse(JSON.stringify(geneElementStyles.spanStyle));
		spanStyle.width = width-150;

		const colorsPickerStyle = {
			fontSize: 10,
		};

		let colorPickerComponent = null;
		if (displayColorPicker === 1) {
			colorPickerComponent = 	<ColorsPicker
					color={color}
					onChange={this.onUserChangeColor}
					placement="bottomRight"
					trigger={<span style="background-color:transparent;cursor:pointer;width:20px;" className='react-custom-trigger'>Choose color...</span>}
				/>;
		}
		//TODO: remove color picker on none gene adding screens. Not doing
		//TODO: create a little dialog box that tells you what the button does
		return (
			<div style={divStyle}>
				<div style={dragDivStyle} draggable={draggable} onDragStart={this.onDrag}>
					<ChooseColorBox size={12} color={color}/>
					<span style={spanStyle}>{geneName}</span>
				</div>
				{colorPickerComponent}
				<DeleteButton
					onClick={this.onDeleteClick}
					onMouseEnter={this.onDeleteButtonMouseEnter}
					onMouseLeave={this.onDeleteButtonMouseLeave}
				/>
			</div>
		);
	}
});

//Has a width of 20px
//TODO: the box will be set based by the color chosen in the color picker.
//To choose a color, there will be a link (in blue or whatever, in a span)
//that the user can click which will bring up the color picker. Color picked
//alsoe should only appear
const ChooseColorBox = React.createClass({
	render() {
		const size = this.props.size;
		const color = this.props.color;

		const boxStyle = {
			height: size,
			width: size,
			backgroundColor: color,
		};
		return (
			<div style={boxStyle}>

			</div>
		);
	}
});

//Has a width of 30px
const deleteButtonStyles = {
	divStyle: {
		width: 10,
		height: 10,
		paddingLeft: 10,
		paddingRight: 10,
		cursor: 'pointer',
	}
};
/*
* DeleteButton
*
* Creates an 'X' that the user can click to usually call some kind of deleting event
*/
const DeleteButton = React.createClass({
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
				top: parseInt(coordinates.top) + 20,
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
	onClick() {
		this.props.onClick();
	},
	render() {
		const divStyle = deleteButtonStyles.divStyle;
		const width = divStyle.width;
		const height = divStyle.height;

		const toolTip = this.state.toolTip;

		return (
			<div style={divStyle}>
				<svg width={width} height={height}
					onClick={this.onClick}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				>
					<g stroke="red">
						<line x1="0" y1="0" x2="10" y2="10" strokeWidth="2" />
						<line x1="0" y1="10" x2="10" y2="0" strokeWidth="2" />
					</g>
				</svg>
				<ToolTip
					display={toolTip.display}
					left={toolTip.left}
					top={toolTip.top}
					width={80}
					toolTipText={'This button removes the gene from the list'}
				/>
			</div>
		);
	}
});

module.exports = GeneList;
