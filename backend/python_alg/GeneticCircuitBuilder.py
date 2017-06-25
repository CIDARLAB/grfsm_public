import os, sys

lib_path = os.path.abspath(os.path.join(''))
sys.path.insert(0, lib_path)

import copy as copy
import time as time

import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

import backend.db_functions.searchGRFSM as sg


##We may be able to break down the 13 part arrays (and subsequent arrays that follow this 
##pattern) into smaller components for which we can figure out the design vector. Then, 
##depending on what the flanking pieces are, we should be able to combine several arrays into
##a full 13 part vector
geneCount = {
	1: 1,
	2: 1,
	8: 2
}

stateToConfigMap = [
	[0,1,2,0,3,1,2,2,1,2,3,3,2,2,3,2],
	[0,2,0,1,2,2,2,1,3,1,2,2,2,3,3,3],
	[0,0,1,2,1,2,1,3,2,2,3,2,3,3,2,2]
]

leftTermsOneGene = set([3,4,7,10,-1,-3])
rightTermsOneGene = set([1,3,4,-3,-7,-10])

##For sub arrays that are isolated, we can determine the design vector which extrapolates to
##all of the states
def subPartArrayExpressionVectorAnalysis_Iso(subPartArray):
	configurations = [
		[0,1,2,3,4],
		[0, -2, -1, 3, 4],
		[0, 1, 4],
		[0, -2, -3, 1, 4]
	]

	numberOfGenes = 0
	for i in subPartArray:
		absI = abs(i)
		if absI in geneCount:
			numberOfGenes += geneCount[absI]

	geneExpressionByState = {}
	geneExpressionByStateArray = [{},{},{},{}]
	outputsByState = []

	##Read through states passed
	readThroughCircuitStatesPassed = 0

	for ci in xrange(len(configurations)):
		config = configurations[ci]

		circuit = gc.GeneticCircuit([])
		numberOfParts = len(config)

		for partLocation in config:
			##Create parts to add
			pId = subPartArray[abs(partLocation)]

			##For the first part, since its a 0
			if partLocation == 0 and pId < 0:
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			elif partLocation == 0 and pId > 0:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))
			elif (partLocation < 0 and pId > 0) or (partLocation > 0 and pId < 0):
				##It is flipped
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			else:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))

		partsTopAndBottom = circuit.printAllParts(withLocations=True)
		##Read-through check (should never happen for parts with terms)
		if len(partsTopAndBottom['TOP']) == 0 or len(partsTopAndBottom['BOTTOM']) == 0:
			return 'READTHROUGH'
		else:
			readThroughCircuitStatesPassed += 1

		if ci == 0:		
			for ps in partsTopAndBottom['TOP']:
				##Get the genes out
				if ps[0] == 'G':
					if ps != 'G.0.1':
						geneExpressionByState[ps] = []
			for ps in partsTopAndBottom['BOTTOM']:
				##Get the genes out
				if ps[0] == 'G':
					if ps != 'G.4.1':
						geneExpressionByState[ps] = []

		expressedGenesInThisState = circuit.printOnlyExpressed(returnOnlyExpressedGenes=False)
		for gene in expressedGenesInThisState['expressedGenes']:
			geneExpressionByState[gene].append(ci)
			geneExpressionByStateArray[ci][gene] = True

		outputsByState.append({
			'topRight': expressedGenesInThisState['topOutputState'],
			'bottomLeft': expressedGenesInThisState['bottomOutputState']
		})

	# print geneExpressionByState
	for gene in geneExpressionByState:
		if len(geneExpressionByState[gene]) == 0 or len(geneExpressionByState[gene]) == 4:
			##This part is either unused or always used and should not be included
			# print gene
			return False

	return {
		'genesToStates': geneExpressionByState,
		'statesToGenes': geneExpressionByStateArray,
		'outputs': outputsByState,
		'numberOfGenes': numberOfGenes
	}

##Given an output four state mapping and a segment, returns the corresponding 16 state
##promoter vector
def createPromoterDesignVectorForSegment(outputStateMappings, segment, indies=False):
	outputLeft = ''
	outputRight = ''
	stateMap = stateToConfigMap[segment]
	for state in stateMap:
		oul = []
		our = []
		if indies:
			oul = outputStateMappings['outputs'][state]['bottomLeft']
			our = outputStateMappings['outputs'][state]['topRight']
		else:
			oul = outputStateMappings['outputs'][state][(0,0)]['bottomLeft']
			our = outputStateMappings['outputs'][state][(0,0)]['topRight']
		##Set the reading key to be 0,0 (does not matter since there is never any
		##read through so the outputs are state independent)
		outputLeft += str(oul)
		outputRight += str(our)
	
	return {
		'ol': outputLeft,
		'or': outputRight
	}

def createDependentPromoterDesignVectorForSegment(outputStateMappings, leftInputVector, rightInputVector, segment):
	outputLeft = ''
	outputRight = ''
	stateMap = stateToConfigMap[segment]
	for state in stateMap:
		##First tuple value is the top left input, the second value is the right bottom
		reading = (int(leftInputVector[state]), int(rightInputVector[state]))
		# print outputStateMappings
		outputLeft += str(outputStateMappings[state][reading]['bottomLeft'])
		outputRight += str(outputStateMappings[state][reading]['topRight'])

	return {
		'ol': outputLeft,
		'or': outputRight
	}


