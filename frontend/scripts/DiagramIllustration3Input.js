'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var StateExpressionCircle = require('./StateExpressionCircle');

const diagramIllustrationStyle = {
	circleStroke: 'black',
	line1Stroke: '#ff9900', // Originally, the colors were marked 'orange' or 'blue'
	line2Stroke:'#66ccff',
	line3Stroke: 'rgb(148, 123, 209)', // This is hardcoded. Adding additional lines = additional colors
	circleStrokeWidth: 3,
	arrow1Point: {
		fill: '#ff9900',
		stroke: 'orange',
		strokeWidth: 1,
	},
	arrow2Point: {
		fill: '#66ccff',
		stroke: '#66ccff',
		strokeWidth: 1,
	},
	// This is hardcoded. In order to have additional inputs, new arrow styles would be needed (only to change color)
	arrow3Point: {
		fill: 'rgb(148, 123, 209)',
		stroke: 'rgb(148, 123, 209)',
		strokeWidth: 1,
	},
	divStyle: {
		textAlign: 'center',
	}
};
//Currently all value are somewhat hardcoded and will need to be fixed in the future
//but it looks good for now
//TODO: allow user to pick and choose how many states there are an position them on
//the page
const DiagramIllustration3Input = React.createClass({

	/*
	* The state includes:
	*	numInputs = number of inputs for the state machine
	* numStates = number of states (circles) in state machine
	*/
	getInitialState() {
		return {
			numInputs: 2,
			numStates: 3,
		};
	},

	onStateClick(stateId) {
		const stateClicked = stateId;
		if (this.props.onDiagramStateClick) {
			this.props.onDiagramStateClick(stateClicked);
		}
	},
	/*
	* On the circuit diagram, when the mouse hover enters the state circle
	*/
	onMouseEnterState(stateId) {
		if (this.props.onMouseEnterState) {
			this.props.onMouseEnterState(stateId);
		}
	},
	/*
	* On the circuit diagram, when the mouse hover leaves the state
	*/
	onMouseLeaveState(stateId) {
		if (this.props.onMouseLeaveState) {
			this.props.onMouseLeaveState(stateId);
		}
	},

	/*
	* Function taken from stackoverflow -- strips the quotes of a string
	*/
	stripquotes(a) {
    if (a.charAt(0) === '"' && a.charAt(a.length-1) === '"') {
        return a.substr(1, a.length-2);
    }
    return a;
	},

	/*
	* Helper method to make the circle object
	*/
	makeCircleObject(id, cx, cy) {
		return {id: id, cx: cx, cy: cy};
	},

	// Possible generic method for making array of circle object literals --- string issue
	/*
	* Creates an array of circle object literals
	* Each object contains:
	* - id
	* - cx
	* - cy
	*/
	/*makeCircleIDMap() {
		let circleIDMap = [];
		for (var i = 1; i <= this.state.numStates; i++) {
			let cxi = "cx" + i;
			let cyi = "cy" + i;
			let circleObject = {id: i, cx: this.stripquotes(cxi), cy: this.stripquotes(cyi)};
			circleIDMap.push(circleObject);
			console.log(circleObject);
		}
		return circleIDMap;
	},*/

	/*
	* A more-generic method for drawing arrows
	* ArrowID = integer to define arrow (1 ... numStates - 1)
	* States = pass the actual circle object for that state
	* ArrowType = "horiz-left", "horiz-right", "straight"
	* ArrowStyle = which arrow style to draw (NOTE: this is hardcoded to include 1 ... 3)
	*/
	makeArrow(arrowID, originalState, receptorState, arrowType, arrowStyle) {
		let apStyle = diagramIllustrationStyle.arrow1Point; // arrowPointStyle
		let lStroke = diagramIllustrationStyle.line1Stroke; // lineStroke color
		const circleRadius = this.props.radius;
		const circleStrokeWidth = diagramIllustrationStyle.circleStrokeWidth;
		switch(arrowStyle) {
			case 1:
					apStyle = diagramIllustrationStyle.arrow1Point;
					lStroke = diagramIllustrationStyle.line1Stroke;
				break;
			case 2:
				apStyle = diagramIllustrationStyle.arrow2Point;
				lStroke = diagramIllustrationStyle.line2Stroke;
				break;
			case 3:
				apStyle = diagramIllustrationStyle.arrow3Point;
				lStroke = diagramIllustrationStyle.line3Stroke;
				break;
			default:
				break;
		};
		let cxO = originalState.cx;
		let cyO = originalState.cy;
		let cxR = receptorState.cx;
		let cyR = receptorState.cy;
		let arrowObject = {};
		switch(arrowType) {
			case "horiz-left":
			arrowObject = {
					id: arrowID,
					// leftmost, top level
					lines: [{
						x1: cxR,
						y1: cyO,
						x2: cxO - circleRadius - 5,
						y2: cyO,
					},{
						x1: cxR,
						y1: cyO,
						x2: cxR,
						y2: cyR - circleRadius - 10,
					}],
					arrowPoints: [{
						x: cxR-5,
						y: cyR - circleRadius - 10,
					},{
						x: cxR+5,
						y: cyR - circleRadius - 10,
					},{
						x: cxR,
						y: cyR - circleRadius - 5,
					}],
					color: lStroke,
					arrowPointsStyle: apStyle,
					strokeWidth: circleStrokeWidth
				};
				break;
			case "horiz-right":
				arrowObject = {
					id: arrowID,
					lines: [{
						x1: cxO + circleRadius + 5,
						y1: cyO,
						x2: cxR ,
						y2: cyO,
					},{
						x1: cxR,
						y1: cyO,
						x2: cxR,
						y2: cyR - circleRadius - 10,
					}],
					arrowPoints: [{
						x: cxR - 5,
						y: cyR - circleRadius - 10,
					},{
						x: cxR + 5,
						y: cyR - circleRadius - 10,
					},{
						x: cxR,
						y: cyR - circleRadius - 5,
					}],
					color: lStroke,
					arrowPointsStyle: apStyle,
					strokeWidth: circleStrokeWidth
				};
				break;
			case "straight":
				arrowObject = {
					id: arrowID,
					lines: [{
						x1: cxO,
						y1: cyO + circleRadius + 5,
						x2: cxO,
						y2: cyR - circleRadius - 10,
					}],
					arrowPoints: [
					{
						x: cxO-5,
						y: cyR - circleRadius - 10,
					},{
						x: cxO+5,
						y: cyR - circleRadius - 10,
					},{
						x: cxO,
						y: cyR - circleRadius - 5,
					}],
					color: lStroke,
					arrowPointsStyle: apStyle,
					strokeWidth: circleStrokeWidth
				};
				break;
			default:
				break;
		};
		return arrowObject;
	},

	/*
	* This function makes the arrow map that will be called later
	* NOTE: this is hardcoded, but at least it is clean (sort of)
	*/
	makeArrowMap(circleCoords) {
		// NOTE: circle coords array stores each ID starting at 0
		// Subtract 1 from ID to access the correct circle
		let arrowMap = [];
		arrowMap.push(this.makeArrow(1, circleCoords[0], circleCoords[1], "horiz-left", 1));
		arrowMap.push(this.makeArrow(2, circleCoords[0], circleCoords[2], "straight", 2));
		arrowMap.push(this.makeArrow(3, circleCoords[0], circleCoords[3], "horiz-right", 3));
		arrowMap.push(this.makeArrow(4, circleCoords[1], circleCoords[4], "horiz-left", 2));
		arrowMap.push(this.makeArrow(5, circleCoords[1], circleCoords[5], "horiz-right", 3));
		arrowMap.push(this.makeArrow(6, circleCoords[2], circleCoords[6], "horiz-left", 1));
		arrowMap.push(this.makeArrow(7, circleCoords[2], circleCoords[7], "horiz-right", 3));
		arrowMap.push(this.makeArrow(8, circleCoords[3], circleCoords[8], "horiz-left", 1));
		arrowMap.push(this.makeArrow(9, circleCoords[3], circleCoords[9], "horiz-right", 2));
		arrowMap.push(this.makeArrow(10, circleCoords[4], circleCoords[10], "straight", 3));
		arrowMap.push(this.makeArrow(11, circleCoords[5], circleCoords[11], "straight", 2));
		arrowMap.push(this.makeArrow(12, circleCoords[6], circleCoords[12], "straight", 3));
		arrowMap.push(this.makeArrow(13, circleCoords[7], circleCoords[13], "straight", 1));
		arrowMap.push(this.makeArrow(14, circleCoords[8], circleCoords[14], "straight", 2));
		arrowMap.push(this.makeArrow(15, circleCoords[9], circleCoords[15], "straight", 1));
		return arrowMap;
	},

	render() {
		const height = this.props.height;
		const width = this.props.width;
		let divStyle = JSON.parse(JSON.stringify(diagramIllustrationStyle.divStyle));

		if (this.props.paddingBottom) {
			divStyle.paddingBottom = 20;
		}

		const circleRadius = this.props.radius;
		const circleStroke = diagramIllustrationStyle.circleStroke;
		const circleStrokeWidth = diagramIllustrationStyle.circleStrokeWidth;

		// Math.max() returns the largest number of the two
		const circleDistanceFromBorder = Math.max(10, width/6);

		// TODO: make not hardcoded -- distance between levels
		const verticalDistanceBetweenL1And2 = 10+circleRadius + (0.33)*(height-2*(10+circleRadius));
		const verticalDistanceBetweenL2And3 = 150;
		// Add if necessary .... const verticalDistanceBetweenL3And4 = ...

		// Circle components:
		// cx = center x
		// cy = center y

		const quarterHeight = height/4;

		//Circle one components
		const cx1 = width/2;
		const cy1 = quarterHeight - circleRadius;

		//Circle two components (leftmost circle , top row)
		const cx2 = circleDistanceFromBorder + circleRadius;
		const cy2 = (quarterHeight * 2) - circleRadius;

		// Circle three components (middle circle, top row)
		const cx3 = width/2;
		const cy3 = (quarterHeight * 2) - circleRadius;

		//Cicrle four components (rightmost circle, top row)
		const cx4 = width-circleDistanceFromBorder - circleRadius;
		const cy4 = (quarterHeight * 2) - circleRadius;

		//Circle five components (left most, second level)
		const cx5 = circleDistanceFromBorder - circleRadius;
		//const cy5 = 10+circleRadius*5+verticalDistanceBetweenL2And3;
		//const cy5 = height - (20+circleRadius);
		const cy5 = (quarterHeight * 3) - circleRadius;

		//Circle six components (2 to the left, second level)
		const cx6 = circleDistanceFromBorder + (3 * circleRadius);
		//width-circleDistanceFromBorder-circleRadius;
		//const cy5 = 10+circleRadius*5+verticalDistanceBetweenL2And3;
		const cy6 = (quarterHeight * 3) - circleRadius;

		// Circle seven components (left/middle, second level)
		const cx7 = (width/2) - (2 * circleRadius);
		const cy7 = (quarterHeight * 3) - circleRadius;

		// Circle eight components (right/middle, second level)
		const cx8 = (width / 2) + (2 * circleRadius);
		const cy8 = (quarterHeight * 3) - circleRadius;

		// Circle nine components (2nd to the right, second level)
		const cx9 = width-circleDistanceFromBorder - (3 * circleRadius);
		const cy9 =(quarterHeight * 3) - circleRadius;

		// Circle ten components (rightmost, second level)
		const cx10 = width-circleDistanceFromBorder + circleRadius;
		const cy10 = (quarterHeight * 3) - circleRadius;

		/*
		* TODO: given that cx/y 5 - 10 is the exact same as cx/y 11-16
		* (except for changing the + between the height in the cy), there is lots of room
		* to make this cleaner, more generic code
		*	Pattern: after the first two rows of states, the rest are all the same in positioning
		*/

		//Circle eleven components (left most, third level)
		const cx11 = circleDistanceFromBorder - circleRadius;
		const cy11 = height - circleRadius - 10;

		//Circle twelve components (2 to the left, third level)
		const cx12 = circleDistanceFromBorder + (3 * circleRadius);
		const cy12 = height - circleRadius - 10;

		// Circle thirteen components (left/middle, third level)
		const cx13 = (width/2) - (2 * circleRadius);
		const cy13 = height - circleRadius - 10;

		// Circle fourteen components (right/middle, third level)
		const cx14 = (width / 2) + (2 * circleRadius);
		const cy14 = height - circleRadius - 10;

		// Circle fifteen components (2nd to the right, third level)
		const cx15 = width-circleDistanceFromBorder - (3 * circleRadius);
		const cy15 = height - circleRadius - 10;

		// Circle sixteen components (rightmost, third level)
		const cx16 = width-circleDistanceFromBorder + circleRadius;
		const cy16 = height - circleRadius - 10;

		// Make circle object array
		// Difficult to make this generic b/c of issue w/ strings
		// "cx" + i ---> "cx1" instead of cx1 (issue ...)
		let circleObjArray = [];
		circleObjArray.push(this.makeCircleObject(1, cx1, cy1));
		circleObjArray.push(this.makeCircleObject(2, cx2, cy2));
		circleObjArray.push(this.makeCircleObject(3, cx3, cy3));
		circleObjArray.push(this.makeCircleObject(4, cx4, cy4));
		circleObjArray.push(this.makeCircleObject(5, cx5, cy5));
		circleObjArray.push(this.makeCircleObject(6, cx6, cy6));
		circleObjArray.push(this.makeCircleObject(7, cx7, cy7));
		circleObjArray.push(this.makeCircleObject(8, cx8, cy8));
		circleObjArray.push(this.makeCircleObject(9, cx9, cy9));
		circleObjArray.push(this.makeCircleObject(10, cx10, cy10));
		circleObjArray.push(this.makeCircleObject(11, cx11, cy11));
		circleObjArray.push(this.makeCircleObject(12, cx12, cy12));
		circleObjArray.push(this.makeCircleObject(13, cx13, cy13));
		circleObjArray.push(this.makeCircleObject(14, cx14, cy14));
		circleObjArray.push(this.makeCircleObject(15, cx15, cy15));
		circleObjArray.push(this.makeCircleObject(16, cx16, cy16));

		//TODO: verify that the circle ids match the variable names (flipped the ids)
		// of circles 3 and 4
		// This has been resolved
		const circleAttributes = {
			circleRadius: circleRadius,
			circleCoords: circleObjArray,
		};

		const line1Stroke = diagramIllustrationStyle.line1Stroke;
		const line2Stroke = diagramIllustrationStyle.line2Stroke;
		const line3Stroke = diagramIllustrationStyle.line3Stroke;

		// Uses partially-generic method --- which calls a generic helper method
		const arrows = this.makeArrowMap(circleObjArray);

		const circleCoords = circleAttributes.circleCoords;

		//Set up all the fillings to do for the colors
		const stateExpressions = this.props.stateExpressions;
		const genes = this.props.genes;
		const pathStrokeWidth = 6;

		let allStatePathsToDraw = [];
		for (let stateId in stateExpressions) {
			let pathsToDraw = [];
			let px = 2;
			let genesSelected = stateExpressions[stateId];

			for (let geneId in genesSelected) {
			//Some gene ids may be in here but set to false and should not show up
				if (genesSelected[geneId]) {
					const geneInfo = genes[geneId];
					pathsToDraw.push({
						id: stateId + "." + px,
						stroke: geneInfo.color,
						strokeWidth: pathStrokeWidth,
						d: "M"+px+",0 L"+px+",10",
					});
					px += pathStrokeWidth;
				}
			}
			allStatePathsToDraw.push({
				id: stateId,
				patternId: 'pattern_state_' + stateId,
				paths: pathsToDraw,
				totalPatternWidth: 8*(pathsToDraw.length),
			});
		}

		/*Create legend elements (currently not being used)
		* const legendStartHeight = cy5 + circleRadius + 20;
		* const firstLegendHeight = legendStartHeight+2;
		* const firstLegendArrowPoints = '100,'+(legendStartHeight+16)+' 100,'+(legendStartHeight+12)+' 103,'+(legendStartHeight+14);
		*
		* const secondLegendHeight = legendStartHeight+22;
		* const secondLegendArrowPoints = '100,'+(secondLegendHeight+16)+' 100,'+(secondLegendHeight+12)+' 103,'+(secondLegendHeight+14);
		*/

		return(
			<div style={divStyle}>
				<svg height={height} width={width} id = {'diagram3'}>
					<defs>
						{allStatePathsToDraw.map((allPathInfo) => {
							return <pattern
								key={allPathInfo.patternId}
								id={allPathInfo.patternId}
								patternUnits={"userSpaceOnUse"}
								x="0" y="0" width={allPathInfo.totalPatternWidth} height="10">
								<g fill={'none'}>
								{allPathInfo.paths.map((pathElement) => {
									return <path
										key={pathElement.id}
										d={pathElement.d}
										stroke={pathElement.stroke}
										strokeWidth={pathElement.strokeWidth}
									/>;
								})}
								</g>
							</pattern>;
						})}
					</defs>
					{circleCoords.map((circle) => {
						//Happens to match state id at the moment
						const circleId = circle.id;
						const cx = circle.cx;
						const cy = circle.cy;
						const radius = circleAttributes.circleRadius;

						const fill = "url(#pattern_state_"+circleId+")" ;

						return <StateExpressionCircle
							key={circleId}
							stateId={circleId}
							cx={cx}
							cy={cy}
							radius={radius}
							stroke={circleStroke}
							strokeWidth={circleStrokeWidth}
							fill={fill}
							onClick={this.onStateClick}
							onMouseEnterState={this.onMouseEnterState}
							onMouseLeaveState={this.onMouseLeaveState}
							cursor={'pointer'}
						/>;
					})}
					{arrows.map((arrow) => {
						const arrowId = arrow.id;
						const lines = arrow.lines;
						const arrowPoints = arrow.arrowPoints;
						const arrowPointsStyle = arrow.arrowPointsStyle;
						const strokeWidth = arrow.strokeWidth;
						const color = arrow.color;

						return <ConnectingArrows
							key={arrowId}
							lines={lines}
							arrowPoints={arrowPoints}
							arrowPointsStyle={arrowPointsStyle}
							strokeWidth={strokeWidth}
							color={color}
						/>;
					})}
				</svg>
			</div>
		);
	}
});

