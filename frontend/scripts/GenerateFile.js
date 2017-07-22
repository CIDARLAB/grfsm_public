export function GenerateFile(nameList) {
	let textFile = "LOCUS";
	let date = new Date();

	let monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

	textFile += addTabs(2)+"grfsm"+addTabs(5)+"2143%20bp%20ds-DNA"+addTabs(2)+"circular%09"+date.getDate()+"-"+monthNames[date.getMonth()]+"-"+date.getFullYear();
	textFile += "%0A";
	textFile += "DEFINITION"+addTabs(1)+".";
	textFile += "%0A";
	textFile += "KEYWORDS"+addTabs(1)+"Created by the LCP project grfsm tool";
	textFile += "%0A";
	textFile += "FEATURES"+addTabs(3)+"Location/Qualifiers";
	textFile += "%0A";
	textFile += addTabs(1)+"CDS"+addTabs(4)+"complement(753..1613)";
	textFile += "%0A";
	textFile += addTabs(5)+"/label=%E2%80%9Cbla%E2%80%9D";

	nameList.map((name) => {
			
	})
	return textFile;
}

export function addTabs(num) {
	let text = '';
	for(let i=0; i<num; i++)
	{
		text += "%09";
	}
	return text;
}

export const proD = "GCACTGAAGGTCCTCAATCGCACTGGAAACATCAAGGTCGaaagttaaacaaaattatttgtagagggaaaccgttgtggtctccctgaatatattatacgagccttatgcatgcccgtaaagttatccagcaaccactcatagacctagggcagcagatagggacgacgtggtgttagctgtgCTGACCTCCTGCCAGCAATAGTAAGACAACACGCAAAGTC";
export const TP901B_AG = "GCTGGGAGTTCGTAGACGGAAACAAACGCAGAATCCAAGCatgccaacacaattaacatcagaatcaaggtaaatgctttttgctttttttgcGCACTGAAGGTCCTCAATCGCACTGGAAACATCAAGGTCG";
export const TP901B_TC = "CATTACTCGCATCCATTCTCAGGCTGTCTCGTCTCGTCTCatgccaacacaattaacatctcaatcaaggtaaatgctttttgctttttttgcGCTGGGAGTTCGTAGACGGAAACAAACGCAGAATCCAAGC";
export const TP901P_AG = "CTCGTTCGCTGCCACCTAAGAATACTCTACGGTCACATACaaaggagttttttagttaccttaattctaataaacgaaataaaaactcgcCAAGACGCTGGCTCTGACATTTCCGCTACTGAACTACTCG";
export const TP901P_TC = "CCTCGTCTCAACCAAAGCAATCAACCCATCAACCACCTGGaaaggagttttttagttaccttaattgaaataaacgaaataaaaactcgcGTTCCTTATCATCTGGCGAATCGGACCCACAAGAGCACTG";
export const BxBIB_GT = "CTGACCTCCTGCCAGCAATAGTAAGACAACACGCAAAGTCcggccggcttgtcgacgacggcggtctccgtcgtcaggatcatccgggcGAGCCAACTCCCTTTACAACCTCACTCAAGTCCGTTAGAG";
export const BxBIP_GT = "CAAGACGCTGGCTCTGACATTTCCGCTACTGAACTACTCGgtcgtggtttgtctggtcaaccaccgcggtctcagtggtgtacggtacaaaccccgacCCTCGTCTCAACCAAAGCAATCAACCCATCAACCACCTGG";