##Takes the input from above and formats a design vector depending on the segment provided
def createDesignVector(geneStateMappings, segment):
	oneDDesignVector = ''
	arbitraryGeneOrder = []
	for gene in geneStateMappings['genesToStates']:
		arbitraryGeneOrder.append(gene)

	# print arbitraryGeneOrder

	smallDesignVector = []
	for state in geneStateMappings['statesToGenes']:
		stateDesign = []
		for gene in arbitraryGeneOrder:
			if gene in state:
				stateDesign.append(1)
			else:
				stateDesign.append(0)
		smallDesignVector.append(stateDesign)

	# print smallDesignVector

	outputLeft = ''
	outputRight = ''
	designVector = []
	stateMap = stateToConfigMap[segment]
	for state in stateMap:
		designVector.append(smallDesignVector[state])
		outputLeft += str(geneStateMappings['outputs'][state]['bottomLeft'])
		outputRight += str(geneStateMappings['outputs'][state]['topRight'])
		for val in smallDesignVector[state]:
			oneDDesignVector += str(val)

	if len(arbitraryGeneOrder) == 0:
		oneDDesignVector = '0000000000000000'

	return {
		'oneDDesignVector': oneDDesignVector,
		'designVector': designVector,
		'leftOutputVector': outputLeft,
		'rightOutputVector': outputRight
	}

##Have to ignore cases where there is read-through in a specific state
def subPartArrayExpressionVectorAnalysis_NonIso(subPartArray, readThrough=False):
	startStateCombos = [(0,0), (0,1), (1,0), (1,1)]
	configurations = [
		[0,1,2,3,4],
		[0, -2, -1, 3, 4],
		[0, 1, 4],
		[0, -2, -3, 1, 4]
	]

	##We are going to skip designs that have no genes in them because there is an
	##extra layer of complication that we have to consider with these.
	##This may not be necessary anymore
	numberOfGenes = 0
	for i in subPartArray:
		absI = abs(i)
		if absI in geneCount:
			numberOfGenes += geneCount[absI]

	numberOfNonReadThroughStates = 0

	geneExpressionByState = {}
	geneExpressionByStateArray = [{},{},{},{}]
	outputsByState = [{},{},{},{}]
	for ci in xrange(len(configurations)):
		config = configurations[ci]

		circuit = gc.GeneticCircuit([])
		numberOfParts = len(config)

		for partLocation in config:
			##Create parts to add
			pId = subPartArray[abs(partLocation)]

			##For the first part, since its a 0
			if partLocation == 0 and pId < 0:
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			elif partLocation == 0 and pId > 0:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))
			elif (partLocation < 0 and pId > 0) or (partLocation > 0 and pId < 0):
				##It is flipped
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			else:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))

		partsTopAndBottom = circuit.printAllParts(withLocations=True)
		##Read-through check
		readThroughCircuit = False
		if len(partsTopAndBottom['TOP']) == 0 or len(partsTopAndBottom['BOTTOM']) == 0:
			if not readThrough:
				return 'READTHROUGH'
			else:
				readThroughCircuit = True

		##In the case when we only want circuits that have read through
		if not readThroughCircuit and readThrough:
			numberOfNonReadThroughStates += 1
			if numberOfNonReadThroughStates == 4:
				return 'NONREADTHROUGH'

		if ci == 0:
			for ps in partsTopAndBottom['TOP']:
				##Get the genes out
				if ps[0] == 'G':
					# if ps != 'G.0.1':
					geneExpressionByState[ps] = [{},{},{},{}]
			for ps in partsTopAndBottom['BOTTOM']:
				##Get the genes out
				if ps[0] == 'G':
					# if ps != 'G.4.1':
					geneExpressionByState[ps] = [{},{},{},{}]

		for reading in startStateCombos:
			expressedGenesInThisState = circuit.printOnlyExpressed(returnOnlyExpressedGenes=False, topStart=reading[0], bottomStart=reading[1])
			geneExpressionByStateArray[ci][reading] = expressedGenesInThisState['expressedGenes']

			for gene in expressedGenesInThisState['expressedGenes']:
				geneExpressionByState[gene][ci][reading] = True

			##Have to check this outputs stuff again as I am realizing it doesn't make sense.
			##For most of the non-isos, it may be state independent actually, so we do not need
			##to worry about the input. TRUE but need the reading for cases with dependencies 
			##like the read through case
			outputsByState[ci][reading] = {
				'topRight': expressedGenesInThisState['topOutputState'],
				'bottomLeft': expressedGenesInThisState['bottomOutputState'],
				##For cases when we want to check if the out put state is due to the
				##input state
				'topStateChanged': expressedGenesInThisState['topStateChanged'],
				'bottomStateChanged': expressedGenesInThisState['bottomStateChanged']
			}

	# for sn in geneExpressionByStateArray:
	# 	print sn
	return {
		'numberOfGenes': numberOfGenes,
		'genesToStates': geneExpressionByState,
		'statesToGenes': geneExpressionByStateArray,
		'outputs': outputsByState
	}