/*
* Code to create a legend for the arrows if need be
*
* <rect x={40} y={legendStartHeight} width={80} height={50} stroke={'black'} fill={'transparent'}/>
* <text x={45} y={legendStartHeight+20}>Ara</text>
* <line x1={85} y1={legendStartHeight+14} x2={100} y2={legendStartHeight+14} stroke={'orange'} strokeWidth={2}/>
* <polygon points={firstLegendArrowPoints} stroke={'orange'} fill={'orange'}/>
* <text x={45} y={legendStartHeight+40}>ATc</text>
* <line x1={85} y1={legendStartHeight+36} x2={100} y2={legendStartHeight+36} stroke={'blue'} strokeWidth={2}/>
* <polygon points={secondLegendArrowPoints} stroke={'blue'} fill={'blue'}/>
*/

const ConnectingArrows = React.createClass({
	render() {
		const lines = this.props.lines;
		const arrowPoints = this.props.arrowPoints;
		const stroke = this.props.color;
		const strokeWidth = this.props.strokeWidth;
		const arrowPointsStyle = this.props.arrowPointsStyle;

		let points = "";
		arrowPoints.map((point) => {
			points += point.x + "," + point.y+" ";
		});

		let lineId = 0;
		return(
			<g stroke={stroke}>
				{lines.map((line) => {
					const x1 = line.x1;
					const y1 = line.y1;
					const x2 = line.x2;
					const y2 = line.y2;
					const id = lineId;
					lineId += 1;
					return <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={strokeWidth}/>
				})}
				<polygon points={points} style={arrowPointsStyle} />
			</g>
		);
	}
});

module.exports = DiagramIllustration3Input;
