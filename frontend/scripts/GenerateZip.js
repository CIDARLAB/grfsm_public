var JSZip = require("jszip");
var FileSaver = require('file-saver');
var File = require ('./GenerateFile');
var constants = require('./constants');

export function GenerateZip(data, getGeneInformation, genes, done) {
	GenerateBuild(data, getGeneInformation, genes, done, false)
};

export function GenerateBuild(data, getGeneInformation, genes, done, fullBuild) {
	let sequenceList = undefined;
	let geneList = [];

	genes.map(gene => {
		geneList.push({title:gene.geneName, uri:gene.database})
	});

	File.getGeneList_Promise(geneList).then(
	resp => {
		// console.log(resp);
		sequenceList = resp;

		Promise.all(data[0].map(circuit =>
		    CreateFile_Promise(circuit, data[1], getGeneInformation, sequenceList)
		 )
		).then(allData => 
		{
			let zip = new JSZip();
			let csvData = {}
			let _duplicate_csvData = {}
			let designFolder = zip.folder("Design");

			let iterator = 1;
			allData.map((data) => {
				let dataFolder = designFolder.folder(iterator+"_grfsm");
				dataFolder.file(iterator+"_grfsm.gb", data.design);
				for(let i in data.csv)
				{
					if(!(i in csvData))
					{
						csvData[i] = data.csv[i];
					}
					else
					{
						_duplicate_csvData[i] = {title:data.csv[i], unique:csvData[i]};
					}
				};
				data.parts.map((part) => {
					let partFolder = dataFolder.folder("Primers");
					let _primerFileTitle = "PRIMER--"+part.title.primer+"--"+Math.floor(Math.random()*1000)+".gb";
					// _primerFileTitle=_primerFileTitle.substring(0,_primerFileTitle.lastIndexOf("--"));
					partFolder.file(_primerFileTitle, part.text.primer);
					if(part.title.part)
					{
						let partFolder = dataFolder.folder("Parts");
						partFolder.file("PART--"+part.title.part+"--"+Math.floor(Math.random()*1000)+".gb", part.text.part);
					}
				});
				iterator += 1;
			});

			let buildFolder = zip.folder("Build");
			let csvText = ""
			csvText += "Title,Sequence\n"
			for(let v in csvData)
			{
				csvText += csvData[v]+","+v+"\n";
			};
			buildFolder.file("UniquePrimers_forOrdering.csv", csvText);

			csvText = ""
			csvText += "Title,Sequence,Duplicate of...\n"
			for(let v in _duplicate_csvData)
			{
				csvText += _duplicate_csvData[v].title+","+v+","+_duplicate_csvData[v].unique+"\n";
			};
			buildFolder.file("DuplicatePrimers_NOT_ORDERING.csv", csvText);

			zip.generateAsync({type:"blob"})
			.then(function (blob) {
			    FileSaver.saveAs(blob, "AllCircuits.zip");
			   	done();
			});
		})
	});
};

function CreateFile_Promise(circuit, partMap, getGeneInformation, sequenceList) {
    return new Promise(
        function (resolve, reject) {

        	let partNameList = CreatePartList(circuit, partMap, getGeneInformation);
            // console.log("[GenerateZip:CreateFile_Promise] " + partNameList);

        	File.writeFilePromisified(partNameList, sequenceList, {}).then(
			resp => {
				Promise.all(partNameList.map(part =>
				    CreatePrimers_Promise(part, partNameList, sequenceList)
				 )
				).then(primerData => 
				{
				    FindBestPrimers_Promise(primerData)
				   	.then(primers => 
					{
						let csvData = {}
						primers.map(primer => {
							csvData[primer.sequence] = primer.title;
						});

						Promise.all(primers.map(primer => 
							File.writeFilePromisified([primer], sequenceList, {csv:true, build:true})
						 )
						).then(textData => {
								// console.log(partData);

								let allData={
									design:resp,
									parts:textData,
									csv: csvData
								};
								if(resp !== undefined) {resolve(allData);}
								else {reject(new Error("GenerateZip.js function \"CreatePartList\" returned nothing"))};
						})
					})
				})
			}
			);
        }
    );
}

