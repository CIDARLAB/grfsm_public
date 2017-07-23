var FileSaver = require('file-saver');

export var GenerateFile = function(nameList) {
	getGeneList(nameList, function(nameList, partList) {
			writeFile(nameList, partList)
		});
};

var writeFile = function(nameList, partList) {
	let textFile = "LOCUS";
	let date = new Date();
	let fullSequence = '';

	let monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

	textFile += addSpace(7)+"grfsm_gb"+addSpace(12)+"2143"+addSpace(1)+"bp"+addSpace(1)+"ds-DNA"+addSpace(5)+"circular"+addSpace(5)+date.getDate()+"-"+monthNames[date.getMonth()]+"-"+date.getFullYear();
	textFile += addNewLine(1);
	textFile += "DEFINITION"+addTabs(1)+".";
	textFile += addNewLine(1);
	textFile += "KEYWORDS"+addSpace(4)+"Created"+addSpace(1)+"by"+addSpace(1)+"the"+addSpace(1)+"LCP"+addSpace(1)+"project"+addSpace(1)+"grfsm"+addSpace(1)+"tool";
	textFile += addNewLine(1);
	textFile += "FEATURES"+addTabs(3)+"Location/Qualifiers";

	let currentBPNum = 1;
	nameList.map((name) => {
		if(name.title in hardCodedParts)
		{
			let correctedSequence = hardCodedParts[name.title].toLowerCase();
			if(name.flip)
			{
				correctedSequence = reverseAndComplement(correctedSequence);
			}
			fullSequence += correctedSequence;
			textFile += addNewLine(1);
			textFile += addSpace(5)+name.feature+addSpace(24-name.feature.toString().length)+currentBPNum+".."+(currentBPNum + hardCodedParts[name.title].length - 1);
			currentBPNum += hardCodedParts[name.title].length;
			textFile += addNewLine(1);
			textFile += addSpace(29)+"/label=\""+name.title+"\"";
		}
		else
		{
			// console.log(name);
			// console.log(name.title);
			// console.log(partList);
			let indexNum = -1;
			for(let i = 0; i < partList.length; i++) {
			   if(partList[i].title === name.title) {
			     indexNum = i;
			     break;
			   }
			}
			let reducedString = partList[indexNum].sequence.replace(/\n/ig, '');
			let correctedSequence = reducedString.toLowerCase();
			if(name.flip)
			{
				correctedSequence = reverseAndComplement(correctedSequence);
			}
			fullSequence += correctedSequence;
			textFile += addNewLine(1);
			textFile += addSpace(5)+name.feature+addSpace(24-name.feature.toString().length)+currentBPNum+".."+(currentBPNum + partList[indexNum].sequence.length - 1);
			currentBPNum += partList[indexNum].sequence.length;
			textFile += addNewLine(1);
			textFile += addSpace(29)+"/label=\""+name.title+"\"";
		}
	})

	textFile += addNewLine(1);
	textFile += "ORIGIN";
	textFile += generateSequence(fullSequence);
	textFile += addNewLine(1);
	textFile += "//";

	var blob = new Blob([textFile], {type: "text/plain;charset=utf-8"});
	FileSaver.saveAs(blob, "grfsm.gb");
}

var getGeneList = function(nameList, callback) {
	let urls = [];
	let FASTAurls = [];
	let sequenceList = [];

	for(let i=0; i<nameList.length; i++)
	{
		if(!(nameList[i].title in hardCodedParts))
		{
			let searchArray = "https://synbiohub.programmingbiology.org/remoteSearch/role%3D%3Chttp%3A%2F%2Fidentifiers.org%2Fso%2FSO%3A0000316%3E%26"+nameList[i].title+"/?offset=0&limit=50";
			if(urls.indexOf(searchArray) === -1)
			{
				urls.push(searchArray);
			}
		}
	}
	Promise.all(urls.map(url =>
	    fetch(url).then(resp => resp.text())
	)).then(data => {
	    console.log(data);
	    let tempURIs = [];
	    for(let x=0; x<data.length; x++)
		{
			tempURIs[x] = {uri:"", title:""}
			JSON.parse(data[x], (key, value) => {
				if(key == "uri")
				{
					tempURIs[x].uri = value;
				}
				else if(key == "name")
				{
					tempURIs[x].title = value;
				}
			});
			console.log(tempURIs[x]);
		}
		for(let y=0; y<tempURIs.length; y++)
		{
			FASTAurls.push(tempURIs[y].uri + "/" + tempURIs[y].title + ".fasta");
		}

	    Promise.all(FASTAurls.map(seqURL =>
		    fetch(seqURL).then(resp => resp.text())
		)).then(seqData => {
		    console.log(seqData);
		    for(let j=0; j<seqData.length; j++)
			{
				let startChar = seqData[j].indexOf("\n");
				let endChar = seqData[j].indexOf(" ");
				sequenceList.push({title:seqData[j].substr(1, endChar - 1), sequence:seqData[j].substr(startChar + 1, seqData[j].length-1)});
				console.log(sequenceList);
			}
		    callback(nameList, sequenceList);
		})
	})
}

