'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');

var StateExpressionCircle = require('./StateExpressionCircle');

const diagramIllustrationStyle = {
	radius: 30,
	circleStroke: 'black',
	line1Stroke: '#ff9900', // Originally, the colors were marked 'orange' or 'blue'
	line2Stroke:'#66ccff',
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
	divStyle: {
		textAlign: 'center',
	}
};
//Currently all value are somewhat hardcoded and will need to be fixed in the future
//but it looks good for now
//TODO: allow user to pick and choose how many states there are an position them on
//the page
const DiagramIllustration = React.createClass({
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
	render() {
		const height = this.props.height;
		const width = this.props.width;
		let divStyle = JSON.parse(JSON.stringify(diagramIllustrationStyle.divStyle));

		if (this.props.paddingBottom) {
			divStyle.paddingBottom = 20;
		}

		const circleRadius = diagramIllustrationStyle.radius;
		const circleStroke = diagramIllustrationStyle.circleStroke;
		const circleStrokeWidth = diagramIllustrationStyle.circleStrokeWidth;

		const circleDistanceFromBorder = Math.max(10, width/6);
		const verticalDistanceBetween1And3 = 10+circleRadius + (0.33)*(height-2*(10+circleRadius));
		const verticalDistanceBetween3And4 = 150;

		//Circle one components
		const cx1 = width/2;
		const cy1 = 10+circleRadius;

		//Circle two components
		const cx2 = circleDistanceFromBorder+circleRadius;
		const cy2 = verticalDistanceBetween1And3;

		//Cicrle three components
		const cx3 = width-circleDistanceFromBorder-circleRadius;
		const cy3 = verticalDistanceBetween1And3;

		//Circle four components
		const cx4 = circleDistanceFromBorder+circleRadius;
		//const cy4 = 10+circleRadius*5+verticalDistanceBetween3And4;
		const cy4 = height - (20+circleRadius);

		//Circle five components
		const cx5 = width-circleDistanceFromBorder-circleRadius;
		//const cy5 = 10+circleRadius*5+verticalDistanceBetween3And4;
		const cy5 = height - (20+circleRadius);

		//TODO: verify that the circle ids match the variable names (flipped the ids)
		//of circles 3 and 4
		const circleAttributes = {
			circleRadius: circleRadius,
			circleCoords: [{
				id: 1,
				cx: cx1,
				cy: cy1,
			},{
				id: 2,
				cx: cx2,
				cy: cy2,
			},{
				id: 3,
				cx: cx3,
				cy: cy3,
			},{
				id: 4,
				cx: cx4,
				cy: cy4,
			},{
				id: 5,
				cx: cx5,
				cy: cy5,
			}]
		};
		const line1Stroke = diagramIllustrationStyle.line1Stroke;
		const line2Stroke = diagramIllustrationStyle.line2Stroke;
		const arrows = [
			{
				id: 1,
				lines: [{
					x1: cx2,
					y1: cy1,
					x2: cx1 - circleRadius - 5,
					y2: cy1,
				},{
					x1: cx2,
					y1: cy1,
					x2: cx2,
					y2: cy2 - circleRadius - 10,
				}],
				arrowPoints: [{
					x: cx2-5,
					y: cy2 - circleRadius - 10,
				},{
					x: cx2+5,
					y: cy2 - circleRadius - 10,
				},{
					x: cx2,
					y: cy2 - circleRadius - 5,
				}],
				color: line1Stroke,
				arrowPointsStyle: diagramIllustrationStyle.arrow1Point,
				strokeWidth: circleStrokeWidth
			},{
				id: 2,
				lines: [{
					x1: cx2,
					y1: cy2 + circleRadius + 5,
					x2: cx2,
					y2: cy4 - circleRadius - 10,
				}],
				arrowPoints: [
				{
					x: cx2-5,
					y: cy4 - circleRadius - 10,
				},{
					x: cx2+5,
					y: cy4 - circleRadius - 10,
				},{
					x: cx2,
					y: cy4 - circleRadius - 5,
				}],
				color: line2Stroke,
				arrowPointsStyle: diagramIllustrationStyle.arrow2Point,
				strokeWidth: circleStrokeWidth
			},{
				id: 3,
				lines: [{
					x1: cx1 + circleRadius + 5,
					y1: cy1,
					x2: cx3,
					y2: cy1,
				},{
					x1: cx3,
					y1: cy1,
					x2: cx3,
					y2: cy3 - circleRadius - 10,
				}],
				arrowPoints: [{
					x: cx3 - 5,
					y: cy3 - circleRadius - 10,
				},{
					x: cx3 + 5,
					y: cy3 - circleRadius - 10,
				},{
					x: cx3,
					y: cy3 - circleRadius - 5,
				}],
				color: line2Stroke,
				arrowPointsStyle: diagramIllustrationStyle.arrow2Point,
				strokeWidth: circleStrokeWidth
			},{
				id: 4,
				lines: [{
					x1: cx3,
					y1: cy3 + circleRadius + 5,
					x2: cx3,
					y2: cy5 - circleRadius - 10,
				}],
				arrowPoints: [{
					x: cx3-5,
					y: cy5 - circleRadius - 10,
				},{
					x: cx3+5,
					y: cy5 - circleRadius - 10,
				},{
					x: cx3,
					y: cy5 - circleRadius - 5,
				}],
				color: line1Stroke,
				arrowPointsStyle: diagramIllustrationStyle.arrow1Point,
				strokeWidth: circleStrokeWidth
			}
		];

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
				<svg height={height} width={width} id = {"diagram"}>
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

module.exports = DiagramIllustration;
