'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var D3 = require('d3');
var $ = require('jQuery');

var AutoComplete = require('react-autocomplete');

//http GET request for synbio CDS dna
//https://synbiohub.programmingbiology.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26/?offset=0&limit=50

const addNameInputStyles = {
	textStyle: {
		borderRadius: '1em 0em 0em 1em',
		borderColor: 'black transparent black black',
		borderStyle: 'solid',
		outline: 'none',
		paddingLeft: 10,
		fontSize: 20,
		fontFamily: 'Open Sans, sans-serif',
	},
	submitStyle: {
		color: 'white',
		transition: 'all 0.3s ease 0s',
		borderRadius: '0em 1em 1em 0em',
		borderColor: 'black',
		borderStyle: 'solid',
		marginLeft: -2,
		outline: 'none',
		fontSize: 20,
		fontFamily: 'Open Sans, sans-serif',
		cursor: 'pointer',
	},
};
//AddName box
const AddNameInput = React.createClass({
	getInitialState() {
		return {
			selectedGene: '',
			geneList: [],
			hover: false
		};
	},
	componentDidMount(){
		this.GeneList();
	},
	GeneList() {
    return $.getJSON('https://synbiohub.programmingbiology.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26/?offset=0&limit=50')
      .then((data) => {
      	let temp_geneList = [];
      	$.each(data, function(index, element) {
      		temp_geneList.push(element.name);
	  	});
	  	this.setState({ geneList: temp_geneList });
      });
      console.log(geneList);
 	},
	onMouseEnter() {
		this.setState({ hover: true });
	},
	onMouseLeave() {
		this.setState({ hover: false });
	},
	onUserEnter(evt) {
		evt.preventDefault();
		this.props.onUserEnter();
	},
	handleChange(evt) {
		evt.preventDefault();
		console.log(evt.target.value);
		this.props.changeGeneName(
			evt.target.value
		);
	},
	selectItemFromMouse(item) {
		console.log(item);
		this.props.changeGeneName(
			item
		);
	},
	render() {
		const height = this.props.height;
		const width = this.props.width;
		const submitWidth = 105;
		const placeholder = 'Enter gene name...';
		const submitValue = "Add gene"

		//All the css goes in these dictionaries
		let textStyle = JSON.parse(JSON.stringify(addNameInputStyles.textStyle));
		textStyle['height'] = height;
		textStyle['width'] = width - submitWidth;

		let submitStyle = JSON.parse(JSON.stringify(addNameInputStyles.submitStyle));
		submitStyle['height'] = height;
		submitStyle['width'] = submitWidth;

		if (this.state.hover) {
			// Original color #078C07
			submitStyle.backgroundColor = '#cc7a00'
		}
		else {
			// Original color: #0AA20A
			submitStyle.backgroundColor = '#ff9900';
		}

		const newGeneName = this.props.newGeneName;

		let formStyle = {};
		if (this.props.centerInput) {
			formStyle.textAlign = 'center';
		}
		return (
			<div>
				
				<form style={formStyle} onSubmit={this.onUserEnter}>				 
					<AutoComplete
			          style={textStyle}
			          value={this.state.selectedGene}
			          items={this.state.geneList}
			          getItemValue={(item) => item}
			          onSelect={(value, item) => {
			          	this.selectItemFromMouse(item);
			            this.setState({ selectedGene: value });
			          }}
			          onChange={(event, value) => {
			            this.handleChange(event);
			            this.setState({ selectedGene: value });
			          }}
			          renderItem={(item, isHighlighted) =>
					    <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
					      {item}
					    </div>
					  }
			        />
				{/*
					<input
						ref="newGeneName"
						type="text"
						style={textStyle}
						placeholder={placeholder}
						value={newGeneName}
						onChange={this.handleChange}
					/>
					*/}
					<input
						type="submit"
						style={submitStyle}
						value={submitValue}
						onMouseEnter={this.onMouseEnter}
						onMouseLeave={this.onMouseLeave}
					/>
				</form>
			</div>
		);
	}
});

module.exports = AddNameInput;
