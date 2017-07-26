'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
// var ReactXML = require('react-xml-parser');
var D3 = require('d3');
var $ = require('jQuery');

var Select = require('react-select');

//http GET request for synbio CDS dna
//https://synbiohub.programmingbiology.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26/?offset=0&limit=100000

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

var searchDatabase = "https://synbiohub.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26";

//AddName box
const AddNameInput = React.createClass({
	getInitialState() {
		return {
			selectedGene: '',
			selectableList: [],
			geneList: [],
			hover: false,
			databaseOptions: [
			  { value: 'https://synbiohub.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26', label: 'SynBioHub' },
			  { value: 'https://synbiohub.programmingbiology.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26', label: 'LCP SynBioHub' }
			],
			geneOptions: [],
			selectedDatabase: 'https://synbiohub.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26',
			isLoadingExternally: false,
		};
	},
	onMouseEnter() {
		this.setState({ hover: true });
	},
	onMouseLeave() {
		this.setState({ hover: false });
	},
	onUserEnter(value) {
		// console.log(value.label + ' ' + value.uri);

		this.props.changeGeneName(
			value.label,
			value.uri,
			value.value
		);
		this.setState({ selectedGene: value });
	},
	componentDidMount(){
		this.updateGeneList('');
	},
	saveDatabaseChange(value) {
		if(value !== undefined)
		{
			// console.log(value.value);
			searchDatabase = value.value;
			this.setState({ selectedDatabase: value.value },
				this.updateGeneList('')
			);

		}
	},
	onInputChange(inputValue) {
		// console.log("[AddNameInput:onInputChange]: inputValue: " + inputValue);
		this.setState({ isLoadingExternally: true, hasInput: true });
		this.updateGeneList(inputValue)
	    return inputValue;
	},  
	updateGeneList(input) {
	  // console.log("[AddNameInput:updateGeneList]: searchDatabase: " + searchDatabase);
	  fetch(`${searchDatabase}${input}/?offset=0&limit=500`)
	    .then((response) => {
			return response.json();
	    }).then((json) => {
			let options = [];
			json.forEach(function(obj) { 
				options.push({value: obj.displayId, label: obj.name, uri:obj.uri})
			});
			this.setState({ geneOptions: options, isLoadingExternally: false });
	    });
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
				<div style={{fontSize:"15", fontFamily:"Open Sans, sans-serif"}}>
					{"Select Gene Database:"}
				</div>
				<Select
				  name="form-field-name"
				  placeholder="Select..."
				  value={this.state.selectedDatabase}
				  options={this.state.databaseOptions}
				  onChange={this.saveDatabaseChange}
				/>
				<div style={{fontSize:"15", marginTop: '10px', fontFamily:"Open Sans, sans-serif"}}>
					{"Select Genes to Add to Circuit:"}
				</div>
				<Select
				  name="form-field-name"
				  placeholder="Search Database..."
				  value={this.state.selectedGene.label}
				  options={this.state.geneOptions}
  				  isLoading={this.state.isLoadingExternally}
				  onInputChange={this.onInputChange}
				  onChange={this.onUserEnter}
				/>
			</div>
		);
	}
});

module.exports = AddNameInput;
