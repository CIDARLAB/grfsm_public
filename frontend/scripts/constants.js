export const Recombinases = {
	//Blue
	100: {
		recombinationSiteId: 1,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#66ccff',
		name: 'TP901'
	},
	//Blue
	101: {
		recombinationSiteId: 2,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#66ccff',
		name: 'TP901'
	},
	//Orange triangle
	102: {
		recombinationSiteId: 2,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#ff9900',
		name: 'BxbI'
	},
	//Orange oval
	103: {
		recombinationSiteId: 1,
		stroke: 'black',
		strokeWidth: 1,
		fill: '#ff9900',
		name: 'BxbI'
	},
	//Purple triangle
	104: {
		recombinationSiteId: 2,
		stroke: 'black',
		strokeWidth: 1,
		fill: 'rgb(148, 123, 209)',
		name: 'A118'
	},
	//Purple oval
	105: {
		recombinationSiteId: 1,
		stroke: 'black',
		strokeWidth: 1,
		fill: 'rgb(148, 123, 209)',
		name: 'A118'
	},
};

export const partIdToComponents = {
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

/*
* Maps the recombinant elements to their ids
*/
export const recombinaseToId = {
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