##Needs to be fixed
def designVectorsNon_Iso(geneStateMappings, oVLeft, oVRight, segmentNumber=1):
	designVectors = []
	stateMap = stateToConfigMap[segmentNumber]
	for leftPromVector in oVLeft:
		##Get the ids for the db
		leftPromVectorId = oVLeft[leftPromVector]
		for rightPromVector in oVRight:
			##Get the ids for the db
			rightPromVectorId = oVRight[rightPromVector]
			arbitraryGeneOrder = {}
			geneIndex = 0
			# print '____________________________________'
			# print leftPromVector
			# print rightPromVector
			currentDesignVector = []

			for state in xrange(len(stateMap)):
				currentDesignVectorUnit = []
				##Create a blank vector
				for i in xrange(geneStateMappings['numberOfGenes']):
					currentDesignVectorUnit.append(0)
				outputs = (int(leftPromVector[state]), int(rightPromVector[state]))
				currentState = stateMap[state]
				genesExp = geneStateMappings['statesToGenes'][currentState][outputs]
				# print 'These are the outputs: ' + str(outputs)
				# print 'Theses are the genes expressed: ' + str(genesExp)
				for gene in genesExp:
					if gene not in arbitraryGeneOrder:
						arbitraryGeneOrder[gene] = geneIndex
						geneIndex += 1

					currentDesignVectorUnit[arbitraryGeneOrder[gene]] = 1
				currentDesignVector.append(currentDesignVectorUnit)

			##Format the design vector appropriately
			fullVector = ''
			betterDesignVector = sg.formatInput(currentDesignVector, threeState=True)
			for state in betterDesignVector:
				for geneI in xrange(len(arbitraryGeneOrder)):
					fullVector += str(int(state[geneI]))

			if len(arbitraryGeneOrder) == 0:
				betterDesignVectorAsString = '0' * 16
			else:
				betterDesignVectorAsString = fullVector

			designVectors.append({
				# 'design_vector_as_array': currentDesignVectorAsArray,
				'design_vector': betterDesignVectorAsString,
				# 'circuit_id': circuit_id,
				'left_prom_input_vector_id': leftPromVectorId,
				'right_prom_input_vector_id': rightPromVectorId,
				'segment_number': segmentNumber,
				'number_of_genes': len(arbitraryGeneOrder)
			})

	return designVectors


##We are looking at all the possible 'promoter design vectors.' That is, all of the different
##output promoter arrays we can create
def generatePromoterOutputs(subPartArray, leftOnly=False, rightOnly=False):
	##If we see G.0.1 being transcribed, then we know that the output is 1 on the left
	#else it's 0 if we see G.4.1 being transcribed, then we know that the output is 1 
	##on the right else it is 0
	configurations = [
		[0,1,2,3,4],
		[0, -2, -1, 3, 4],
		[0, 1, 4],
		[0, -2, -3, 1, 4]
	]

	geneExpressionByState = {}
	geneExpressionByStateArray = [{},{},{},{}]
	outputsByState = [{},{},{},{}]
	for ci in xrange(len(configurations)):
		config = configurations[ci]

		circuit = gc.GeneticCircuit([])
		numberOfParts = len(config)

		for partLocation in config:
			##Create parts to add
			pId = subPartArray[abs(partLocation)]

			##For the first part, since its a 0
			if partLocation == 0 and pId < 0:
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			elif partLocation == 0 and pId > 0:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))
			elif (partLocation < 0 and pId > 0) or (partLocation > 0 and pId < 0):
				##It is flipped
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			else:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))

		partsTopAndBottom = circuit.printAllParts(withLocations=True)
		##Read through check
		if len(partsTopAndBottom['TOP']) == 0 or len(partsTopAndBottom['BOTTOM']) == 0:
			return 'READTHROUGH'

		if ci == 0:
			if not rightOnly:
				for ps in partsTopAndBottom['TOP']:
					##Get the genes out
					if ps[0] == 'G':
						geneExpressionByState[ps] = []
			if not leftOnly:
				for ps in partsTopAndBottom['BOTTOM']:
					##Get the genes out
					if ps[0] == 'G':
						geneExpressionByState[ps] = []

		##Check if we should be skip the circuit			
		shouldSkip = circuit.printAllParts()
		if len(shouldSkip['TOP']) == 0 or len(shouldSkip['BOTTOM']) == 0:
			# print subPartArray
			# print shouldSkip
			return 'READTHROUGH'

		expressedGenesInThisState = circuit.printOnlyExpressed(returnOnlyExpressedGenes=False)
		outputsByState[ci]['topRight'] = expressedGenesInThisState['topOutputState']
		outputsByState[ci]['bottomLeft'] = expressedGenesInThisState['bottomOutputState']
		# print expressedGenesInThisState['expressedPromotersFull']
		for gene in expressedGenesInThisState['expressedGenes']:
			if gene in geneExpressionByState:
				geneExpressionByState[gene].append(ci)
				geneExpressionByStateArray[ci][gene] = True
	return {
		'genesToStates': geneExpressionByState,
		'statesToGenes': geneExpressionByStateArray,
		'outputs': outputsByState
	}