function CreatePrimerCSV(){

}

function FindBestPrimers_Promise(primerData) {
	return new Promise(
        function (resolve, reject) {
            let partData = findBestPrimers(primerData);
            if(partData !== undefined) {resolve(partData);}
            else {reject(new Error("GenerateZip.js function \"findBestPrimers\" returned nothing"))};
        }
    );
};

function CreatePrimers_Promise(part, partNameList, partList) {
	return new Promise(
        function (resolve, reject) {
            let partData = createPrimers(part, partNameList, partList);
            if(partData !== undefined) {resolve(partData);}
            else {reject(new Error("GenerateZip.js function \"createPrimers\" returned nothing"))};
        }
    );
};

function findBestPrimers(primerData){
	//forw_list, forw_name, back_list, back_name
	let _primerList = [];
	let _listOfIndices = {};
	let _optimalIndices = {};
	let diff = 100;
	let COMPLETE_ITERATION = -1;
	let currentIteration = 0;

	let _primIter = -1;
    primerData.map(primerSet =>
    {
    	_primerList.push({list:primerSet.back_primer_List, title:primerSet.back_primer_name});
    	_listOfIndices[primerSet.back_primer_name] = 0;
    	COMPLETE_ITERATION += primerSet.back_primer_List.length - 1;
    	_primIter += 1;

    	_primerList.push({list:primerSet.forw_primer_List, title:primerSet.forw_primer_name, comp_primer_index:_primIter});
    	_listOfIndices[primerSet.forw_primer_name] = 0;
    	COMPLETE_ITERATION += primerSet.forw_primer_List.length - 1;
    	_primIter += 1;
    });
 
    // Find minimum and maximum of current three elements
    while(currentIteration < COMPLETE_ITERATION)
    {
	    let lastTemp = 0;
	    let lastMin = 1000;
	    let lastMax = 0;
	    let _indexToIncrement = -1;
	    let _lengthOfList = -1;
	    _primerList.map(primerSet =>
	    {
	    	lastMin = Math.min(lastMin, primerSet.list[_listOfIndices[primerSet.title]].anneal_temp);
	    	lastMax = Math.max(lastMax, primerSet.list[_listOfIndices[primerSet.title]].anneal_temp);
	    	lastTemp = primerSet.list[_listOfIndices[primerSet.title]].anneal_temp;
	    	if(lastMin == primerSet.list[_listOfIndices[primerSet.title]].anneal_temp)
		    {
		    	_indexToIncrement = primerSet.title;
		    	_lengthOfList = primerSet.list.length;
		    }
	    })

	    //Bail out if we've maxed out one of the primer sets trying to get to a similar temperature
	    if(_listOfIndices[_indexToIncrement] + 1 >= _lengthOfList)
	    {
	    	currentIteration = COMPLETE_ITERATION;
	    }
	    else
	    {
		    _listOfIndices[_indexToIncrement] += 1;
		    currentIteration += 1;
		}

	    if (lastMax-lastMin < diff)
	    {
	         diff = lastMax - lastMin;
	         currentIteration = diff == 0 ? COMPLETE_ITERATION : currentIteration;
	    }
	}

	_optimalIndices = _listOfIndices;

	let _optimalPrimerList = []
	_primerList.map(primerSet =>
	{
		if(primerSet.comp_primer_index !== undefined)
		{
	    	_optimalPrimerList.push({
	    		sequence:primerSet.list[_optimalIndices[primerSet.title]].sequence, 
	    		initSeq:primerSet.list[_optimalIndices[primerSet.title]].initSeq,
	    		mainSeq:primerSet.list[_optimalIndices[primerSet.title]].mainSeq, 
	    		lastSeq:File.ReverseAndComplement(_primerList[primerSet.comp_primer_index].list[_optimalIndices[_primerList[primerSet.comp_primer_index].title]].initSeq), 
	    		title:primerSet.title, 
	    		temp:primerSet.list[_optimalIndices[primerSet.title]].anneal_temp,
	    		feature:"forward_primer",
	    		flip:false
	    	});
	    }
	    else
	    {
	    	_optimalPrimerList.push({
	    		sequence:primerSet.list[_optimalIndices[primerSet.title]].sequence,
	    		title:primerSet.title, 
	    		temp:primerSet.list[_optimalIndices[primerSet.title]].anneal_temp,
	    		feature:"reverse_primer",
	    		flip:false
	    	});
	    }
    });
	// console.log(_optimalPrimerList);
	return _optimalPrimerList;
};

