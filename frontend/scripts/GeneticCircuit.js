'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');
var $ = require('jQuery');

/*
* Maps the recombinant elements to their ids
*/
const recombinaseToId = {
	'D': 100,
	'-D': -100,
	'[': 101,
	'-[': -101,
	'(': 102,
	'-(': -102,
	'F': 100,
	'-F': -100,
	'O': 101,
	'-O': -101,
	'X': 103,
	'-X': -103,
	'I': 102,
	'-I': -102,
	'A': 105,
	'-A': -105,
	'B': 104,
	'-B': -104,
};

const geneticCircuitStyles = {
	emptyDivStyle: {
		paddingBottom: 60,
	},
	circuitExistsStyle: {
		paddingBottom: 20,
	}
};
/*
* Representation of the cicruit using SVG elements
*/
const GeneticCircuit = React.createClass({
	/*
	* For a given gene, get the infomration about it (color assigned, name, etc...)
	*/
	getGeneInformation(id) {
		return this.props.getGeneInformation(id);
	},
	render() {
		const circuitArray = this.props.circuitArray;
		const geneMapping = this.props.geneMapping;
		const circuitsPartMapping = this.props.circuitsPartMapping;

		const genes = this.props.genes;

		const height = this.props.pageHeight;

		//Subtract 40 so its not tight at the borders
		const width = this.props.pageWidth - 40;

		//Arbitrary y coordinate to start from
		const maxCircuitHeight = 40;
		const elementHeight = Math.min(maxCircuitHeight, height/2);

		let currentPointOnDNA = 0;

		//Count the number of fives in the ciruit. Used to determine the spacing interval

		let numberOfNon5s = circuitArray.length;
		circuitArray.map((component) => {
			if (Math.abs(component) == 5) {
				numberOfNon5s -= 1;
			}
		});
		const interval = width/numberOfNon5s;

		let partIdForKey = 1;

		/*
		* Amount of padding depends on how many circuits are being displayed on the page.
		* So we use this.props.paddingBottom to determine if there should be padding on the
		* bottom or not
		*/
		let emptyDivStyle = {};
		let circuitExistsStyle = {};
		if (this.props.paddingBottom) {
			emptyDivStyle = JSON.parse(JSON.stringify(geneticCircuitStyles.emptyDivStyle));
			circuitExistsStyle = JSON.parse(JSON.stringify(geneticCircuitStyles.circuitExistsStyle));
		}

		if (this.props.highlight) {
			circuitExistsStyle.backgroundColor = '#66ccff';
			circuitExistsStyle.opacity = 0.5;
		}

		emptyDivStyle.width = width;
		emptyDivStyle.height = height;

		if (this.props.noCircuitsWereFound) {
			return <div style={emptyDivStyle}></div>
		}
		else if (circuitArray.length <= 0) {
			return <div style={emptyDivStyle}></div>
		}
		else {
			return (
				<div style={circuitExistsStyle}>
					<svg width={width} height={height} id = {'genCirc'}>
						<g stroke={'black'}>
							<line
								x1={0}
								y1={elementHeight}
								x2={width}
								y2={elementHeight}
								strokeWidth={3}
							/>
						</g>
						{circuitArray.map((component) => {
							//These are just numbers
							let componentId = component;
							//Check if we are adding a recombinase
							if (typeof component === 'string') {
								componentId = recombinaseToId[component];
							}
							//Skip '5' because it is an empty piece of DNA
							if (Math.abs(component) !== 5) {
								currentPointOnDNA += interval;
							}

							let geneInfo = undefined;

							//We want to look up the part based on the index in the ORIGINAL
							//circuit. So we use the mapping that maps the index in this circuit
							//To the index in the original one
							const partOriginalLocationId = circuitsPartMapping[partIdForKey-1]
							if (geneMapping[partOriginalLocationId]) {
								geneInfo = geneMapping[partOriginalLocationId];
							}
							partIdForKey += 1;
							return <IndividualPart
								key={partIdForKey}
								partId={componentId}
								elementHeight={elementHeight}
								startPointOnDNA={currentPointOnDNA - interval}
								endPointOnDna={currentPointOnDNA}
								geneInfo={geneInfo}
								getGeneInformation={this.getGeneInformation}
								linePosition = {elementHeight}
							/>;
						})}
					</svg>
				</div>
			);
		}
	}
});
const partIdToComponents = {
	orientationByLetter: {
		top: new Set(['P','G','T','t']),
		bottom: new Set(['-P','-G','-T','-t']),
	},
	1: ['G'],
	2: ['G','P'],
	3: ['t','-T','P'],
	4: ['-T','T'],
	5: [],
	6: ['-P','P'],
	7: ['T'],
	8: ['G','-G'],
	9: ['-G','P'],
	10: ['P'],
	11: ['-P','G','P'],
	12: ['G','-G','P'],
	13: ['-P','G','-G','P'],
	14: ['-t','P'],
	15: ['T','-t'],
	16: ['G','P','G'],
	17: ['G','P','G','P'],
	18: ['P','G','P'],
	19: ['P','G'],
	20: ['-P','P','G','P'],
	21: ['G','P','G','-G'],
	22: ['P','G','-G','P'],
	23: ['-P','G','P','G','P'],
	24: ['G','P','G','-G','P'],
	25: ['-P','G','P','G','-G','P'],
	//Recombinases
	100: ['R'],
	101: ['R'],
	102: ['R'],
	103: ['R'],
	104: ['R'],
	105: ['R'],
};