##For the 3 input 16 state (and likely for larger registers) we can split the circuit into 
##3 separarte components if certain pieces are not fives and look for redundant or unused
##parts. If there are unused parts in this sub-circuit, then we know that any circuit that
##has this sub component will have redundant parts, and we will not be interested in it
##This will be very useful for the generation of a database

##TODO: the same thing that we do for part 4 -> we keep it even if we only use one of the proms
def subCircuitUsedAndUnusedParts(subPartArray, segmentNumber=2):
	##The sub array has to be a length 5
	# print segmentNumber
	##We are going to exluce 4's and 6's from this as well because we want to include these so
	##that we know when to replace with one sided genes or promoters
	toExclude = set([5])
	if segmentNumber == 1:
		if abs(subPartArray[4]) in toExclude:
			return False
	elif segmentNumber == 2:
		if abs(subPartArray[0]) in toExclude or abs(subPartArray[4]) in toExclude:
			return False
	elif segmentNumber == 3:
		if abs(subPartArray[0]) in toExclude:
			return False
	##We only need to check four possible configurations
	configurations = [
		[0,1,2,3,4],
		[0, -2, -1, 3, 4],
		[0, 1, 4],
		[0, -2, -3, 1, 4]
	]

	stateNumberToConfig = [0,]

	toIgnore = {
		'G.0.1': [1,2,8],
		'P.0.1': [-2,-3],
		'P.0.2': [6, -3],
		'G.4.1': [-1,-2],
		'G.4.2': [8],
		'P.4.1': [2,3,6],
		'T.4': [3,-3]
	}

	allParts = {}
	validPartLetters = set(['P','G','T'])
	##For each config, we build a circuit and analyze it and in the end
	##We will determine which components have been used
	for ci in xrange(len(configurations)):
		config = configurations[ci]
		##First have to look at the top
		circuit = gc.GeneticCircuit([])
		numberOfParts = len(config)

		for partLocation in config:
			##Create parts to add
			pId = subPartArray[abs(partLocation)]
			# print pId
			# print partLocation
			##For the first part, since its a 0
			if partLocation == 0 and pId < 0:
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			elif partLocation == 0 and pId > 0:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))
			elif (partLocation < 0 and pId > 0) or (partLocation > 0 and pId < 0):
				##It is flipped
				circuit.addComponent(part.Part(abs(pId), -1, abs(partLocation)))
			else:
				circuit.addComponent(part.Part(abs(pId), 1, abs(partLocation)))
		##We can get all the parts for this sub circuit in the first config
		if ci == 0:
			partsTopAndBottom = circuit.printAllParts(withLocations=True)
			for p in partsTopAndBottom['TOP']:
				if p[0] in validPartLetters:
					##Special case for term, where we only add the first two parts of the string
					##This is because we are only using bidirectional terms, so we are only
					##considering it un unused term if BOTH terms on the bidirectional term
					##are unused (do not change the expression of the genes)
					if p[0] == 'T':
						##Split the part
						splitPart = p.split('.')
						if abs(subPartArray[int(splitPart[1])]) == 4:
							newPartName = str(splitPart[0]) + '.' + str(splitPart[1])
							allParts[newPartName] = False
					# elif p[0] == 'P':
					# ##Split the part
					# ##If one of the parts with a 6 in it is used, then we want to keep this
					# ##this circuit
					# 	splitPart = p.split('.')
					# 	if abs(subPartArray[int(splitPart[1])]) == 6:
					# 		newPartName = str(splitPart[0]) + '.' + str(splitPart[1])
					# 		allParts[newPartName] = False
					else:
						allParts[p] = False

			for p in partsTopAndBottom['BOTTOM']:
				if p[0] in validPartLetters:
					if p[0] == 'T':
						##Split the part
						splitPart = p.split('.')
						if abs(subPartArray[int(splitPart[1])]) == 4:
							newPartName = str(splitPart[0]) + '.' + str(splitPart[1])
							allParts[newPartName] = False
					##If one of the parts with a 6 in it is used, then we want to keep this
					##this circuit
					# elif p[0] == 'P':
					# 	##Split the part
					# 	splitPart = p.split('.')
					# 	if abs(subPartArray[int(splitPart[1])]) == 6:
					# 		newPartName = str(splitPart[0]) + '.' + str(splitPart[1])
					# 		allParts[newPartName] = False
					else:
						allParts[p] = False

		##Now look at the expression of this circuit
		# print circuit.printCircuit()
		expressionVector = circuit.printOnlyExpressed(returnOnlyExpressedGenes=False)
		# print expressionVector

		for k in expressionVector['expressedPromotersFull']:
			allParts[k] = True
		for k in expressionVector['expressedGenes']:
			allParts[k] = True

		##Looking at terminators
		for k in expressionVector['expressedTerminatorsFull']:
			splitTermPart = k.split('.')
			newname = str(splitTermPart[0]) + '.' + str(splitTermPart[1])
			allParts[newname] = True

	# print "Segment num: " + str(segmentNumber) + "," + str(subPartArray)
	# print allParts
	# print segmentNumber
	# print allParts
	for k in allParts:
		if not allParts[k]:
			##We just have to do a quick check that it is not a gene on one of the ends
			##which could be used in a dffferent section
			if k in toIgnore:
				# print 'Looking to ignore: ' + str(k)
				splitK = k.split('.')
				if subPartArray[int(splitK[1])] in toIgnore[k]:
					continue
			##Here is where we can figure out all of the circuits that we can skip
			##because they have they will have this sub segment (its all of the) circuit ids
			##that have this exact subsegment, so just have to check five values	
			# print 'The one that failed: ' + str(k)
			# print k
			return True
	# print 'Should be false....'
	return False



