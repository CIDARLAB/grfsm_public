var FileSaver = require('file-saver');

export var GenerateFile = function(nameList) {
	getGeneList_Promise(nameList).then(
	seqList => {
			writeFilePromisified(nameList, seqList).then(
				resp => {
					// console.log(resp);
					let blob = new Blob([resp], {type: "text/plain;charset=utf-8"});
					FileSaver.saveAs(blob, "grfsm.gb");
				}
			);
	});
};

export function writeFilePromisified(nameList, partList) {
    return new Promise(
        function (resolve, reject) {
            let textFile = writeFile(nameList, partList);
            if(textFile !== undefined) {resolve(textFile);}
            else {reject(new Error("GenerateFile.js function \"writeFile\" returned nothing"))};
        }
    );
}

function writeFile(nameList, partList) {
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
			// if(name.flip)
			// {
			// 	correctedSequence = reverseAndComplement(correctedSequence);
			// }
			fullSequence += correctedSequence;
			textFile += addNewLine(1);
			textFile += addSpace(5)+name.feature+addSpace(24-name.feature.toString().length);
			if(name.flip)
			{
				// textFile += "complement(" + (currentBPNum + correctedSequence.length - 1) + ".." + currentBPNum + ")";
				textFile += "complement(" + currentBPNum + ".." + (currentBPNum + correctedSequence.length - 1) + ")";
			}
			else
			{
				textFile += currentBPNum+".."+(currentBPNum + correctedSequence.length - 1);
			}
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
				// console.log(name.title + " " + name.secondTitle + " " + partList[i].title);
			   if(partList[i].title === name.title || partList[i].title === name.secondTitle) {
			     indexNum = i;
			     break;
			   }
			}
			let reducedString = partList[indexNum].sequence;
			let correctedSequence = reducedString.toLowerCase();
			// if(name.flip)
			// {
			// 	correctedSequence = reverseAndComplement(correctedSequence);
			// }
			fullSequence += correctedSequence;
			textFile += addNewLine(1);
			textFile += addSpace(5)+name.feature+addSpace(24-name.feature.toString().length);
			if(name.flip)
			{
				// textFile += "complement(" + (currentBPNum + correctedSequence.length - 1) + ".." + currentBPNum + ")";
				textFile += "complement(" + currentBPNum + ".." + (currentBPNum + correctedSequence.length - 1) + ")";
			}
			else
			{
				textFile += currentBPNum+".."+(currentBPNum + correctedSequence.length - 1);
			}
			currentBPNum += correctedSequence.length;
			textFile += addNewLine(1);
			textFile += addSpace(29)+"/label=\""+name.title;
			if(name.secondTitle !== undefined && name.secondTitle !== name.title)
			{
				textFile += addSpace(1)+"("+name.secondTitle+")";
			}
			textFile += "\"";
		}
	})

	textFile += addNewLine(1);
	textFile += "ORIGIN";
	textFile += generateSequence(fullSequence);
	textFile += addNewLine(1);
	textFile += "//";

	return textFile;
}

export function getGeneList_Promise(nameList) {
	return new Promise(
        function (resolve, reject) {
        	let urls = [];
			let sequenceList = [];

			for(let i=0; i<nameList.length; i++)
			{
				if(!(nameList[i].title in hardCodedParts))
				{
					// console.log(nameList[i]);
					// console.log(nameList[i].uri);
					let fullURI = nameList[i].uri + "/" + nameList[i].title + ".gb";
					if(urls.indexOf(fullURI) === -1)
					{
						urls.push(fullURI);
					}
				}
			}

		    Promise.all(urls.map(seqURL =>
			    fetch(seqURL).then(resp => resp.text())
			)).then(seqData => {
			    // console.log(seqData);
			    for(let j=0; j<seqData.length; j++)
				{
					let titleStartChar = seqData[j].indexOf("ACCESSION") + ("ACCESSION").toString().length;
					let titleEndChar = seqData[j].indexOf("VERSION");
					let titleName = seqData[j].substring(titleStartChar, titleEndChar);
					titleName = titleName.replace(/\n|\s/ig, '');
					// console.log("[GenerateFile:getGeneList] title: " + titleName);

					let searchIndex = seqData[j].lastIndexOf("ORIGIN");
					// console.log("[GenerateFile:getGeneList] searchIndex: " + searchIndex);
					// console.log("[GenerateFile:getGeneList] seqData[j].substr(searchIndex, seqData[j].length): " + seqData[j].substr(searchIndex, seqData[j].length));
					let seqStartChar = seqData[j].substr(searchIndex, seqData[j].length);
					// console.log("[GenerateFile:getGeneList] seqStartChar: " + seqStartChar);
					seqStartChar = seqStartChar.indexOf("1");
					// console.log("[GenerateFile:getGeneList] seqStartChar index of 1: " + seqStartChar);
					let seqEndChar = seqData[j].lastIndexOf("/");
					let seqClean = seqData[j].substr(searchIndex + seqStartChar, seqEndChar-1);
					seqClean = seqClean.replace(/\n|[0-9]+|\s|\//ig, '');
					// console.log("[GenerateFile:getGeneList] sequence: " + seqClean);
					sequenceList.push({title:titleName, sequence:seqClean});
					// console.log(sequenceList);
				}

	            if(sequenceList !== undefined) {resolve(sequenceList);}
	            else {reject(new Error("GenerateFile.js function \"getGeneList_Promise\" returned nothing"))};
			})            
        }
    );
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
			else if(i>=(17*segmentsPerLine)){text += addSpace(5);}
			else {text += addSpace(6);}
			text += ""+(i*segmentLength+1);
		}
		// console.log(i*segmentLength);
		// console.log(Math.min(fullSequence.length,((i+1)*segmentLength)));
		text += addSpace(1) + fullSequence.substring(i*segmentLength,Math.min(fullSequence.length,(i+1)*segmentLength));

		// text += addSpace(1) + fullSequence.substr(i*segmentLength,Math.min( fullSequence.length-1 ,((i+1)*segmentLength)-1) );
		// console.log("[GenerateFile:generateSequence] iterated: " + text);
	}
	// console.log("[GenerateFile:generateSequence] final: " + text);
	return text;
}

function reverseAndComplement(sequence) {
	let tempSeq = '';
	let text = '';
	tempSeq = sequence.split("").reverse().join("");
	// console.log(tempSeq);

	for(let i=0; i<tempSeq.length;i++)
	{
		if(tempSeq[i]=='a') {text += 't';}
		else if(tempSeq[i]=='c') {text += 'g';}
		else if (tempSeq[i]=='g') {text += 'c';}
		else if (tempSeq[i]=='t') {text += 'a';}
	}

	// console.log(text);
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