function generateSequence(fullSequence) {
	let text = '';
	const segmentsPerLine = 6;
	const segmentLength = 10;

	for(let i=0; i<fullSequence.length/10; i++)
	{
		if(i%segmentsPerLine == 0)
		{
			text += addNewLine(1);
			if(i==0){text += addSpace(8);}
			else if(i==segmentsPerLine){text += addSpace(7);}
			else {text += addSpace(6);}
			text += ""+(i*segmentLength+1);
		}
		text += addSpace(1) + fullSequence.substring(i*segmentLength,Math.min(fullSequence.length-1,(i+1)*segmentLength-1));
		// console.log("[GenerateFile:generateSequence] iterated: " + text);
	}
	// console.log("[GenerateFile:generateSequence] final: " + text);
	return text;
}

function reverseAndComplement(sequence) {
	let tempSeq = '';
	let text = '';
	tempSeq = sequence.split("").reverse().join("");
	console.log(tempSeq);

	for(let i=0; i<tempSeq.length;i++)
	{
		if(tempSeq[i]=='a') {text += 't';}
		else if(tempSeq[i]=='c') {text += 'g';}
		else if (tempSeq[i]=='g') {text += 'c';}
		else if (tempSeq[i]=='t') {text += 'a';}
	}

	console.log(text);
	return text;
}

function addNewLine(num) {
	let text = '';
	for(let i=0; i<num; i++)
	{
		text += "\n";
	}
	return text;
}

function addTabs(num) {
	let text = '';
	for(let i=0; i<num; i++)
	{
		text += "\t";
	}
	return text;
}

function addSpace(num) {
	let text = '';
	for(let i=0; i<num; i++)
	{
		text += " ";
	}
	return text;
}

const hardCodedParts = {
	proD: "GCACTGAAGGTCCTCAATCGCACTGGAAACATCAAGGTCGaaagttaaacaaaattatttgtagagggaaaccgttgtggtctccctgaatatattatacgagccttatgcatgcccgtaaagttatccagcaaccactcatagacctagggcagcagatagggacgacgtggtgttagctgtgCTGACCTCCTGCCAGCAATAGTAAGACAACACGCAAAGTC",
	TP901B_AG: "GCTGGGAGTTCGTAGACGGAAACAAACGCAGAATCCAAGCatgccaacacaattaacatcagaatcaaggtaaatgctttttgctttttttgcGCACTGAAGGTCCTCAATCGCACTGGAAACATCAAGGTCG",
	TP901B_TC: "CATTACTCGCATCCATTCTCAGGCTGTCTCGTCTCGTCTCatgccaacacaattaacatctcaatcaaggtaaatgctttttgctttttttgcGCTGGGAGTTCGTAGACGGAAACAAACGCAGAATCCAAGC",
	TP901P_AG: "CTCGTTCGCTGCCACCTAAGAATACTCTACGGTCACATACaaaggagttttttagttaccttaattctaataaacgaaataaaaactcgcCAAGACGCTGGCTCTGACATTTCCGCTACTGAACTACTCG",
	TP901P_TC: "CCTCGTCTCAACCAAAGCAATCAACCCATCAACCACCTGGaaaggagttttttagttaccttaattgaaataaacgaaataaaaactcgcGTTCCTTATCATCTGGCGAATCGGACCCACAAGAGCACTG",
	BxBIB_GT: "CTGACCTCCTGCCAGCAATAGTAAGACAACACGCAAAGTCcggccggcttgtcgacgacggcggtctccgtcgtcaggatcatccgggcGAGCCAACTCCCTTTACAACCTCACTCAAGTCCGTTAGAG",
	BxBIP_GT: "CAAGACGCTGGCTCTGACATTTCCGCTACTGAACTACTCGgtcgtggtttgtctggtcaaccaccgcggtctcagtggtgtacggtacaaaccccgacCCTCGTCTCAACCAAAGCAATCAACCCATCAACCACCTGG",
	terminator_red: "GGGGGGGGGGGG", //12 G's - temporary
	terminator_black: "AAAAAAAAAAAA" //12 A's - temporary
};