##Takes in a circuit and determines the expression vector for that circuit

##For discovery purposes, currently only implemented for S1 circuits (non induced circuits)
##Will be changed in the future

##TODO: change this to handle all circuits, somehow (they will need the original)

##Design vectors will be IDed in the following way:
##If the design vector is 0101, then its Id is 0*2^0+1*2^1+0*2^2+1*2^3 

##Reduces a part that has components that are unused.
##
##arguments:
##	partNum: 
##		the number of the part being reduced
##	piecesUsed:
##		a dictionary with keys of promoters, genes,  and terminators that are used
##
def reducePart(partNum, piecesUsed):
	##Parts can be reduced based on which components the use or don't use
	print partNum
	print piecesUsed
	if partNum == 6:
		##A six is a double promoter. If the top promoter is the one that is unused, then
		##we can convert it to a -10. If it is the bottom one, then we convert it to a 10
		if '1' not in piecesUsed['P']:
			##The top is unused, convert to a -10
			return -10
		elif '2' not in piecesUsed['P']:
			return 10
		else:
			return partNum
	elif partNum == 4:
		if '1' not in piecesUsed['T']:
			return -7
		elif '2' not in piecesUsed['T']:
			return 7
		else:
			return partNum
	elif abs(partNum) == 3:
		orientation = int(partNum/3)
		if '1' not in piecesUsed['P']:
			return orientation*-7
		elif '1' not in piecesUsed['T']:
			return orientation*10
		else:
			return partNum



##
def getFullExpressionVectorForCircuit(circuits, toMatch=[], promoterParts={}, terminatorParts={}, printExtra=False):
	pParts = promoterParts.copy()
	tParts = terminatorParts.copy()

	allGenes = {}
	geneIndex = 0

	toMatchLength = len(toMatch)
	pPartsLength = len(pParts)
	tPartsLength = len(tParts)
	unusedPromoters = pParts
	unusedTerminators = tParts

	usedParts = {}
	allParts = {}
	##For when we want to include terminators
	# validPartLetters = set(['P','G','T'])
	validPartLetters = set(['P','G'])

	##We can use this to check if a certain gene is expressed in every state and 
	##remove these from consideration
	alwaysExpressedGenes = {}
	##Could do a really quick check here... if there are not promoters in the original circuit
	##then this circuit is not interesting whatsoever....

	##List of strings representing the design vector at every 
	expressions = []
	expressionsByDID = []
	uniqueDIDs = {}
	totUnique = 0
	totGenes = 0
	for i in xrange(len(circuits)):
		c = circuits[i]

		##Find all of the parts in the circuit
		if i == 0:
			partsTopAndBottom = c.printAllParts(withLocations=True)
			for p in partsTopAndBottom['TOP']:
				if p[0] in validPartLetters:
					allParts[p] = False
			for p in partsTopAndBottom['BOTTOM']:
				if p[0] in validPartLetters:
					allParts[p] = False

		if printExtra:
			print c.printCircuit(True)
		stateNumber = i+1
		expressedParts = c.printOnlyExpressed(False, printExtra)
		expressedGenes = expressedParts['expressedGenes']
		expressedPromoters = expressedParts['expressedPromoters']
		expressedTerminators = expressedParts['expressedTerminators']

		fullExpressedPromoters = expressedParts['expressedPromotersFull']
		fullExpressedTerminators = expressedParts['expressedTerminatorsFull']

		for up in fullExpressedPromoters:
			usedParts[up] = True
		for up in fullExpressedTerminators:
			usedParts[up] = True
		for up in expressedGenes:
			usedParts[up] = True

		# print 'Genes expressed in state ' + str(i) + ': ' + str(expressedGenes)

		for g in expressedGenes:
			if g not in allGenes:
				geneInfo = { 'geneIndex': geneIndex, 'sn': [stateNumber]}
				allGenes[g] = geneInfo
				geneIndex += 1
			else:
				allGenes[g]['sn'].append(stateNumber)

		##Remove promoters that were used
		if pPartsLength > 0:
			for p in expressedPromoters:
				##Remove the key from unused promoters. At the end we want 0 unused promoters
				unusedPromoters.pop(p, None)

		if tPartsLength > 0:
			for t in expressedTerminators:
				##Remove the key from unused terminators. At the end, we want 0 unused terminators
				unusedTerminators.pop(t, None)

		totGenes = max(totGenes, len(allGenes))

		##Have to go through all of the expressed genes
		originalPartMapping = c.getComponentOriginalMapping()
		designId = 0

		##Should uncomment for binary format
		for gene in expressedGenes:
			genePos = allGenes[gene]['geneIndex']
			designId += 2**int(genePos)

		if toMatchLength > 0:
			if len(expressedGenes) != toMatch[i]:
				return {
					'designVector': False,
					'genes': 0
				}

		expressionsByDID.append(bin(designId)[2:][::-1])

		##Should uncomment when searching for the circuit that has 16 unique configs
		# if designId not in uniqueDIDs:
		# 	uniqueDIDs[designId] = True
		# 	totUnique += 1
		#designId = len(expressedGenes)

	##Check if any genes are always expressed across 16 states
	for gene in allGenes:
		if len(allGenes[gene]['sn']) == 16:
			alwaysExpressedGenes[gene] = True
			#print 'Here is one'

	# print "All parts are below"
	# print allParts
	##Will want to use this when we are reducing after having generated the whole DB
	unusedSpecificParts = False
	for k in allParts:
		if k not in usedParts:
			# print k
			unusedSpecificParts = True
			break
	return {
		'designVector': expressionsByDID,
		'genes': totGenes,
		'unusedPromoters': unusedPromoters,
		'unusedTerminators': unusedTerminators,
		'alwaysExpressedGenes': alwaysExpressedGenes,
		'usedParts': usedParts,
		'allGenes': allGenes,
		'unusedSpecificParts': unusedSpecificParts
	}
	#if totGenes > 0:
		##print str(circuits[0].printCircuit(excludeRecombinationSites=True)) + "," + str(expressionsByDID)
	#if totUnique > 15:
		##print "Unique circuit above!"
	##endTime = time.time()
	#totTime = endTime - startTime
	#return designId
	# print "Percentages:"
	# print "Total: " + str((totTime))
	# print "First step: " + str(100.0*(1.0*finishEGClassify - startTime)/totTime)
	# print "Second step: " + str(100.0*(calcTotGenesTS - finishEGClassify)/totTime)
	# print "Third step: " + str(100.0*(rrddts - calcTotGenesTS)/totTime)
	# print "Fourth step: " + str(100.0*(someother - rrddts)/totTime)
	# print "Fifth step: " + str(100.0*(endTime - someother)/totTime)