function createPrimers(name, nameList, partList){
	let seqDataList = [];
	let seqData = {
		type: '',
		index: -1,
		sequence: ''
	};
	let MAIN_SEQ = 0;
	let INIT_SEQ = 1;
	let LAST_SEQ = 2;
	
	for(let i = 0; i < nameList.length; i++) {
	   if(nameList[i] == name) {
	     seqDataList.push({type:'mainSeq', index:i, sequence:'', title:nameList[i].title});
	     let _initIndex = i-1 >= 0 ? i-1 : nameList.length - 1;
	     seqDataList.push({type:'initSeq', index:_initIndex, sequence:'', title:nameList[_initIndex].title});
	     let _lastIndex = i+1 < nameList.length ? i+1 : 0;
	     seqDataList.push({type:'lastSeq', index:_lastIndex, sequence:'', title:nameList[_lastIndex].title});
	     break;
	   }
	}

	for(let i = 0; i < seqDataList.length; i++) {
		let correctedSequence = ''
		if(nameList[seqDataList[i].index].title in File.hardCodedParts)
		{
			correctedSequence = File.hardCodedParts[nameList[seqDataList[i].index].title].toLowerCase();
		}
		else
		{
			let indexNum = -1;
			for(let v = 0; v < partList.length; v++) {
			   if(partList[v].title === nameList[seqDataList[i].index].title || partList[v].title === nameList[seqDataList[i].index].secondTitle) {
			     indexNum = v;
			     break;
			   }
			}
			let reducedString = partList[indexNum].sequence;
			correctedSequence = reducedString.toLowerCase();

		}

		if(nameList[seqDataList[i].index].flip)
		{
			correctedSequence = File.Complement(correctedSequence);
		}

		// if(nameList[seqDataList[i].index].title == "proD" && i == MAIN_SEQ)
		// {
		// 	console.log("SEQ_INDEX:"+seqDataList[i].index + " BEFORE SEQUENCE:" + seqDataList[i].sequence);
		// }
		
		seqDataList[i].sequence = correctedSequence;

		// if(nameList[seqDataList[i].index].title == "proD" && i == MAIN_SEQ)
		// 	console.log("MAIN_SEQ:" + MAIN_SEQ + " AFTER SEQUENCE:" + seqDataList[i].sequence);
	}

	//    _____                                      _   ____         _                             
	//   |  ___|___   _ __ __      __ __ _  _ __  __| | |  _ \  _ __ (_) _ __ ___    ___  _ __  ___ 
	//   | |_  / _ \ | '__|\ \ /\ / // _` || '__|/ _` | | |_) || '__|| || '_ ` _ \  / _ \| '__|/ __|
	//   |  _|| (_) || |    \ V  V /| (_| || |  | (_| | |  __/ | |   | || | | | | ||  __/| |   \__ \
	//   |_|   \___/ |_|     \_/\_/  \__,_||_|   \__,_| |_|    |_|   |_||_| |_| |_| \___||_|   |___/
	//                                                                                              
	let _forwardPrimerList = []; 
	let HOMOL_START_LENGTH = Math.min(30, seqDataList[INIT_SEQ].sequence.length);
	let HOMOL_END_LENGTH = Math.min(40, seqDataList[INIT_SEQ].sequence.length);

	for(let i = HOMOL_START_LENGTH; i < HOMOL_END_LENGTH + 1; i++) {
		let GENE_START_LENGTH = Math.min(seqDataList[MAIN_SEQ].sequence.length, 50-i);
		let GENE_END_LENGTH = Math.min(seqDataList[MAIN_SEQ].sequence.length, 60-i);
		for(let v = GENE_START_LENGTH; v < GENE_END_LENGTH + 1; v++) {
			let _initSEQ = seqDataList[INIT_SEQ].sequence.substring(seqDataList[INIT_SEQ].sequence.length-i, seqDataList[INIT_SEQ].sequence.length);
			let _mainSEQ = seqDataList[MAIN_SEQ].sequence.substring(0, v);
			let _annealTemp = _CalculateAnnealingTemperature(_initSEQ + _mainSEQ);
			_forwardPrimerList.push({sequence:_initSEQ+_mainSEQ, initSeq:_initSEQ, mainSeq:seqDataList[MAIN_SEQ].sequence, anneal_temp:_annealTemp})
		}
	}

	//Sort by increasing annealing temperature
	let keys = Object.keys(_forwardPrimerList);
	let _sortedForwardPrimerList = [];
	keys.sort(function(a, b) { return _forwardPrimerList[a].anneal_temp - _forwardPrimerList[b].anneal_temp });

	for(let x=0; x<keys.length;x++)
	{
		_sortedForwardPrimerList[x] = _forwardPrimerList[keys[x]];
	}
	// console.log(_sortedForwardPrimerList);

	let _forwardPrimerTitle = seqDataList[INIT_SEQ].title+"--"+seqDataList[MAIN_SEQ].title+"--"+seqDataList[LAST_SEQ].title;

	//    ____                _                              _   ____         _                             
	//   | __ )   __ _   ___ | | ____      __ __ _  _ __  __| | |  _ \  _ __ (_) _ __ ___    ___  _ __  ___ 
	//   |  _ \  / _` | / __|| |/ /\ \ /\ / // _` || '__|/ _` | | |_) || '__|| || '_ ` _ \  / _ \| '__|/ __|
	//   | |_) || (_| || (__ |   <  \ V  V /| (_| || |  | (_| | |  __/ | |   | || | | | | ||  __/| |   \__ \
	//   |____/  \__,_| \___||_|\_\  \_/\_/  \__,_||_|   \__,_| |_|    |_|   |_||_| |_| |_| \___||_|   |___/
	//                                                                                                      
	seqDataList[LAST_SEQ].sequence = File.ReverseAndComplement(seqDataList[LAST_SEQ].sequence);
	seqDataList[MAIN_SEQ].sequence = File.ReverseAndComplement(seqDataList[MAIN_SEQ].sequence);

	// if(seqDataList[MAIN_SEQ].title == "proD")
	// 	console.log("MAIN_SEQ:" + MAIN_SEQ + " LONG AFTER SEQUENCE: " + seqDataList[MAIN_SEQ].sequence);
	
	let _backwardPrimerList = []; 
	HOMOL_START_LENGTH = Math.min(30, seqDataList[LAST_SEQ].sequence.length);
	HOMOL_END_LENGTH = Math.min(40, seqDataList[LAST_SEQ].sequence.length);

	for(let i = HOMOL_START_LENGTH; i < HOMOL_END_LENGTH + 1; i++) {
		let GENE_START_LENGTH = Math.min(seqDataList[MAIN_SEQ].sequence.length, 50-i);
		let GENE_END_LENGTH = Math.min(seqDataList[MAIN_SEQ].sequence.length, 60-i);
		for(let v = GENE_START_LENGTH; v < GENE_END_LENGTH + 1; v++) {
			let _initSEQ = seqDataList[LAST_SEQ].sequence.substring(seqDataList[LAST_SEQ].sequence.length-i, seqDataList[LAST_SEQ].sequence.length);
			let _mainSEQ = seqDataList[MAIN_SEQ].sequence.substring(0, v);
			let _annealTemp = _CalculateAnnealingTemperature(_initSEQ + _mainSEQ);
			_backwardPrimerList.push({sequence:_initSEQ+_mainSEQ, initSeq:_initSEQ, mainSeq:seqDataList[MAIN_SEQ].sequence, anneal_temp:_annealTemp})
		}
	}

	//Sort by increasing annealing temperature
	let _sortedBackPrimerList = []
	keys = Object.keys(_backwardPrimerList);
	keys.sort(function(a, b) { return _backwardPrimerList[a].anneal_temp - _backwardPrimerList[b].anneal_temp });
	for(let x=0; x<keys.length;x++)
	{
		_sortedBackPrimerList[x] = _backwardPrimerList[keys[x]];
	}
	// console.log(_sortedBackPrimerList);

	let _backwardPrimerTitle = seqDataList[LAST_SEQ].title+"--"+seqDataList[MAIN_SEQ].title+"--"+seqDataList[INIT_SEQ].title;
	return {forw_primer_List:_sortedForwardPrimerList,forw_primer_name:_forwardPrimerTitle,back_primer_List:_sortedBackPrimerList,back_primer_name:_backwardPrimerTitle};
};