const IndividualPart = React.createClass({
	getGeneInformation(id) {
		return this.props.getGeneInformation(id);
	},
	render() {
		const partId = Math.abs(this.props.partId);
		const components = partIdToComponents[partId];
		const elementHeight = this.props.elementHeight;

		const geneInfo = this.props.geneInfo;

		const startPointOnDNA = this.props.startPointOnDNA;
		const endPointOnDna = this.props.endPointOnDna;
		let currentPointOnDNA = startPointOnDNA;
		let componentId = 0;

		const linePosition = this.props.linePosition;

		let degreesOfRotation = 0;
		if (this.props.partId < 0) {
			degreesOfRotation = 180;
		}

		const numberOfPieces = components.length;
		const interval = (endPointOnDna - startPointOnDNA)/numberOfPieces;
		const transform = "rotate("+degreesOfRotation+" "+(startPointOnDNA+endPointOnDna)/2+" "+elementHeight+")";
		//Need to use the transform to flip the whole part 180 degrees, not each individual
		//piece
		let geneNumber = 1;

		return(
			<g transform={transform}>
			{components.map((component) => {
				currentPointOnDNA += interval;
				let pieceToShow = null;
				let orientation = 1;
				//Some parts have multiple genes and we need to know which gene for a part we are creating
				//Move where we start from up by interval, since each component
				//has the same width
				switch(component) {
					case 'R':
						pieceToShow = <RecombinationSite
							key={componentId}
							siteId={partId}
							stroke={'black'}
							orientation={orientation}
							strokeWidth={1}
							fill={'black'}
							height={elementHeight}
							startPointOnDNA={currentPointOnDNA-interval}
							endPointOnDna={currentPointOnDNA}
						/>
						break;
					case '-P':
						orientation *= -1
						case 'P':
						pieceToShow = <PromoterPiece
							key={componentId}
							orientation={orientation}
							height={elementHeight}
							strokeWidth = {3}
							startPointOnDNA={currentPointOnDNA - interval}
							endPointOnDna={currentPointOnDNA}
							linePosition = {linePosition}
						/>;
						break;
					case '-G':
						orientation *= -1;
					case 'G':
						//TODO: there could be cases where geneInfo is undefined above (maybe a part is used that
						//has three genes available but only two of them are actually used) in which case this
						//might fail
						const geneIdToAdd = geneInfo[geneNumber];
						const individualGeneInfo = this.getGeneInformation(geneIdToAdd);
						const fillColor = individualGeneInfo['color'];
						pieceToShow = <GenePiece
							key={componentId}
							orientation={orientation}
							height={elementHeight}
							startPointOnDNA={currentPointOnDNA - interval}
							endPointOnDna={currentPointOnDNA}
							linePosition = {linePosition}
							fill = {fillColor}
							stroke = {'black'}
							strokeWidth = {5}
						/>
						geneNumber += 1;
						break;
					case '-T':
						orientation *= -1;
					case 'T':
						pieceToShow = <TerminatorPiece
							key={componentId}
							orientation={orientation}
							height={elementHeight}
							startPointOnDNA={currentPointOnDNA - interval}
							endPointOnDna={currentPointOnDNA}
							linePosition = {linePosition}
							termColor = {'black'}
							strokeWidth = {5}
						/>
						break;
					case '-t':
						orientation *= -1;
					case 't':
						pieceToShow = <TerminatorPiece
							key={componentId}
							orientation={orientation}
							height={elementHeight}
							startPointOnDNA={currentPointOnDNA - interval}
							endPointOnDna={currentPointOnDNA}
							linePosition = {linePosition}
							termColor = {'red'}
							strokeWidth = {5}
						/>
						break;
					default:
						break;
				}
				componentId += 1;
				return pieceToShow;
			})}
			</g>
		);
	}
});