def getGenesExpressedState(originalState, mappedToStates):
	##We can infer the register of one state from another (of 12 from 6 for example)
	##However, 6 and 12 could both have one gene expressed but this could be two
	##different genes in actuality. We want to be able to make this distinction in the
	##database as it could reduce the search space

	##Encode the vector using binary. So 0101 => 0*2**0 + 1*2**1 + 0*2**2 + 1*2**3

	expressedGenesInOriginal = originalState.printOnlyExpressed()
	designIds = {'ori': len(expressedGenesInOriginal)}
	expressedGenesInMappedToState = {}
	for key in mappedToStates:
		 expressedGenesInMappedToState[key] = mappedToStates[key].printOnlyExpressed()
		 ##Look at the expressed genes in this state and see if it matches the expressed
		 ##genes in the other state. If they do not match, then we have a case where
		 ##the design vector is different
		 vector = 0
		 for gI in xrange(len(expressedGenesInOriginal)):
		 	if expressedGenesInOriginal[gI] in expressedGenesInMappedToState[key]:
		 		vector += 2**gI
		 shouldPrint = False
		 for gI in xrange(len(expressedGenesInMappedToState[key])):
		 	if expressedGenesInMappedToState[key][gI] in expressedGenesInOriginal:
		 		continue
		 	else:
		 		shouldPrint = True
		 		vector += 2**gI
		 designIds[key] = vector

	#print expressedGenesInOriginal
	#print expressedGenesInMappedToState
	return designIds


##Returns a string of 0s and 1s
def getNumberOfGenesExpressedForCircuit(circuits):
	for i in xrange(len(circuits)):
		c = circuits[i]
		expressedGenes = c.printOnlyExpressed()
		designId = len(expressedGenes)
	return designId


##Builds a circuit with only parts and no recognition site components
def buildOneCircuit(parts):
	##Instantiate the circuit
	circuit = gc.GeneticCircuit([])
	numberOfParts = len(parts)

	for pI in range(numberOfParts):
		##p is a number
		if parts[pI] < 0:
			circuit.addComponent(part.Part(abs(parts[pI]), -1))
		else:
			circuit.addComponent(part.Part(parts[pI], 1))

	return [circuit]


