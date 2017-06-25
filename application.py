import json
import time
import re

from flask import Flask, Response, request
from application import db
from application.models import grfsmArray, circuitArray

from backend.db_functions.searchGRFSM import *
from backend.db_functions.circuitRank import *
from backend.db_functions.search316 import threeInput16StateSearch, threeInput16StateSearchFromBruteForce, newThreeInputSearch
from backend.python_alg.GeneticCircuitBuilder import build5StateCircuit, build16StateCircuit, expressedGenesByState

# Elastic Beanstalk initalization
application = Flask(__name__, static_url_path='', static_folder='frontend')

###application.secret_key = #####

application.add_url_rule('/', 'root', lambda: application.send_static_file('index.html'))

@application.route('/api/rankedCircuitFromDesign', methods = ['GET'])
def rankedCircuitFromDesign():
	# if True:
	# 	toReturn = [[([[5, 'D', 5, '[', 5, '(', 5, '-[', 3, '(', 1, '-D', -14], [5, 'D', 5, '[', 5, '(', 1, '-D', -14], [5, 'D', -1, '-(', -3, '[', 5, '(', 5, '-[', -5, '-D', -14], [5, 'D', -1, '-(', -5, '-[', -5, '-D', -14], [5, 'D', -1, '-(', -5, '-[', 3, '(', 5, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[14, 'D', -1, '[', 5, '(', 5, '-[', -3, '(', 5, '-D', 5], [14, 'D', -1, '[', 5, '(', 5, '-D', 5], [14, 'D', -5, '-(', 3, '[', 5, '(', 5, '-[', 1, '-D', 5], [14, 'D', -5, '-(', -5, '-[', 1, '-D', 5], [14, 'D', -5, '-(', -5, '-[', -3, '(', 5, '-[', 1, '-D', 5]], {'G.3.1': 0}), ([[5, 'D', 5, '[', 5, '(', -15, '-[', 14, '(', 1, '-D', -14], [5, 'D', 5, '[', 5, '(', 1, '-D', -14], [5, 'D', -1, '-(', -14, '[', 5, '(', -15, '-[', -5, '-D', -14], [5, 'D', -1, '-(', -5, '-[', -5, '-D', -14], [5, 'D', -1, '-(', -5, '-[', 14, '(', -15, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[-1, 'D', 5, '[', 5, '(', -14, '-[', -7, '(', -7, '-D', -14], [-1, 'D', 5, '[', 5, '(', -7, '-D', -14], [-1, 'D', 7, '-(', 7, '[', 5, '(', -14, '-[', -5, '-D', -14], [-1, 'D', 7, '-(', -5, '-[', -5, '-D', -14], [-1, 'D', 7, '-(', -5, '-[', -7, '(', -14, '-[', -5, '-D', -14]], {'G.1.1': 0}), ([[5, 'D', -7, '[', -7, '(', -15, '-[', 14, '(', 1, '-D', -14], [5, 'D', -7, '[', -7, '(', 1, '-D', -14], [5, 'D', -1, '-(', -14, '[', -7, '(', -15, '-[', 7, '-D', -14], [5, 'D', -1, '-(', 7, '-[', 7, '-D', -14], [5, 'D', -1, '-(', 7, '-[', 14, '(', -15, '-[', 7, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', 5, '[', -10, '(', 3, '-[', 5, '(', 1, '-D', -14], [5, 'D', 5, '[', -10, '(', 1, '-D', -14], [5, 'D', -1, '-(', -5, '[', -10, '(', 3, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 10, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 10, '-[', 5, '(', 3, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', 5, '[', 5, '(', 10, '-[', -7, '(', 1, '-D', -14], [5, 'D', 5, '[', 5, '(', 1, '-D', -14], [5, 'D', -1, '-(', 7, '[', 5, '(', 10, '-[', -5, '-D', -14], [5, 'D', -1, '-(', -5, '-[', -5, '-D', -14], [5, 'D', -1, '-(', -5, '-[', -7, '(', 10, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[14, 'D', -1, '[', 5, '(', -10, '-[', 7, '(', 5, '-D', 5], [14, 'D', -1, '[', 5, '(', 5, '-D', 5], [14, 'D', -5, '-(', -7, '[', 5, '(', -10, '-[', 1, '-D', 5], [14, 'D', -5, '-(', -5, '-[', 1, '-D', 5], [14, 'D', -5, '-(', -5, '-[', 7, '(', -10, '-[', 1, '-D', 5]], {'G.3.1': 0}), ([[-1, 'D', 10, '[', 5, '(', -14, '-[', -7, '(', 5, '-D', 5], [-1, 'D', 10, '[', 5, '(', 5, '-D', 5], [-1, 'D', -5, '-(', 7, '[', 5, '(', -14, '-[', -10, '-D', 5], [-1, 'D', -5, '-(', -5, '-[', -10, '-D', 5], [-1, 'D', -5, '-(', -5, '-[', -7, '(', -14, '-[', -10, '-D', 5]], {'G.1.1': 0}), ([[5, 'D', 5, '[', -7, '(', 10, '-[', 3, '(', 1, '-D', -14], [5, 'D', 5, '[', -7, '(', 1, '-D', -14], [5, 'D', -1, '-(', -3, '[', -7, '(', 10, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 7, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 7, '-[', 3, '(', 10, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', 5, '[', -10, '(', 14, '-[', -7, '(', 1, '-D', -14], [5, 'D', 5, '[', -10, '(', 1, '-D', -14], [5, 'D', -1, '-(', 7, '[', -10, '(', 14, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 10, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 10, '-[', -7, '(', 14, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', 5, '[', -10, '(', 6, '-[', -7, '(', 1, '-D', -14], [5, 'D', 5, '[', -10, '(', 1, '-D', -14], [5, 'D', -1, '-(', 7, '[', -10, '(', 6, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 10, '-[', -5, '-D', -14], [5, 'D', -1, '-(', 10, '-[', -7, '(', 6, '-[', -5, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', -10, '[', -7, '(', -15, '-[', 14, '(', 1, '-D', -14], [5, 'D', -10, '[', -7, '(', 1, '-D', -14], [5, 'D', -1, '-(', -14, '[', -7, '(', -15, '-[', 10, '-D', -14], [5, 'D', -1, '-(', 7, '-[', 10, '-D', -14], [5, 'D', -1, '-(', 7, '-[', 14, '(', -15, '-[', 10, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', -7, '[', -10, '(', -15, '-[', 14, '(', 1, '-D', -14], [5, 'D', -7, '[', -10, '(', 1, '-D', -14], [5, 'D', -1, '-(', -14, '[', -10, '(', -15, '-[', 7, '-D', -14], [5, 'D', -1, '-(', 10, '-[', 7, '-D', -14], [5, 'D', -1, '-(', 10, '-[', 14, '(', -15, '-[', 7, '-D', -14]], {'G.11.1': 0}), ([[14, 'D', -11, '[', 5, '(', -10, '-[', -3, '(', 5, '-D', 5], [14, 'D', -11, '[', 5, '(', 5, '-D', 5], [14, 'D', -5, '-(', 3, '[', 5, '(', -10, '-[', 11, '-D', 5], [14, 'D', -5, '-(', -5, '-[', 11, '-D', 5], [14, 'D', -5, '-(', -5, '-[', -3, '(', -10, '-[', 11, '-D', 5]], {'G.3.1': 0}), ([[14, 'D', -1, '[', 10, '(', -10, '-[', 15, '(', 5, '-D', 5], [14, 'D', -1, '[', 10, '(', 5, '-D', 5], [14, 'D', -5, '-(', -15, '[', 10, '(', -10, '-[', 1, '-D', 5], [14, 'D', -5, '-(', -10, '-[', 1, '-D', 5], [14, 'D', -5, '-(', -10, '-[', 15, '(', -10, '-[', 1, '-D', 5]], {'G.3.1': 0}), ([[5, 'D', -10, '[', 5, '(', -10, '-[', 3, '(', 1, '-D', -14], [5, 'D', -10, '[', 5, '(', 1, '-D', -14], [5, 'D', -1, '-(', -3, '[', 5, '(', -10, '-[', 10, '-D', -14], [5, 'D', -1, '-(', -5, '-[', 10, '-D', -14], [5, 'D', -1, '-(', -5, '-[', 3, '(', -10, '-[', 10, '-D', -14]], {'G.11.1': 0}), ([[5, 'D', -10, '[', -10, '(', -15, '-[', 14, '(', 1, '-D', -14], [5, 'D', -10, '[', -10, '(', 1, '-D', -14], [5, 'D', -1, '-(', -14, '[', -10, '(', -15, '-[', 10, '-D', -14], [5, 'D', -1, '-(', 10, '-[', 10, '-D', -14], [5, 'D', -1, '-(', 10, '-[', 14, '(', -15, '-[', 10, '-D', -14]], {'G.11.1': 0}), ([[14, 'D', -11, '[', 10, '(', -10, '-[', 4, '(', 5, '-D', 5], [14, 'D', -11, '[', 10, '(', 5, '-D', 5], [14, 'D', -5, '-(', -4, '[', 10, '(', -10, '-[', 11, '-D', 5], [14, 'D', -5, '-(', -10, '-[', 11, '-D', 5], [14, 'D', -5, '-(', -10, '-[', 4, '(', -10, '-[', 11, '-D', 5]], {'G.3.1': 0})], [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [1, 2, 3, 4, 5, 10, 11, 12, 13], [1, 2, 11, 4, 9, 6, 5, 8, 7, 10, 3, 12, 13], [1, 2, 11, 4, 5, 6, 3, 8, 13], [1, 2, 11, 4, 5, 6, 9, 8, 7, 10, 3, 12, 13]]]
	#  	return Response(json.dumps(toReturn), mimetype='application/json', headers={'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*'})
	stateExpressionData = {}
	argsData = dict((key, request.args.getlist(key)) for key in request.args.keys())

	##TODO: pass in an argument that tells us how many states are in this state machine
	##will default to 5 for now
	numInputsToStates = [None, None, 5, 16]
	totalNumStates = 5
	TOTAL_NUM_GENES = int(request.args.get('numberOfGenes'))

	if request.args.get('numInputs') != None:
		totalNumStates = numInputsToStates[int(request.args.get('numInputs'))]
	#print totalNumStates
	##Make the stateExpressionData hash to be used later
	##It should look like the following in structure:
	##	{
	##		1: {1,2}
	##		2: {1}
	##		3: {2}
	##		4: {2}
	##		5: {}
	##}

	##Need some way to denote that we are dealing with a 3 input, 16 state circuit (done above)

	for key in argsData:
		if 'stateExpressions' in key:
			##Parse the string to get the state number and the gene number out
			#print key
			numbers = re.findall(r'\d+', key)
			state = int(numbers[0])
			geneId = int(numbers[1])
			if state in stateExpressionData:
				##Only add genes that should be on to the state expressions dictionary
				if 'true' in argsData[key]:
					stateExpressionData[state].add(geneId)
			else:
				stateExpressionData[state] = set()
				##Only add genes that should be on to the state expressions dictionary
				if 'true' in argsData[key]:
					stateExpressionData[state].add(geneId)

	grfsmToSearchFor = [None] * totalNumStates
	for i in range(totalNumStates):
		blankExpressionArray = [0] * TOTAL_NUM_GENES
		grfsmToSearchFor[i] = blankExpressionArray
		for j in range(0,TOTAL_NUM_GENES):
			geneId = j
			stateId = i + 1
			if stateId in stateExpressionData:
				if geneId in stateExpressionData[i+1]:
					grfsmToSearchFor[i][j] = 1

	# print('State design')
	# print(stateExpressionData)
	##This is where we should be differentiating which search algorithm to use (16 state vs.
	##5 state).
	print('Searching for circuits')
	circuits = []
	if totalNumStates == 16:
		##The max genes, min 5s and threshold values should also come from the user
		##from their request. For now, it will be based on the total number of genes in the
		##system
		##maxNumGenesPlus1 => numberOfGenes in the system + 1
		##minNumberOf5s => 8 - (number of genes in the system)
		##threshold => numberOfGenes + 2
		##This is currently being set in the search function rather than here.
		maxNumGenesPlus1 = TOTAL_NUM_GENES+1
		minNumberOf5s = max(8 - TOTAL_NUM_GENES, 0)
		threshold = TOTAL_NUM_GENES+2
		# circuits = threeInput16StateSearch(grfsmToSearchFor, maxNumGenesPlus1, minNumberOf5s, threshold)
		#circuits = [5, 5, 5, 5, 5, 5, 5, -3, 5, 5, -1, 5, 5]
		print grfsmToSearchFor
		# circuits = threeInput16StateSearchFromBruteForce(grfsmToSearchFor)
		circuits = newThreeInputSearch(grfsmToSearchFor)
	else:
		circuits = searchGRFSMFromSQL(grfsmToSearchFor)
		#circuits = [5, -10, 5, -10, 3, 1, -14]

	# print "Circuit for testing"
	# print circuits[0]

	##Check for designs that do no match ids or designs with no circuits mapped to them
	checkFirstCircuit = circuits[0]
	circuitsWithRecombs = []
	mappings = []
	if checkFirstCircuit == 'Design does not exist' or checkFirstCircuit == 'No circuits found':
		circuitsWithRecombs.append(checkFirstCircuit)
	else:
		print('Ranking circuits')
		rankedCircuits = rankCircuits(circuits)

		firstCircuits = []
		if totalNumStates == 16:
			##Do something different. Have to do the mappings
			firstCircuits = build16StateCircuit(checkFirstCircuit, True)
		else:
			##Get the parts mapping (only need one circuit, since the mapping is
			##the same for all of them)
			##This line seems incredibly incorrect actually.... have to go over it
			##and could also be the reason that Nate's bug is appearing (although
			##probably not).
			##No, it is correct. All we are doing is getting the ACTUAL indices for each position
			##(and what part is actually there does not matter)
			firstCircuits = build5StateCircuit(checkFirstCircuit)

		for circ in firstCircuits:
			mappings.append(circ.getComponentOriginalMapping())
		for c in rankedCircuits:
			##An instance of GeneticCircuit
			builtOriginalCircuits = []
			if totalNumStates == 16:
				builtOriginalCircuits = build16StateCircuit(c)
			else:
				builtOriginalCircuits = build5StateCircuit(c)

			##The above function now returns all five corresponding circuits, so we have to slightly edit this
			printedBuiltCircuits = [i.printCircuit() for i in builtOriginalCircuits]
			circuitsWithRecombs.append((printedBuiltCircuits, expressedGenesByState(stateExpressionData, builtOriginalCircuits)))

	toReturn = [circuitsWithRecombs, mappings]
	##TODO:
	##append to the data that is being sent back to the browser mapping of what each
	##gene returned is. The circuit returned does not specifiy which gene is where
	##Done.
	return Response(json.dumps(toReturn), mimetype='application/json', headers={'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*'})

if __name__ == '__main__':
    application.run(host='0.0.0.0')