// An svg promoter component
const PromoterPiece = React.createClass({
	render() {
		const orientation = this.props.orientation;
		const height = this.props.height;
		const strokeWidth = this.props.strokeWidth;

		const startPointOnDNA = this.props.startPointOnDNA;
		const endPointOnDna = this.props.endPointOnDna;

		const linePosition = this.props.linePosition;


		let degreesOfRotation = 0;
		if (orientation === -1) {
			degreesOfRotation = 180;
		}
		const transform = "rotate("+degreesOfRotation+" "+(endPointOnDna+startPointOnDNA)/2+" "+height+")";

		return(
			<g transform={transform}>
				<image
					xlinkHref = {"./img/SBOL/promoter.svg"}
					height = {height}
					width = {endPointOnDna - startPointOnDNA}
					strokeWidth = {strokeWidth}
					x = {startPointOnDNA}
					y = {linePosition - 20}
					id = {'promoter'}
				/>
			</g>
		);
	}
});

//An svg gene component
const GenePiece = React.createClass({
	render() {
		const orientation = this.props.orientation;
		const height = this.props.height;

		const startPointOnDNA = this.props.startPointOnDNA;
		const endPointOnDna = this.props.endPointOnDna;

		const linePosition = this.props.linePosition;

		const fill = this.props.fill;

		const strokeWidth = this.props.strokeWidth;
		const stroke = this.props.stroke;

		let degreesOfRotation = 0;
		if (orientation === -1) {
			degreesOfRotation = 180;
		}
		const transform = "rotate("+degreesOfRotation+" "+(endPointOnDna+startPointOnDNA)/2+" "+height+")";
		return(
			<g transform={transform}>
				<svg viewBox={"0 0 50 100"}
					version={"1.1"} xmlns={'http://www.w3.org/2000/svg'} xmlnsXlink= {'http://www.w3.org/1999/xlink'}
					xmlSpace={"preserve"}
					x= {startPointOnDNA}
					y= {linePosition - 27}
					width={endPointOnDna - startPointOnDNA}
					height={height}
					fill = {fill}
					strokeWidth = {strokeWidth}
					stroke = {stroke}>
		  		<path d={"M 9 65 L 27 65 L 42 50 L 27 35 L 9 35 L 9 65 Z"}/>
				</svg>
			</g>
		);
	}
});