##Function that builds the 3 input 16 state state-machine
##Will also include a check that flags for redundant circuits by checking the parts that 
##Are being used to create this circuit and if some of them are used or not
def build16StateCircuit(
	parts, 
	includeAllCircuits=True, 
	includeTheseCircuits={}, 
	compareTo=[],
	getPromsAndTerms=False
	):
	##Create the recombination sites
	##TP901 sites: F,O
	##BxbI sites: X, I
	##A118 sites: A, B
	comparingToLength = len(compareTo)

	site1 = rs.RecognitionSite('X', 1)
	site2 = rs.RecognitionSite('O', 1)
	site3 = rs.RecognitionSite('X', -1)
	site4 = rs.RecognitionSite('O', 1)
	site5 = rs.RecognitionSite('A', 1)
	site6 = rs.RecognitionSite('I', 1)
	site7 = rs.RecognitionSite('A', -1)
	site8 = rs.RecognitionSite('I', 1)
	site9 = rs.RecognitionSite('F', 1)
	site10 = rs.RecognitionSite('B', 1)
	site11 = rs.RecognitionSite('F', -1)
	site12 = rs.RecognitionSite('B', 1)

	sites = [site1, site2, site3, site4, site5, site6, site7, site8, site9, site10, site11, site12]

	##Instantiate the circuit
	circuit = gc.GeneticCircuit([])
	numberOfParts = len(parts)
	partsWithPromotersInThem = {}
	partsWithTerminatorsInThem = {}
	allCircuits = [None for i in xrange(16)]

	for pI in range(numberOfParts):
		##p is a number
		addedComp = None
		if parts[pI] < 0:
			posPartId = abs(parts[pI])
			addedComp = circuit.addComponent(part.Part(posPartId, -1))
		else:
			addedComp = circuit.addComponent(part.Part(parts[pI], 1))

		##Attempting to remove redundant circuits
		if addedComp.getId() not in part.PARTSWITHOUTPROMOTERS:
			partsWithPromotersInThem[addedComp.getPartLocation()] = True

		##Using the incomplete array because we are only considering part 4 for
		##now as a potential redundant terminator part
		if addedComp.getId() in part.PARTSWITHTERMINTAORS_INCOMPLETE:
		#if addedComp.getId() in part.PARTSWITHTERMINTAORS:
			partsWithTerminatorsInThem[addedComp.getPartLocation()] = True

		##Add the site as long as its not the last part 
		if (pI + 1 < numberOfParts):
			circuit.addComponent(sites[pI])

	if includeAllCircuits:
		##Want to return all the induced circuits as well
		enzyme1 = enz.Enzyme('BxbI')
		enzyme1.addSiteToRecognize('X')
		enzyme1.addSiteToRecognize('I')
		enzyme2 = enz.Enzyme('TP901')
		enzyme2.addSiteToRecognize('F')
		enzyme2.addSiteToRecognize('O')
		enzyme3 = enz.Enzyme('A118')
		enzyme3.addSiteToRecognize('A')
		enzyme3.addSiteToRecognize('B')
		c1 = circuit
		c2 = enz.induceCircuit(enzyme1, c1)
		c3 = enz.induceCircuit(enzyme2, c1)
		c4 = enz.induceCircuit(enzyme3, c1)

		c5 = enz.induceCircuit(enzyme2, c2)
		c6 = enz.induceCircuit(enzyme3, c2)

		c7 = enz.induceCircuit(enzyme1, c3)
		c8 = enz.induceCircuit(enzyme3, c3)

		c9 = enz.induceCircuit(enzyme1, c4)
		c10 = enz.induceCircuit(enzyme2, c4)

		c11 = enz.induceCircuit(enzyme3, c5)
		c12 = enz.induceCircuit(enzyme2, c6)

		c13 = enz.induceCircuit(enzyme3, c7)
		c14 = enz.induceCircuit(enzyme1, c8)

		c15 = enz.induceCircuit(enzyme2, c9)
		c16 = enz.induceCircuit(enzyme1, c10)

		allCircuits = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16]
		if getPromsAndTerms:
			return {
				'allCircuits':allCircuits,
				'partsWithPromotersInThem':partsWithPromotersInThem,
				'partsWithTerminatorsInThem': partsWithTerminatorsInThem
			}
		else:
			return allCircuits

	elif len(includeTheseCircuits) > 0:
		##Want to return only a subset of the circuits
		enzyme1 = enz.Enzyme('BxbI')
		enzyme1.addSiteToRecognize('X')
		enzyme1.addSiteToRecognize('I')
		enzyme2 = enz.Enzyme('TP901')
		enzyme2.addSiteToRecognize('F')
		enzyme2.addSiteToRecognize('O')
		enzyme3 = enz.Enzyme('A118')
		enzyme3.addSiteToRecognize('A')
		enzyme3.addSiteToRecognize('B')

		enzymes = [enzyme1, enzyme2, enzyme3]
		parentCircuit = [None,0,0,0,1,1,2,2,3,3,4,5,6,7,8,9]
		inducingEnzyme = [None, 0,1,2,1,2,0,2,0,1,2,1,2,0,1,0]

		for i in xrange(len(allCircuits)):
			if len(includeTheseCircuits) > 0:
				if (i+1) not in includeTheseCircuits:
					continue
			if i == 0:
				if comparingToLength > 0:
					if getNumberOfGenesExpressedForCircuit([circuit]) != compareTo[i]:
						return False
				allCircuits[0] = circuit
			else:
				allCircuits[i] = enz.induceCircuit(enzymes[inducingEnzyme[i]], allCircuits[parentCircuit[i]])
				if comparingToLength > 0:
					if getNumberOfGenesExpressedForCircuit([allCircuits[i]]) != compareTo[i]:
						return False
		return allCircuits
	else:
		return [circuit]