function _CalculateAnnealingTemperature(sequence)
{
	let primer_conc = 250.0;
	let salt_conc = 50.0;
	sequence = sequence.toUpperCase();
	//enthalpy
    let h=0;
    //entropy
    let s=0;

    //from table at http://pubs.acs.org/doi/full/10.1021/bi951907q (SantaLucia, 1996)
    //enthalpy values
    let deltaH = {
    	AA: -8.4,
    	AC: -8.6,
    	AG: -6.1,
    	AT: -6.5,
    	CA: -7.4,
    	CC: -6.7,
    	CG: -10.1,
    	CT: -6.1,
    	GA: -7.7,
    	GC: -11.1,
    	GG: -6.7,
    	GT: -8.6,
    	TA: -6.3,
    	TC: -7.7,
    	TG: -7.4,
    	TT: -8.4
    };
    //entropy values
    let deltaS = {
    	AA: -23.6,
    	AC: -23.0,
    	AG: -16.1,
    	AT: -18.8,
    	CA: -19.3,
    	CC: -15.6,
    	CG: -25.5,
    	CT: -16.1,
    	GA: -20.3,
    	GC: -28.4,
    	GG: -15.6,
    	GT: -23.0,
    	TA: -18.5,
    	TC: -20.3,
    	TG: -19.3,
    	TT: -23.6
    };

    //terminal corrections - Santalucia 1998
    let initBP=sequence.substring(0,1);
    if (initBP=="A" || initBP=="T")
    {
        h+=0.4
    }

    //using Nearest Neighor calculation for enthalpy and entropy - Santalucia 1996
    for (let i=0; i < sequence.length - 1; i++)
    {
        let sub_seq=sequence.substring(i,i+2);
        h+=deltaH[sub_seq]
        s+=deltaS[sub_seq]
	}

    //any G*C pair?
    if (sequence.includes("G") || sequence.includes("C"))
    {
    	s-=5.9
    }
        
    // Using a mix of these two papers' formulas using the NN method:
    // Improved Nearest-Neighbor Parameters for Predicting DNA Duplex Stability
    // http://pubs.acs.org/doi/pdf/10.1021/bi951907q
    // value of constant = 12.5

    // Comparison of different melting temperature calculation methods for short DNA sequences
    // https://academic.oup.com/bioinformatics/article/21/6/711/199347/Comparison-of-different-melting-temperature
    // value of constant = 16.6
    let T=((1000*h)/(s+(1.987*Math.log(primer_conc/4000000000.0))))-273.15 + ((12.5+16.6)/2)*Math.log10(salt_conc/1000);
    // console.log(T.toFixed(1));
   	// console.log(h.toFixed(2));
   	// console.log(s.toFixed(2));

   	return T;
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
