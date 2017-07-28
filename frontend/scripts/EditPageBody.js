'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var GeneList = require("./GeneList");
var StateExpressionCircle = require('./StateExpressionCircle');
var AddNameInput = require('./AddNameInput');

const editPageBodyStyles = {
	leftContainer: {
		float: 'left',
	},
	rightContainer: {
		float: 'left',
		width: 400,
	},
};
const EditPageBody = React.createClass({
	onUserChangeColor(geneId, color) {
		this.props.onUserChangeColor(geneId, color);
	},
	onUserEnter() {
		this.props.onUserEnter();
	},
	changeGeneName(newGeneName, newDatabase, newSecondTitle) {
		this.props.changeGeneName(newGeneName, newDatabase, newSecondTitle);
	},
	onDrag(geneId, color) {
		this.props.onDrag(geneId, color);
	},
	onDrop() {
		this.props.onDrop();
	},
	onUndoSelection(geneId) {
		this.props.onUndoSelection(geneId);
	},
	render() {
		let leftContainerStyle = JSON.parse(JSON.stringify(editPageBodyStyles.leftContainer));
		let rightContainerStyle = JSON.parse(JSON.stringify(editPageBodyStyles.rightContainer));

		const height = this.props.height;
		const newGeneName = this.props.newGeneName;

		const fullWidth = this.props.width;
		const rightContainerWidth = fullWidth/2;
		leftContainerStyle.width = fullWidth - rightContainerWidth;
		leftContainerStyle.height = height;
		rightContainerStyle.height = height;
		rightContainerStyle.width = rightContainerWidth;

		const circleWidth = leftContainerStyle.width;

		const genes = this.props.genes;
		const circleFill = this.props.circleFill;
		const genesSelected = this.props.genesSelected;

		//Circle components
		const maxEdge = Math.min(height, circleWidth);
		const radius = maxEdge/2 - 10;
		const cx = circleWidth/2;
		const cy = height/2;

		const fill = "url(#stripedFillSingleState)";
		//Set up the paths to draw for the pattern based on which genes are selected
		let pathsToDraw = [];
		let px = 2;
		const pathStrokeWidth = 6;
		for (let geneId in genesSelected) {
			//Some gene ids may be in here but set to false and should not show up
			if (genesSelected[geneId]) {
				const geneInfo = genes[geneId];
				pathsToDraw.push({
					id: px,
					stroke: geneInfo.color,
					strokeWidth: pathStrokeWidth,
					d: "M"+px+",0 L"+px+",10",
				});
				px += pathStrokeWidth;
			}
		}
		const totalPatternWidth = 8*(pathsToDraw.length);
		const geneListMaxHeight = this.props.geneListMaxHeight;

		return(
			<div>
				<div style={leftContainerStyle}>
					<svg height={height} width={circleWidth}>
						<defs>
							<pattern id="stripedFillSingleState" patternUnits="userSpaceOnUse"
							x="0" y="0" width={totalPatternWidth} height="10">
							<g fill={'none'}>
							{pathsToDraw.map((pathElement) => {
								return <path 
									key={pathElement.id} 
									d={pathElement.d} 
									stroke={pathElement.stroke}
									strokeWidth={pathElement.strokeWidth}
								/>;
							})}
							</g>
							</pattern>
						</defs>
						<StateExpressionCircle
							cx={cx}
							cy={cy}
							radius={radius}
							fill={fill}
							onDrop={this.onDrop}
						/>
					</svg>
				</div>
				<div style={rightContainerStyle}>
					<AddNameInput 
						height={50} 
						width={rightContainerWidth} 
						newGeneName={newGeneName} 
						changeGeneName={this.changeGeneName}
					/>
					<GeneList 
						width={rightContainerWidth} 
						genes={genes}
						draggableElements={true}
						onDrag={this.onDrag}
						genesSelected={genesSelected}
						onUndoSelection={this.onUndoSelection}
						onDeleteClick={this.onUndoSelection}
						onUserChangeColor={this.onUserChangeColor}
						displayColorPicker={1}
						maxHeight={geneListMaxHeight}
					/>
				</div>
			</div>
		);
	}
});

module.exports = EditPageBody;