##Function that builds the basic five state state-machine and returns the string array
def build5StateCircuit(parts):
	##Create the recombination sites
	site1 = rs.RecognitionSite('D', 1)
	site2 = rs.RecognitionSite('[', 1)
	site3 = rs.RecognitionSite('(', 1)
	site4 = rs.RecognitionSite('[', -1)
	site5 = rs.RecognitionSite('(', 1)
	site6 = rs.RecognitionSite('D', -1)

	sites = [site1, site2, site3, site4, site5, site6]

	##Instantiate the circuit
	circuit = gc.GeneticCircuit([])
	numberOfParts = len(parts)

	for pI in range(numberOfParts):
		##p is a number
		if parts[pI] < 0:
			circuit.addComponent(part.Part(abs(parts[pI]), -1))
		else:
			circuit.addComponent(part.Part(parts[pI], 1))

		##Add the site as long as its not the last part 
		if (pI + 1 < numberOfParts):
			circuit.addComponent(sites[pI])

	##Want to return all the induced circuits as well
	enzyme1 = enz.Enzyme('ATc')
	enzyme1.addSiteToRecognize('(')
	enzyme2 = enz.Enzyme('Ara')
	enzyme2.addSiteToRecognize('[')
	enzyme2.addSiteToRecognize('D')

	c1 = circuit
	c2 = enz.induceCircuit(enzyme1, c1)
	c3 = enz.induceCircuit(enzyme2, c1)
	c4 = enz.induceCircuit(enzyme2, c2)
	c5 = enz.induceCircuit(enzyme1, c3)

	return [c1, c2, c3, c4, c5]

def expressedGenesByState(design, circuits):
	#print design
	##Have to create the enzymes and the 
	# enzyme1 = enz.Enzyme('ATc')
	# enzyme1.addSiteToRecognize('(')
	# enzyme2 = enz.Enzyme('Ara')
	# enzyme2.addSiteToRecognize('[')
	# enzyme2.addSiteToRecognize('D')

	stateExpressions = {};

	for x in xrange(len(circuits)):
		stateNumber = str(x+1)
		stateExpressions[stateNumber] = circuits[x].printOnlyExpressed()

	##For loop above may be enough to handle all of the code below

	##State 1 profile
	#circuit = circuits[0]
	#stateExpressions['1'] = circuit.printOnlyExpressed()
	#state1PartMapping = circuit.getComponentOriginalMapping()

	##State 2 profile
	#circuitAtState2 = circuits[1]
	#stateExpressions['2'] = circuitAtState2.printOnlyExpressed()
	#state2PartMapping = circuitAtState2.getComponentOriginalMapping()

	##State 3 profile
	#circuitAtState3 = circuits[2]
	#stateExpressions['3'] = circuitAtState3.printOnlyExpressed()
	#state3PartMapping = circuitAtState3.getComponentOriginalMapping()

	##State 4 profile
	#circuitAtState4 = circuits[3]
	#stateExpressions['4'] = circuitAtState4.printOnlyExpressed()
	#state4PartMapping = circuitAtState4.getComponentOriginalMapping()

	##State 5 profile
	#circuitAtState5 = circuits[4]
	#stateExpressions['5'] = circuitAtState5.printOnlyExpressed()
	#state5PartMapping = circuitAtState5.getComponentOriginalMapping()

	##Now go through each state profile anc create a five character string representing whether each gene is one
	##or not, for example:
	##	say G.5.1 is on in states 2 and 3. Then the string would be '01100'
	initDesignString = '00000'
	if len(circuits) == 16:
		##This is the 16 state system
		initDesignString = '0000000000000000'

	geneToExpression = {}
	for stateNumber in stateExpressions:
		for gene in stateExpressions[stateNumber]:
			if gene not in geneToExpression:
				##Instaniate it as all 0s, and then switch the value at the state number position-1 to be a 1
				geneToExpression[gene] = list(initDesignString)
			geneToExpression[gene][int(stateNumber)-1] = '1'
	# print('Part genes')
	# print geneToExpression
	##Now do the same with the design

	designGenesToExpression = {}
	for stateNumber in design:
		for geneId in design[stateNumber]:
			if geneId not in designGenesToExpression:
				designGenesToExpression[geneId] = list(initDesignString)
			designGenesToExpression[geneId][int(stateNumber)-1] = '1'
	# print('Design genes')
	# print designGenesToExpression
	##Now map the values that are equal in both to one another to determine which gene should be where
	finalMappingOfGeneIdToCircuitPartID = {}
	for circuitGene in geneToExpression:
		for geneId in designGenesToExpression:
			##The and statement is to cover the case where two genes may have the same expression and we want to 
			##maintain a 1 to 1 mapping
			if geneToExpression[circuitGene] == designGenesToExpression[geneId] and geneId not in finalMappingOfGeneIdToCircuitPartID:
				finalMappingOfGeneIdToCircuitPartID[circuitGene] = geneId

	##Change this so that it is now a list:
	##The first index in the list is the design gene it corresponds to
	##The second index is a list of length 5, which says which position each mapped genes moves to
	##in each state (for example, could start at position 11, then moves to 3, then gets removed, etc)
	#mappings = [state1PartMapping, state2PartMapping, state3PartMapping, state4PartMapping, state5PartMapping]
	# print finalMappingOfGeneIdToCircuitPartID

	return finalMappingOfGeneIdToCircuitPartID
