var JSZip = require("jszip");
var FileSaver = require('file-saver');
var File = require ('./GenerateFile');
var constants = require('./constants');

export function GenerateZip(data, getGeneInformation, genes, done) {
	let sequenceList = undefined;
	let geneList = [];

	genes.map(gene => {
		geneList.push({title:gene.geneName, uri:gene.database})
	});

	File.getGeneList_Promise(geneList).then(
	resp => {
		console.log(resp);
		sequenceList = resp;

		Promise.all(data[0].map(circuit =>
		    CreateFile_Promise(circuit, data[1], getGeneInformation, sequenceList)
		 )
		).then(textData => 
		{
			let zip = new JSZip();
			let iterator = 1;
			textData.map((text) => {
				zip.file("grfsm_"+iterator+".gb", text);
				iterator += 1;
			});

			zip.generateAsync({type:"blob"})
			.then(function (blob) {
			    FileSaver.saveAs(blob, "touchDown.zip");
			   	done();
			});
		})
	});
};

function CreateFile_Promise(circuit, partMap, getGeneInformation, sequenceList) {
    return new Promise(
        function (resolve, reject) {

        	let partNameList = CreatePartList(circuit, partMap, getGeneInformation);
            console.log("[GenerateZip:CreateFile_Promise] " + partNameList);

        	File.writeFilePromisified(partNameList, sequenceList).then(
			resp => {
				console.log(resp);
				if(resp !== undefined) {resolve(resp);}
				else {reject(new Error("GenerateZip.js function \"CreatePartList\" returned nothing"))};
				}
			);
        }
    );
}

function CreatePartList(circuit, partMap, getGeneInformation) {
	let circuitArray = [];
	let allCircuits = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

	let geneIdToPartMapping = [];
	let circuitsPartMapping = [];

	// Access by using state as index ... note that index 0 is just a filler (contents = same as index 1)
	allCircuits = [
		circuit[0][0], circuit[0][0],  circuit[0][1],
		circuit[0][2], circuit[0][3],
		circuit[0][4], circuit[0][5],
		circuit[0][6], circuit[0][7],  circuit[0][8],
		circuit[0][9], circuit[0][10],
		circuit[0][11],circuit[0][12],
		circuit[0][13],circuit[0][14], circuit[0][15],
	];
	circuitArray = allCircuits[1];
	geneIdToPartMapping = circuit[1];
	circuitsPartMapping = partMap;

	let geneMapping = {};
	if (geneIdToPartMapping.length !== 0) {
		for (let geneMap in geneIdToPartMapping) {
			const splitPartGene = geneMap.split('.');
			//Part id is stored at the second position, the gene position in that part is stored in the third position
			const partID = splitPartGene[1];
			const genePosition = splitPartGene[2];

			if (geneMapping[partID] === undefined) {
				geneMapping[partID] = {};
			}
			geneMapping[partID][genePosition] = geneIdToPartMapping[geneMap];
		};
	}



	let partNameList = [];
	let partIdForKey = 1;

	circuitsPartMapping = circuitsPartMapping[0];

	circuitArray.map((component) => {
		let componentId = component;

		if (typeof component === 'string') {
			componentId = constants.recombinaseToId[component];
		}

		let geneInfo = undefined;

		const partOriginalLocationId = circuitsPartMapping[partIdForKey-1]
		if (geneMapping[partOriginalLocationId]) {
			geneInfo = geneMapping[partOriginalLocationId];
		}
		partIdForKey += 1;

		const recombinaseID = Math.abs(componentId);
		// console.log("[GeneticCircuit:componentDidUpdate()] " + componentId);
		const components = constants.partIdToComponents[recombinaseID];
		// console.log("[GeneticCircuit:componentDidUpdate()] " + components);
		let geneNumber = 1;

		//flip == reverse the base pair sequence and then complement it, so ACAG -> GACA -> CTGT
		let curListLength = partNameList.length;
		components.map((component) => {
			let flip = false;
			if(componentId>0)
			{
				switch(component) {
					case 'R':
						partNameList.push({title:constants.Recombinases[recombinaseID].name, feature:"recombinase", flip:false});
						break;
					case '-P':
						flip = true;
					case 'P':
						partNameList.push({title:"proD",feature:"promoter",flip:flip});
						break;
					case '-G':
						flip = true;
					case 'G':
						const geneIdToAdd = geneInfo[geneNumber];
						const individualGeneInfo = getGeneInformation(geneIdToAdd);
						const geneName = individualGeneInfo['geneName'];
						const geneDatabase = individualGeneInfo['database'];
						const secondTitle = individualGeneInfo['secondTitle'];
						partNameList.push({title:geneName, uri:geneDatabase, secondTitle: secondTitle, feature:"CDS", flip:flip});
						geneNumber += 1;
						break;
					case '-T':
						flip = true;
					case 'T':
						partNameList.push({title:"terminator_black",feature:"terminator", flip:flip});
						break;
					case '-t':
						flip = true;
					case 't':
						partNameList.push({title:"terminator_red",feature:"terminator", flip:flip});
						break;
					default:
						break;
				}
			}
			else
			{
				switch(component) {
					case 'R':
						partNameList.splice(curListLength, 0, {title:constants.Recombinases[recombinaseID].flipname, feature:"recombinase", flip:true});
						break;
					case 'P':
						flip = true;
					case '-P':
						partNameList.splice(curListLength, 0, {title:"proD",feature:"promoter",flip:flip});
						break;
					case 'G':
						flip = true;
					case '-G':
						const geneIdToAdd = geneInfo[geneNumber];
						const individualGeneInfo = getGeneInformation(geneIdToAdd);
						const geneName = individualGeneInfo['geneName'];
						const geneDatabase = individualGeneInfo['database'];
						const secondTitle = individualGeneInfo['secondTitle'];
						partNameList.splice(curListLength, 0, {title:geneName, uri:geneDatabase, secondTitle: secondTitle, feature:"CDS", flip:flip});
						geneNumber += 1;
						break;
					case 'T':
						flip = true;
					case '-T':
						partNameList.splice(curListLength, 0, {title:"terminator_black",feature:"terminator", flip:flip});
						break;
					case 't':
						flip = true;
					case '-t':
						partNameList.splice(curListLength, 0, {title:"terminator_red",feature:"terminator", flip:flip});
						break;
					default:
						break;
				}
			}
		})
	})

	return partNameList;
};