//An svg terminator component
const TerminatorPiece = React.createClass({
	render() {
		const orientation = this.props.orientation;
		const height = this.props.height;

		const startPointOnDNA = this.props.startPointOnDNA;
		const endPointOnDna = this.props.endPointOnDna;

		const linePosition = this.props.linePosition;

		const termColor = this.props.termColor;

		const strokeWidth = this.props.strokeWidth;

		let degreesOfRotation = 0;
		if (orientation === -1) {
			degreesOfRotation = 180;
		}
		const transform = "rotate("+degreesOfRotation+" "+(endPointOnDna+startPointOnDNA)/2+" "+height+")";

		return(
			<g transform={transform}>
			<svg viewBox={"0 0 50 100"}
				version={"1.1"} xmlns={'http://www.w3.org/2000/svg'} xmlnsXlink= {'http://www.w3.org/1999/xlink'}
				xmlSpace={"preserve"}
				x= {startPointOnDNA}
				y= {linePosition - 20}
				width={endPointOnDna - startPointOnDNA}
				height={height}
				stroke = {termColor}
				strokeWidth = {strokeWidth}
				fill = {termColor} >
  			<path d="M 25 50 L 25 26"/>
  			<path d="M 10 25 L 40 25"/>
			</svg>
			</g>
		);
	}
});

const Recombinases = {
	//Blue
	100: {
		recombinationSiteId: 1,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#66ccff',
	},
	//Blue
	101: {
		recombinationSiteId: 2,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#66ccff',
	},
	//Orange triangle
	102: {
		recombinationSiteId: 2,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#ff9900',
	},
	//Orange oval
	103: {
		recombinationSiteId: 1,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#ff9900',
	},
	//Purple triangle
	104: {
		recombinationSiteId: 2,
		stroke: 'black',
		strokeWidth: 1,
		fill: 'rgb(148, 123, 209)',
	},
	//Purple oval
	105: {
		recombinationSiteId: 1,
		stroke: 'black',
		strokeWidth: 1,
		fill: 'rgb(148, 123, 209)',
	},
};
//An svg recombination site component
const RecombinationSite = React.createClass({
	render() {
		const siteId = this.props.siteId;
		const orientation = this.props.orientation;
		const height = this.props.height;

		const recombinaseInfo = Recombinases[siteId];
		const recombinationSiteId = recombinaseInfo['recombinationSiteId'];
		const stroke = recombinaseInfo['stroke'];
		const strokeWidth = recombinaseInfo['strokeWidth'];
		const fill = recombinaseInfo['fill'];

		const startPointOnDNA = this.props.startPointOnDNA;
		const endPointOnDna = this.props.endPointOnDna;

		const midPoint = (endPointOnDna+startPointOnDNA)/2;

		let degreesOfRotation = 0;
		if (orientation === -1) {
			degreesOfRotation = 180;
		}
		const transform = "rotate("+degreesOfRotation+" "+midPoint+" "+height+")";

		let shape = null;
		switch(recombinationSiteId) {
			//The oval
			case 1:
				const point1 = {x: midPoint-5, y: height};
				const point2 = {x: midPoint-5, y: height-10};
				const point3 = {x: midPoint+10, y: height};
				const point4 = {x: midPoint-5, y: height+10};
				const path = "M"+point1.x+","+point1.y+" L"+point2.x+","+point2.y+" S"+point3.x+","+point3.y+" "+point4.x+","+point4.y+" z";
				shape = <path
					d={path}
					fill={fill} stroke={stroke} strokeWidth={strokeWidth}
					transform={transform}
				/>;
				break;
			//The triangle
			case 2:
				const point1a = {x: midPoint-5, y: height-10};
				const point2a = {x: midPoint+5, y: height};
				const point3a = {x: midPoint-5, y: height+10};

				const pointsArray = [point1a, point2a, point3a];
				let points = "";
				pointsArray.map((point) => {
					points += point.x + "," + point.y+" ";
				});

				const recominaseStyle = {
					fill: fill,
					strokeWidth: strokeWidth,
					stroke: stroke,
				};
				shape = <g stroke={stroke} transform={transform}>
					<polygon points={points} style={recominaseStyle} />
				</g>;
				break;
			default:
				break;
		}

		return(
			shape
		);
	}
});

module.exports = GeneticCircuit;
