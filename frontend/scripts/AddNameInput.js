'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
// var ReactXML = require('react-xml-parser');
var D3 = require('d3');
var $ = require('jQuery');

var Select = require('react-select');

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

var getGeneList = function(input, callback) {
  fetch(`https://synbiohub.programmingbiology.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26${input}/?offset=0&limit=50`)
    .then((response) => {
		return response.json();
    }).then((json) => {
		let options = [];
		json.forEach(function(obj) { 
			options.push({value: obj.displayId.toLowerCase(), label: obj.name})
		});
		callback(options, true);
    });
}

var getOptions = function(input, callback) {
  setTimeout(function() {
        getGeneList(input, function(data, flag) {
            callback(null, {
                options: data,
                complete: flag,
            });
        });
    }, 50);
};

//AddName box
const AddNameInput = React.createClass({
	getInitialState() {
		return {
			selectedGene: '',
			selectableList: [],
			geneList: [],
			hover: false
		};
	},
	onMouseEnter() {
		this.setState({ hover: true });
	},
	onMouseLeave() {
		this.setState({ hover: false });
	},
	onUserEnter(value) {
		console.log(value.label);

		this.props.changeGeneName(
			value.label,
		);
		this.setState({ selectedGene: value });
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
				<Select.Async
				    name="form-field-name"
				    value={this.state.selectedGene.label}
				    loadOptions={getOptions}
				    onChange={this.onUserEnter}
				/>
			</div>
		);
	}
});

module.exports = AddNameInput;
