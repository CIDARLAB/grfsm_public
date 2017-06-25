'''Search function for 3-input, 16-state (and possibly future implementations)'''
import sys, os
import numpy as np
import itertools
##Add the top level path to this file
lib_path = os.path.abspath(os.path.join(''))
sys.path.insert(0, lib_path)

from application import db
#from testdb.models import circuits_with_additions

import backend.python_alg.Part as part
import backend.python_alg.RecognitionSite as rs
import backend.python_alg.GeneticCircuit as gc
import backend.python_alg.Enzyme as enz

import backend.python_alg.GeneticCircuitBuilder as gcb

import backend.db_functions.circuitRank as cr
import backend.db_functions.searchGRFSM as sg

import copy
import time
import random

PARTS = [3,6,8,2,-1,-3,-2,5,1,4,]
PART_SCORES = {
	1: 1,
	2: 1,
	3: 0,
	4: 0,
	5: 0,
	6: 0,
	8: 2,
	10: 0
}
REDUCTIONMAPPINGS = {
	3: 4,
	2: 1,
	-3: 4,
	-2: -1,
	6: 6
}


ALLPROMSCOMBINEDARRAY = {'allProm': {
	'bottomLeft1': {'1111111111111111': {'promVectorId': 7, 'circuit': [-3, 5, 5, 5, 5]}, '0101111111111111': {'promVectorId': 57, 'circuit': [5, 5, 3, 5, -3]}, '1011000101000000': {'promVectorId': 53, 'circuit': [5, 5, 5, -3, 4]}, '1010000000000000': {'promVectorId': 49, 'circuit': [5, 5, -3, 5, 4]}, '0100111010111111': {'promVectorId': 61, 'circuit': [5, 5, 5, 3, -3]}, '0100111000111000': {'promVectorId': 59, 'circuit': [5, 5, 4, 5, -3]}, '1010000010000111': {'promVectorId': 55, 'circuit': [5, 7, 5, 6, 4]}, '1111111101111000': {'promVectorId': 47, 'circuit': [5, 6, 5, 4, 5]}, '0101111101111000': {'promVectorId': 63, 'circuit': [5, 5, -7, -3, -3]}, '0000000000000000': {'promVectorId': 3, 'circuit': [4, 5, 5, 5, 5]}, '1011000111000111': {'promVectorId': 51, 'circuit': [5, 5, 6, 5, 4]}, '0000000010000111': {'promVectorId': 45, 'circuit': [5, 4, 5, 3, 5]}, '1110111010111111': {'promVectorId': 15, 'circuit': [5, -3, 5, 5, 5]}, '0001000101000000': {'promVectorId': 11, 'circuit': [5, 3, 5, 5, 5]}, '0001000111000111': {'promVectorId': 21, 'circuit': [5, 4, 3, 5, 5]}, '1110111000111000': {'promVectorId': 33, 'circuit': [5, -3, 4, 5, 5]}}, 
	'bottomLeft2': {'1111111111111111': {'promVectorId': 8, 'circuit': [-3, 5, 5, 5, 5]}, '0010101100101100': {'promVectorId': 22, 'circuit': [5, 4, 3, 5, 5]}, '1100000000000000': {'promVectorId': 50, 'circuit': [5, 5, -3, 5, 4]}, '1101010111111111': {'promVectorId': 16, 'circuit': [5, -3, 5, 5, 5]}, '0011111011010011': {'promVectorId': 64, 'circuit': [5, 5, -7, -3, -3]}, '1101010011010011': {'promVectorId': 34, 'circuit': [5, -3, 4, 5, 5]}, '0000000100101100': {'promVectorId': 46, 'circuit': [5, 4, 5, 3, 5]}, '0010101000000000': {'promVectorId': 12, 'circuit': [5, 3, 5, 5, 5]}, '1100000100101100': {'promVectorId': 56, 'circuit': [5, 7, 5, 6, 4]}, '0011111111111111': {'promVectorId': 58, 'circuit': [5, 5, 3, 5, -3]}, '1110101000000000': {'promVectorId': 54, 'circuit': [5, 5, 5, -3, 4]}, '0000000000000000': {'promVectorId': 4, 'circuit': [5, 5, 5, 5, 5]}, '0001010111111111': {'promVectorId': 62, 'circuit': [5, 5, 5, 3, -3]}, '1111111011010011': {'promVectorId': 48, 'circuit': [5, 6, 5, 4, 5]}, '0001010011010011': {'promVectorId': 60, 'circuit': [5, 5, 4, 5, -3]}, '1110101100101100': {'promVectorId': 52, 'circuit': [5, 5, 6, 5, 4]}}, 
	'topRight2': {'1111111111111111': {'promVectorId': 2, 'circuit': [3, 5, 5, 5, 5]}, '1011000111000111': {'promVectorId': 42, 'circuit': [4, 5, 6, 5, 5]}, '0101111111111111': {'promVectorId': 28, 'circuit': [3, 5, -3, 5, 5]}, '0100111000111000': {'promVectorId': 38, 'circuit': [3, 5, 4, 5, 5]}, '1010000000000000': {'promVectorId': 20, 'circuit': [4, 5, 3, 5, 5]}, '0100111010111111': {'promVectorId': 32, 'circuit': [5, 3, 4, 5, 5]}, '0000000010000111': {'promVectorId': 36, 'circuit': [4, 5, 5, -3, 5]}, '0101111101111000': {'promVectorId': 40, 'circuit': [3, 5, -3, -7, 5]}, '0000000000000000': {'promVectorId': 6, 'circuit': [4, 5, 5, 5, 5]}, '1011000101000000': {'promVectorId': 24, 'circuit': [4, 5, 5, 3, 5]}, '1111111101111000': {'promVectorId': 26, 'circuit': [3, 5, 5, 3, 5]}, '1110111010111111': {'promVectorId': 10, 'circuit': [5, 3, 5, 5, 5]}, '0001000111000111': {'promVectorId': 30, 'circuit': [4, 5, -3, 5, 5]}, '0001000101000000': {'promVectorId': 14, 'circuit': [5, -3, 5, 5, 5]}, '1110111000111000': {'promVectorId': 18, 'circuit': [3, 5, 3, 5, 5]}, '1010000010000111': {'promVectorId': 44, 'circuit': [4, -7, 6, 5, 5]}}, 
	'topRight1': {'1111111111111111': {'promVectorId': 1, 'circuit': [3, 5, 5, 5, 5]}, '1001100000110010': {'promVectorId': 43, 'circuit': [4, -7, 6, 5, 5]}, '1011101101111111': {'promVectorId': 9, 'circuit': [5, 3, 5, 5, 5]}, '0000100000110010': {'promVectorId': 35, 'circuit': [4, 5, 5, -3, 5]}, '1111011111001101': {'promVectorId': 25, 'circuit': [3, 5, 5, 3, 5]}, '0100110010110010': {'promVectorId': 29, 'circuit': [4, 5, -3, 5, 5]}, '1001000000000000': {'promVectorId': 19, 'circuit': [4, 5, 3, 5, 5]}, '0100010010000000': {'promVectorId': 13, 'circuit': [5, -3, 5, 5, 5]}, '0010101101111111': {'promVectorId': 31, 'circuit': [5, 3, 4, 5, 5]}, '1101110010110010': {'promVectorId': 41, 'circuit': [4, 5, 6, 5, 5]}, '0000000000000000': {'promVectorId': 5, 'circuit': [5, 5, 5, 5, 5]}, '1011001101001101': {'promVectorId': 17, 'circuit': [3, 5, 3, 5, 5]}, '0110111111111111': {'promVectorId': 27, 'circuit': [3, 5, -3, 5, 5]}, '1101010010000000': {'promVectorId': 23, 'circuit': [4, 5, 5, 3, 5]}, '0110011111001101': {'promVectorId': 39, 'circuit': [3, 5, -3, -7, 5]}, '0010001101001101': {'promVectorId': 37, 'circuit': [3, 5, 4, 5, 5]}}}, 'total': 64}

##This function needs to be recursive because right now handles one piece at a time
def checkReduction(circuit, designVector):
	reducingDict = {
		4: [5, 7, -7],
		7: [5],
		-7: [5],
		6: [5, 10, -10]
	}

	stringCircuits = {}
	##Check all the reduced circuit possibilities (for the term reduction)
	for pi in xrange(len(circuit)):
		p = circuit[pi]
		if p in reducingDict:
			circsToCheck = []
			for rp in reducingDict[p]:
				newCirc = circuit[:]
				newCirc[pi] = rp

				##Now check the expression vector of this new circuit
				circsAndProms = gcb.build16StateCircuit(newCirc, includeAllCircuits=True, getPromsAndTerms=True)
				allCircs = circsAndProms['allCircuits']
				promoterParts = circsAndProms['partsWithPromotersInThem']
				terminatorParts = circsAndProms['partsWithTerminatorsInThem']

				expressionVector = gcb.getFullExpressionVectorForCircuit(allCircs, [], promoterParts, terminatorParts)
				if designVector == expressionVector['designVector']:
					##Then we have a good reduction and we can break out of this
					stringCircuit = [str(i) for i in newCirc]
					stringCircuit = '.'.join(stringCircuit)
					stringCircuits[stringCircuit] = newCirc
					break

	if len(stringCircuits) == 0:
		sC = [str(i) for i in circuit]
		sC = '.'.join(sC)
		return {
			sC: circuit
		}
	else:
		z = {}
		for k in stringCircuits:
			y = checkReduction(stringCircuits[k], designVector)
			z.update(y)
		return z


def combineTwoFragments(piece1, piece2):
	##The logic below needs to be checked because we may want to have read-through from time to time
	##or we may want to not have it...
	combine = {
		(-1, 5): -1,
		(-2, 5): -2,
		(-3, 4): -3,
		(-3, 5): -3,
		(-7, -3): -3,
		(-7, 4): 4,
		(-7, 5): -7,
		(-10, -3): -3,
		(-10, 4): -3,
		(-10, 5): -10,
		(1, -3): -9, ###
		(2, -3): 11, ####
		(3, -3): 6, ### Could depend on if the terminator is used. May want to make the 4 options (3, -3, 4, 6)
		(3, 4): 4,
		(3, 5): 3,
		(4, -3): 4, ####
		(4, 5): 4,
		(5, -1): -1,
		(5, -2): -2,
		(5, -3): -3,
		(5, -7): -7,
		(5, -10): -10,
		(5, 1): 1,
		(5, 2): 2,
		(5, 3): 3,
		(5, 4): 4,
		(5, 6): 6,
		(5, 7): 7,
		(5, 10): 10,
		(6, -3): 6, ###
		(6, 4): -3,
		(6, 5): 6,
		(7, -3): -3, ##Should be ok
		(7, 4): 4, ##Should be handled by the redundancy check
		(7, 5): 7,
		(10, -3): -3,
		(10, 4): 4,
		(10, 5): 10
	}

	return combine[(piece1, piece2)]



##TODO: check these function tomorrow because they are off for the very large values
def convertPartsArrayToCircuitId(partsArray, numberOfGenes, mgp=True):
	parts1 = [5,10,-1]
	parts13 = [5,-10,1]
	##Organized in such a way that skipping should be more straighforward
	megaParts = [5,1,2,8,-1,-2,10,3,6,-10,-3,7,-7,4]

	parts = [5,1,4,3,6,8,2,-1,-3,-2]

	if numberOfGenes == 1:
		##A 2 and 8 will never be used in a 1 gene system
		parts = [5,1,4,3,6,-1,-3]

	if mgp:
		if numberOfGenes == 1:
			parts = [5,1,-1,10,3,6,-10,-3,7,-7,4]

		else:
			parts = megaParts

	numParts = len(parts)
	numParts1 = len(parts1)
	numParts13 = len(parts13)

	partsToIndex = {}
	parts1ToIndex = {}
	parts13ToIndex = {}

	for i in xrange(numParts):
		partsToIndex[parts[i]] = i

	for i in xrange(numParts1):
		parts1ToIndex[parts1[i]] = i

	for i in xrange(numParts13):
		parts13ToIndex[parts13[i]] = i

	##Add the first and last indices
	idToReturn = parts1ToIndex[partsArray[0]]
	idToReturn += parts13ToIndex[partsArray[12]] * numParts1*numParts**11
	
	for p in xrange(1, len(partsArray) - 1):
		idToReturn += partsToIndex[partsArray[p]] * numParts1*numParts**(p-1)

	return idToReturn



def convertCircuitIdToPartsArray(circuitId, numberOfGenes, mgp=True):
	parts1 = [5,10,-1]
	parts13 = [5,-10,1]
	##Organized in such a way that skipping should be more straighforward
	megaParts = [5,1,2,8,-1,-2,10,3,6,-10,-3,7,-7,4]

	parts = [5,1,4,3,6,8,2,-1,-3,-2]

	if numberOfGenes == 1:
		##A 2 and 8 will never be used in a 1 gene system
		parts = [5,1,4,3,6,-1,-3]

	if mgp:
		if numberOfGenes == 1:
			parts = [5,1,-1,10,3,6,-10,-3,7,-7,4]

		else:
			parts = megaParts

	numParts = len(parts)
	numParts1 = len(parts1)
	numParts13 = len(parts13)

	circuit = [
		parts1[circuitId%numParts1], 
		parts[circuitId/numParts1 % numParts],
		parts[circuitId/(numParts1*numParts**1) % numParts],
		parts[circuitId/(numParts1*numParts**2) % numParts],
		parts[circuitId/(numParts1*numParts**3) % numParts],
		parts[circuitId/(numParts1*numParts**4) % numParts],
		parts[circuitId/(numParts1*numParts**5) % numParts],
		parts[circuitId/(numParts1*numParts**6) % numParts],
		##Commenting out to test for the 9 part circuit
		parts[circuitId/(numParts1*numParts**7) % numParts],
		parts[circuitId/(numParts1*numParts**8) % numParts],
		parts[circuitId/(numParts1*numParts**9) % numParts],
		parts[circuitId/(numParts1*numParts**10) % numParts],
		parts13[circuitId/(numParts1*numParts**11) % numParts13]
		##3*7**10*3
	]

	return circuit

#######################################################
# OFFICIAL THREE INPUT SEARCH (FOR ONE GENE PROGRAMS) #
#######################################################
def newThreeInputSearch(designVector):
	# print designVector
	##Right now, only supposed 1 gene in the design
	numberOfGenesInDesign = len(designVector[0])

	formattedDesignVector = sg.formatInput(designVector, numberOfGenesInDesign, True)
	updatedNumberOfGenes = len(formattedDesignVector.T)

	##For now, can only handle one gene
	if updatedNumberOfGenes != 1:
		return ['No circuits found']

	##Will have to decide how to save the states (should it using a binary format or a string)
	convertedDesignVector = convertDesignVectorToSearchFormat(formattedDesignVector)

	##Convert the design vector into a string
	# print convertedDesignVector
	fullDesignString = ''
	for ele in convertedDesignVector:
		fullDesignString += str(ele)

	# print fullDesignString

	##Strip the 0s from the front of the search string
	finalDesignString = ''
	removed0s = False
	for i in fullDesignString:
		if i == '0' and not removed0s:
			continue
		else:
			removed0s = True
			finalDesignString += i
	##Do segment 1 search. Formatting of circuits also occurs here
	# circuits1 = segment1Search(finalDesignString)
	circuits1 = segment1Search_Alternate(finalDesignString)
	##Do segment 2 search. Formatting of circuits also occurs here
	# circuits2 = segment2Search(finalDesignString)
	circuits2 = segment2Search_Alternate(finalDesignString)
	##Do segment 3 search. Formatting of circuits also occurs here
	circuits3 = segment3Search_Alternate(finalDesignString)
	# circuits3 = segment3Search(finalDesignString)
	##Combine them and return the circuits
	allCircuits = []

	for c in circuits1:
		allCircuits.append(c)
	for c in circuits2:
		allCircuits.append(c)
	for c in circuits3:
		allCircuits.append(c)

	db.session.close()

	##Now sort through the search results and get rid of unsimplified parts
	alreadyHave = {}
	completeCircuits = []

	redundantKeys = {}

	rankedCs = cr.rankCircuits(allCircuits)

	startTime = time.time()
	for c in rankedCs:
		circsAndProms = gcb.build16StateCircuit(c, includeAllCircuits=True, getPromsAndTerms=True)
		allCircs = circsAndProms['allCircuits']
		promoterParts = circsAndProms['partsWithPromotersInThem']
		terminatorParts = circsAndProms['partsWithTerminatorsInThem']


		expressionVector = gcb.getFullExpressionVectorForCircuit(allCircs, [], promoterParts, terminatorParts)

		if len(expressionVector['unusedPromoters']) != 0:
			continue

		##Have a timeout for the search, in case it is taking too long.
		##Limitted at a 45 second search time for now. Not the best spot to do it since
		##Most of the time spent is in the checkReduction
		if time.time() - startTime > 45:
			print 'Time to search (stopped): ' + str(time.time() - startTime)
			break


		reducedCircuitsDict = checkReduction(c, expressionVector['designVector'])

		for k in reducedCircuitsDict:
			if k in alreadyHave:
				continue
			else:
				alreadyHave[k] = True
				completeCircuits.append(reducedCircuitsDict[k])

	print 'Time to search: ' + str(time.time() - startTime)
	return completeCircuits


def segment1Search_Alternate(fullDesignString):
	LEFT_IN_ZERO = set([3,4,6,7,10,-3])
	RIGHT_IN_ZERO = set([-3,4,6,-7,-10,3])
	sql = ("select "
			"d.design_vector"
			", l.p1"
			", l.p2"
			", l.p3"
			", l.p4"
			", l.p5"
			", ap.promvector"
		" from "
			"all_designs d"
		" left join "
			"all_circuits l"
		" on "
			"d.circuit_id = l.circuit_id"
		" left join "
			"all_promoters ap"
		" on "
			"d.right_prom_input_vector_id = ap.promid"
		" where "
			"d.design_vector = " + str(fullDesignString) + ""
			" and d.segment_number = 0"
	"")

	alreadyHave = {}
	resq = db.engine.execute(sql)
	circuitsTemp = []
	validCircuits = []
	for r in resq:
		circuitId = str(r.p1)+'.'+str(r.p2)+'.'+str(r.p3)+'.'+str(r.p4)+'.'+str(r.p5)
		if circuitId in alreadyHave:
			continue
		alreadyHave[circuitId] = True

		leftPiece = [int(r.p1),int(r.p2),int(r.p3),int(r.p4),int(r.p5)]
		finalCircuit1 = [int(r.p1),int(r.p2),int(r.p3),int(r.p4)]
		finalCircuit2 = [int(r.p1),int(r.p2),int(r.p3),int(r.p4), int(r.p5),5,5,5]
		##Now we have two options: put all 5s at right, or put all 5s at middle
		##Case 1: all 5s at right
		##Format prom vector
		prom_right = r.promvector
		while len(prom_right) < 16:
			prom_right = '0' + prom_right

		if prom_right in ALLPROMSCOMBINEDARRAY['allProm']['bottomLeft1']:
			##Grab the minimal prom piece to put in middle to get desired output vector
			minimalMiddle = ALLPROMSCOMBINEDARRAY['allProm']['bottomLeft1'][str(prom_right)]['circuit']
			##Have to do a combination thing here
			if leftPiece[4] != minimalMiddle[0]:
				newPiece = combineTwoFragments(leftPiece[4], minimalMiddle[0])
				finalCircuit1.append(newPiece)
			else:
				finalCircuit1.append(leftPiece[4])

			for p in xrange(1, len(minimalMiddle)):
				finalCircuit1.append(minimalMiddle[p])
			while len(finalCircuit1) < 13:
				finalCircuit1.append(5)

			validCircuits.append(finalCircuit1)

		if prom_right in ALLPROMSCOMBINEDARRAY['allProm']['bottomLeft2']:
			##Case 2: all 5s in middle
			minimalRight = ALLPROMSCOMBINEDARRAY['allProm']['bottomLeft2'][str(prom_right)]['circuit']
			##Have to do a combination thing here
			pieceNum = 0
			while len(finalCircuit2) < 13:
				finalCircuit2.append(minimalRight[pieceNum])
				pieceNum += 1

			
			validCircuits.append(finalCircuit2)
			# validCircuits.append([int(r.p1),int(r.p2),int(r.p3),int(r.p4), int(r.p5),5,5,5,5,5,5,5,5])

	return validCircuits

def segment2Search_Alternate(finalDesignString):
	LEFT_IN_ZERO = set([3,4,6,7,10,-3])
	RIGHT_IN_ZERO = set([-3,4,6,-7,-10,3])

	# print 'Seg 2 search start'
	sql = ("select "
			"d.design_vector"
			", m.p1"
			", m.p2"
			", m.p3"
			", m.p4"
			", m.p5"
			", apr.promvector as prom_right"
			", apl.promvector as prom_left"
		" from "
			"all_designs d"
		" left join "
			"all_circuits m"
		" on "
			"d.circuit_id = m.circuit_id"
		" left join "
			"all_promoters apr"
		" on "
			"d.right_prom_input_vector_id = apr.promid"
		" left join "
			" all_promoters apl"
		" on "
			"d.left_prom_input_vector_id = apl.promid"
		" where "
			"d.design_vector = " + str(finalDesignString) + ""
			" and d.segment_number = 1"
	"")

	alreadyHave = {}
	resq = db.engine.execute(sql)
	circuitsTemp = []
	validCircuits = []

	for r in resq:
		circuitId = str(r.p1)+'.'+str(r.p2)+'.'+str(r.p3)+'.'+str(r.p4)+'.'+str(r.p5)
		if circuitId in alreadyHave:
			continue
		alreadyHave[circuitId] = True

		circuit = [int(r.p1),int(r.p2),int(r.p3),int(r.p4),int(r.p5)]
		finalCircuit = []
		
		##Now grab the minimal left input and the minimal right input and combine them
		##Format prom vector
		prom_left = r.prom_left
		while len(prom_left) < 16:
			prom_left = '0' + prom_left

		# if prom_left in ALLPROMSCOMBINEDARRAY['allProm']['topRight1']:
		##Get the circuit corresponding to the minimal left circuit
		minimalLeft = ALLPROMSCOMBINEDARRAY['allProm']['topRight1'][str(prom_left)]['circuit']

		##Quick check to get the correct left input for a lot of cases
		if circuit[0] in LEFT_IN_ZERO:
			minimalLeft = [5,5,5,5,5]

		for p in xrange(len(minimalLeft)-1):
			finalCircuit.append(minimalLeft[p])

		##If the ends do not match in value, then we have to combine them appropriately
		if minimalLeft[4] != circuit[0]:
			newPiece = combineTwoFragments(minimalLeft[4], circuit[0])
			finalCircuit.append(newPiece)
		else:
			finalCircuit.append(circuit[0])

		##Append the other pieces of the circuit to the final circuit we will obtain
		pieceNum = 1
		while len(finalCircuit) < 8:
			finalCircuit.append(circuit[pieceNum])
			pieceNum += 1

		##Format prom vector
		prom_right = r.prom_right
		while len(prom_right) < 16:
			prom_right = '0' + prom_right

		# if prom_right in ALLPROMSCOMBINEDARRAY['allProm']['bottomLeft2']: 
		##Grab the minimal circuit for the right side
		minimalRight = ALLPROMSCOMBINEDARRAY['allProm']['bottomLeft2'][str(prom_right)]['circuit']

		if circuit[4] in RIGHT_IN_ZERO:
			minimalRight = [5,5,5,5,5]

		if minimalRight[0] != circuit[4]:
			newPiece = combineTwoFragments(circuit[4], minimalRight[0])
			finalCircuit.append(newPiece)
		else:
			finalCircuit.append(circuit[4])

		pieceNum = 1
		while len(finalCircuit) < 13:
			finalCircuit.append(minimalRight[pieceNum])
			pieceNum += 1

		validCircuits.append(finalCircuit)
		# validCircuits.append([5,5,5,5,circuit[0],circuit[1],circuit[2],circuit[3],circuit[4],5,5,5,5])

	return validCircuits

def segment3Search_Alternate(fullDesignString):
	LEFT_IN_ZERO = set([3,4,6,7,10,-3])
	RIGHT_IN_ZERO = set([-3,4,6,-7,-10,3])

	# print 'Search start'
	sql = ("select "
			"d.design_vector"
			", r.p1"
			", r.p2"
			", r.p3"
			", r.p4"
			", r.p5"
			", ap.promvector"
		" from "
			"all_designs d"
		" left join "
			"all_circuits r"
		" on "
			"d.circuit_id = r.circuit_id"
		" left join "
			"all_promoters ap"
		" on "
			"d.left_prom_input_vector_id = ap.promid"
		" where "
			"d.design_vector = " + str(fullDesignString) + ""
			" and d.segment_number = 2"
	"")

	alreadyHave = {}
	resq = db.engine.execute(sql)
	circuitsTemp = []
	validCircuits = []

	for r in resq:
		circuitId = str(r.p1)+'.'+str(r.p2)+'.'+str(r.p3)+'.'+str(r.p4)+'.'+str(r.p5)
		if circuitId in alreadyHave:
			continue
		alreadyHave[circuitId] = True

		rightPiece = [int(r.p1),int(r.p2),int(r.p3),int(r.p4),int(r.p5)]
		finalCircuit1 = []
		finalCircuit2 = []
		##Now we have two options: put all 5s at right, or put all 5s at middle
		##Case 1: all 5s at middle
		##Format prom vector
		left_prom = r.promvector
		while len(left_prom) < 16:
			left_prom = '0' + left_prom

		##Grab the minimal prom piece to put in middle to get desired output vector
		if left_prom in ALLPROMSCOMBINEDARRAY['allProm']['topRight1']:
			minimalRight = ALLPROMSCOMBINEDARRAY['allProm']['topRight1'][str(left_prom)]['circuit']
			finalCircuit1 = minimalRight[:]
			while len(finalCircuit1) < 8:
				finalCircuit1.append(5)

			pieceNum = 0
			while len(finalCircuit1) < 13:
				finalCircuit1.append(rightPiece[pieceNum])
				pieceNum += 1

		##Case 2: all 5s on left
		if left_prom in  ALLPROMSCOMBINEDARRAY['allProm']['topRight2']:
			finalCircuit2 = [5,5,5,5]
			minimalMiddle = ALLPROMSCOMBINEDARRAY['allProm']['topRight2'][str(left_prom)]['circuit']

			pieceNum = 0
			while len(finalCircuit2) < 8:
				finalCircuit2.append(minimalMiddle[pieceNum])
				pieceNum += 1

			if minimalMiddle[4] != rightPiece[0]:
				newPiece = combineTwoFragments(minimalMiddle[4], rightPiece[0])
				finalCircuit2.append(newPiece)
			else:
				finalCircuit2.append(rightPiece[0])

			pieceNum = 1
			while len(finalCircuit2) < 13:
				finalCircuit2.append(rightPiece[pieceNum])
				pieceNum += 1

		if len(finalCircuit1) == 13:
			validCircuits.append(finalCircuit1)
		if len(finalCircuit2) == 13:
			validCircuits.append(finalCircuit2)
		# validCircuits.append([5,5,5,5,5,5,5,5, rightPiece[0], rightPiece[1], rightPiece[2], rightPiece[3],rightPiece[4]])

	return validCircuits



def segment1Search(fullDesignString):
	print 'In segment 1 search but nothing happened'
	#####################################################
	# FOR SEGMENT 1 SEARCHING, WE CAN USE THE SQL BELOW #
	#####################################################
	sqlPromSelect = ("select "
		"promvector"
		",promid"
		" from "
		"all_promoters"
		" where "
		"b2 = 1")

	validPromsAtB2 = {}
	allPromsQ = db.engine.execute(sqlPromSelect)
	for rq in allPromsQ:
		validPromsAtB2[rq.promvector] = rq.promid

	sql = ("select "
		"l.p1 as p1"
		",l.p2 as p2"
		",l.p3 as p3"
		",l.p4 as p4"
		",l.p5 as p_5"
		",m.p1 as p__5"
		",m.p2 as p6"
		",m.p3 as p7"
		",m.p4 as p8"
		",m.p5 as p_9"
		",m.left_out_s2 as promvector"
		",ap.promvector as promvectorouts2"
	" from "
		"all_designs d"
	" left join "
		"all_circuits l"
	" on "
		"d.circuit_id = l.circuit_id"
	" left join "
		"all_circuits m"
	" on "
		"d.right_prom_input_vector_id = m.left_out_s2"
	" left join "
		"all_promoters ap"
	" on "
		"ap.promid = m.left_out_s2"
	" where "
		"d.design_vector =" +str(fullDesignString) + ""
		" and d.segment_number = 0"
		" and m.number_of_genes = 0"
		" limit 100000")

	##This grabs 2/3 of the valid circuit components. But we need to figure out the left side
	alreadyHave = {}
	resq = db.engine.execute(sql)
	circuitsTemp = []
	validCircuits = []
	# print 'There are ' + str(len(resq)) + ' to consider'
	for r in resq:
		circuitId = str(r.p1)+'.'+str(r.p2)+'.'+str(r.p3)+'.'+str(r.p4)+'.'+str(r.p_5)+'.'+str(r.p__5)+'.'+str(r.p6)+'.'+str(r.p7)+'.'+str(r.p8)+'.'+str(r.p_9)
		if circuitId in alreadyHave:
			continue
		alreadyHave[circuitId] = True

		##Rebuild the left and middle and then we have to do some analysis to find the right side
		##piece
		cL = [int(r.p1), int(r.p2), int(r.p3), int(r.p4), int(r.p_5)]
		cm = [int(r.p__5), int(r.p6), int(r.p7), int(r.p8), int(r.p_9)]
		cr = []

		val = gcb.subPartArrayExpressionVectorAnalysis_NonIso(cm, readThrough=True)
		##If the answer is a non read througn, then the rightmost circuit should be all
		##5s in the one gene case 
		if val == 'NONREADTHROUGH':
			cr = [5,5,5,5,5]
		else:
			##Then we have to try out all the proms that are valid as bottom at 2 and see
			##which outputs give the output we have above
			validPromIdsToLookFor = []
			for kProm in validPromsAtB2:
				kPromFixed = kProm
				while len(kPromFixed) < 16:
					kPromFixed = '0' + kPromFixed
				allOutputs = gcb.createDependentPromoterDesignVectorForSegment(val['outputs'], '0000000000000000', kPromFixed, 1)
				##Have to fix the promvectorouts2 so that it has the correct number of 0s
				promVectorOfInterest = r.promvectorouts2
				while len(promVectorOfInterest) < 16:
					promVectorOfInterest = '0' + promVectorOfInterest

				if allOutputs['ol'] == promVectorOfInterest:
					##This is a valid promoter id to include
					validPromIdsToLookFor.append(validPromsAtB2[kProm])
			##We now have a list of all valid inputs at b2. We should find the SIMPLEST circuit
			##that would be a valid input at B2 and use that

			##Find the first circuit for which one of these would work
			makeList = '('
			for i in validPromIdsToLookFor:
				makeList += str(i) + ','
			makeList = makeList[:-1]
			makeList += ')'

			rightMostCircuitSql = ("select "
					"c.p1 as p__9"
					",c.p2 as p10"
					",c.p3 as p11"
					",c.p4 as p12"
					",c.p5 as p13"
				" from "
					"all_circuits c"
				" where "
					"c.left_out_s3 in " + makeList + ""
					##For one gene systems
					" and c.number_of_genes = 0"
				" limit 1")
			qq = db.engine.execute(rightMostCircuitSql)
			for quer in qq:
				cr = [int(quer.p__9), int(quer.p10), int(quer.p11), int(quer.p12), int(quer.p13)]
			
			if len(cr) > 0:
				if cL[4] == cm[0] and cm[4] == cr[0]:
					validCircuits.append([cL[0],cL[1],cL[2],cL[3],cL[4],cm[1],cm[2],cm[3],cm[4],cr[1],cr[2],cr[3],cr[4]])
			

	return validCircuits

def segment3Search(fullDesignString):
	print 'started 3 search'
	#####################################################
	# FOR SEGMENT 3 SEARCHING, WE CAN USE THE SQL BELOW #
	#####################################################
	sqlPromSelect = ("select "
		"promvector"
		",promid"
		" from "
		"all_promoters"
		" where "
		"t1 = 1")

	validPromsAtT1 = {}
	allPromsQ = db.engine.execute(sqlPromSelect)
	for rq in allPromsQ:
		validPromsAtT1[rq.promvector] = rq.promid

	sql = ("select "
		"m.p1 as p__5"
	 	",m.p2 as p6"
	 	",m.p3 as p7"
	 	",m.p4 as p8"
	 	",m.p5 as p_9"
	 	",r.p1 as p__9"
	 	",r.p2 as p10"
	 	",r.p3 as p11"
	 	",r.p4 as p12"
	 	",r.p5 as p13"
		",m.right_out_s2 as promvector"
		",ap.promvector as promvectorouts2"
	" from "
		"all_designs d"
	" left join "
		"all_circuits r"
	" on "
		"d.circuit_id = r.circuit_id"
	" left join "
		"all_circuits m"
	" on "
		"d.left_prom_input_vector_id = m.right_out_s2"
	" left join "
		"all_promoters as ap"
	" on "
		"m.right_out_s2 = ap.promid"
	" where "
		"d.design_vector =" +str(fullDesignString)+""
		" and d.segment_number = 2"
  		" and m.number_of_genes = 0"
  		" limit 100000")

		##This grabs 2/3 of the valid circuit components. But we need to figure out the left side
	alreadyHave = {}
	print sql
	resq = db.engine.execute(sql)
	print 'finished selection'
	circuitsTemp = []
	validCircuits = []
	# print 'There are ' + str(len(resq)) + ' to consider'
	for r in resq:
		circuitId = str(r.p__5)+'.'+str(r.p6)+'.'+str(r.p7)+'.'+str(r.p8)+'.'+str(r.p_9)+'.'+str(r.p__9)+'.'+str(r.p10)+'.'+str(r.p11)+'.'+str(r.p12)+'.'+str(r.p13)
		if circuitId in alreadyHave:
			continue
		alreadyHave[circuitId] = True

		##Rebuild the left and middle and then we have to do some analysis to find the right side
		##piece
		cL = []
		cm = [int(r.p__5), int(r.p6), int(r.p7), int(r.p8), int(r.p_9)]
		cr = [int(r.p__9), int(r.p10), int(r.p11), int(r.p12), int(r.p13)]

		val = gcb.subPartArrayExpressionVectorAnalysis_NonIso(cm, readThrough=True)
		##If the answer is a non read througn, then the rightmost circuit should be all
		##5s in the one gene case 
		if val == 'NONREADTHROUGH':
			cL = [5,5,5,5,5]
		else:
			##Then we have to try out all the proms that are valid as bottom at 2 and see
			##which outputs give the output we have above
			validPromIdsToLookFor = []
			for kProm in validPromsAtT1:
				kPromFixed = kProm
				while len(kPromFixed) < 16:
					kPromFixed = '0' + kPromFixed
				allOutputs = gcb.createDependentPromoterDesignVectorForSegment(val['outputs'], kPromFixed, '0000000000000000', 1)
				##Have to fix the promvectorouts2 so that it has the correct number of 0s
				promVectorOfInterest = r.promvectorouts2
				while len(promVectorOfInterest) < 16:
					promVectorOfInterest = '0' + promVectorOfInterest

				if allOutputs['or'] == promVectorOfInterest:
					##This is a valid promoter id to include
					validPromIdsToLookFor.append(validPromsAtT1[kProm])
			##We now have a list of all valid inputs at T1. We should find the SIMPLEST circuit
			##that would be a valid input at T1 and use that

			##Find the first circuit for which one of these would work
			makeList = '('
			for i in validPromIdsToLookFor:
				makeList += str(i) + ','
			makeList = makeList[:-1]
			makeList += ')'

			leftMostCircuitSQL = ("select "
					"c.p1 as p1"
					",c.p2 as p2"
					",c.p3 as p3"
					",c.p4 as p4"
					",c.p5 as p_5"
				" from "
					"all_circuits c"
				" where "
					"c.right_out_s1 in " + makeList + ""
					#For one gene systems
					" and c.number_of_genes = 0"
				" limit 1")
			qq = db.engine.execute(leftMostCircuitSQL)
			for quer in qq:
				cL = [int(quer.p1), int(quer.p2), int(quer.p3), int(quer.p4), int(quer.p_5)]
			
			if len(cL) > 0:
				if cL[4] == cm[0] and cm[4] == cr[0]:
					validCircuits.append([cL[0],cL[1],cL[2],cL[3],cL[4],cm[1],cm[2],cm[3],cm[4],cr[1],cr[2],cr[3],cr[4]])
			
	return validCircuits

def segment2Search(fullDesignString):
	print 'Started second search'
	#####################################################
	# FOR SEGMENT 2 SEARCHING, WE CAN USE THE SQL BELOW #
	#####################################################
	# -- Test design vector = '1010000100000100'
	sql = ("select "
		"l.p1 as p1"
		",l.p2 as p2"
		",l.p3 as p3"
		",l.p4 as p4"
		",l.p5 as p_5"
		",m.p1 as p__5"
		",m.p2 as p6"
		",m.p3 as p7"
		",m.p4 as p8"
		",m.p5 as p_9"
		",r.p1 as p__9"
		",r.p2 as p10"
		",r.p3 as p11"
		",r.p4 as p12"
		",r.p5 as p13"
	" from "
		"all_designs d"
	" left join "
		"all_circuits m"
	" on "
		"d.circuit_id = m.circuit_id"
	" left join "
		"all_circuits l"
	" on "
		"d.left_prom_input_vector_id = l.right_out_s1"
	" left join "
		"all_circuits r"
	" on "
		"d.right_prom_input_vector_id = r.left_out_s3"
	" where "
		"d.design_vector = " + str(fullDesignString) + ""
		" and d.segment_number = 1"
		" and l.number_of_genes = 0"
		" and r.number_of_genes = 0"
	" limit 100000")

	print sql
	alreadyHave = {}
	resq = db.engine.execute(sql)
	print 'Finished selection'
	circuits = []
	# print 'There are ' + str(len(resq)) + ' to consider'
	for r in resq:
		circuitId = str(r.p1)+'.'+str(r.p2)+'.'+str(r.p3)+'.'+str(r.p4)+'.'+str(r.p_5)+'.'+str(r.p__5)+'.'+str(r.p6)+'.'+str(r.p7)+'.'+str(r.p8)+'.'+str(r.p_9)+'.'+str(r.p__9)+'.'+str(r.p10)+'.'+str(r.p11)+'.'+str(r.p12)+'.'+str(r.p13)
		if circuitId in alreadyHave:
			continue
		alreadyHave[circuitId] = True
		##Have to do the circuit combinations here
		if r.p_5 == r.p__5 and r.p_9 == r.p__9:
			circuits.append([int(r.p1), int(r.p2), int(r.p3), int(r.p4), int(r.p_5),int(r.p6), int(r.p7), int(r.p8), int(r.p_9), int(r.p10),int(r.p11),int(r.p12),int(r.p13)])

	return circuits

def threeInput16StateSearchFromBruteForce(designVector):	
	print designVector
	##Right now, only supposed 1 gene in the design
	numberOfGenesInDesign = len(designVector[0])

	formattedDesignVector = sg.formatInput(designVector, numberOfGenesInDesign, True)
	updatedNumberOfGenes = len(formattedDesignVector.T)

	##For now, can only handle one gene
	if updatedNumberOfGenes != 1:
		return ['No circuits found']

	##Will have to decide how to save the states (should it using a binary format or a string)
	convertedDesignVector = convertDesignVectorToSearchFormat(formattedDesignVector)

	print convertedDesignVector

	##Create search query
	sql = ("select "
		"t1.circuit_id"
	" from "
		"grfsmdb.sxtnstt_one as t1"
	" where "
		"s1 = " + str(convertedDesignVector[0]) + " and " 
		"s2 = " + str(convertedDesignVector[1]) + " and " 
		"s3 = " + str(convertedDesignVector[2]) + " and " 
		"s4 = " + str(convertedDesignVector[3]) + " and " 
		"s5 = " + str(convertedDesignVector[4]) + " and " 
		"s6 = " + str(convertedDesignVector[5]) + " and " 
		"s7 = " + str(convertedDesignVector[6]) + " and " 
		"s8 = " + str(convertedDesignVector[7]) + " and " 
		"s9 = " + str(convertedDesignVector[8]) + " and " 
		"s10 = " + str(convertedDesignVector[9]) + " and " 
		"s11 = " + str(convertedDesignVector[10]) + " and " 
		"s12 = " + str(convertedDesignVector[11]) + " and " 
		"s13 = " + str(convertedDesignVector[12]) + " and " 
		"s14 = " + str(convertedDesignVector[13]) + " and " 
		"s15 = " + str(convertedDesignVector[14]) + " and " 
		"s16 = " + str(convertedDesignVector[15]) + ""
	)

	# print sql

	##The above sql will return a bunch of circuit ids that correspond to a specific way of
	##determining the original circuits from a parts array.
	resultQ = db.engine.execute(sql)
	circuitsThatWork = []
	for q in resultQ:
		circuitsThatWork.append(convertCircuitIdToPartsArray(int(q.circuit_id), numberOfGenesInDesign))

	# print len(circuitsThatWork)

	db.session.close()

	if len(circuitsThatWork) == 0:
		print 'No circuits found'
		return ['No circuits found']

	return circuitsThatWork



##Searches the database and reconstructs the 3 input, 16 state machines that match 
##the search criteria
def threeInput16StateSearch(designVector, maxNumGenes, minNum5s, geneThreshold):
	starttime = time.time()
	##For certain parts that are reversible, we need to have an or clause, for others we
	##don't

	##c6.p1 == c7.p1
	##c6.p3 == -1*c7.p2
	##c6.p5 == c7.p3
	##c6.p6 == c7.p4
	##c6.p7 == c7.p5
	##c6.p8 == -1*c7.p7
	##c6.p9 == c7.p9

	##c7.p1 == c10.p1
	##c7.p2 == c10.p2
	##c7.p3 == c10.p3
	##c7.p4 == -1*c10.p5
	##c7.p5 == c10.p7
	##c7.p7 == -1*c10.p8
	##c7.p9 == c10.p9

	##Theoretically have to convert from vector to binary (so the design could be in the form:
	##[10,01,01,01,01,01,10,10,11,11,11,11,11,11,01,01] which would have to be changed to
	##[1,2,2,2,2,2,1,1,3,3,3,3,3,3,2,2])
	##For now, going to change it to how it was before (just raw design ids)
	#threshold = 4

	##Convert it to the same format as the 2-input, 5 state format and then convert it
	##to the valid format for it to be searched
	numberOfGenesInDesign = len(designVector[0])
	formattedDesignVector = sg.formatInput(designVector, numberOfGenesInDesign, True)
	updatedNumberOfGenes = len(formattedDesignVector.T)

	print formattedDesignVector

	convertedDesignVector = convertDesignVectorToSearchFormat(formattedDesignVector)
	print convertedDesignVector
	##Get all the possible circuits that would work for states 6 and 7. Determine what states 2, 5,
	##and 11 would look like based on those two states and if it is valid, then they should be
	##considered
	MAXNUMBEROFGENES = str(updatedNumberOfGenes + 1)
	MINNUMBEROF5S = str(8 - updatedNumberOfGenes-1)
	threshold = updatedNumberOfGenes+1

	totalNumber = 1326
	##Uncomment lines until large comment line to get an accurate percentage of completion count
	countSql = ("SELECT "
				# "count(*) as totalNumber,"
				"c6.id as c6id,"
				"c7.id as c7id"
			" FROM " 
				"grfsmdb.circuits_with_additions c6," 
				"grfsmdb.circuits_with_additions c7" 
			" WHERE " 
				"c6.numberOfGenes < " + MAXNUMBEROFGENES + " and " 
				"c7.numberOfGenes < " + MAXNUMBEROFGENES + " and " 
				"c6.numberOf5s > " + MINNUMBEROF5S + " and " 
				"c7.numberOf5s > " + MINNUMBEROF5S + " and " 
				"c6.genesexpressed = " + str(convertedDesignVector[5]) + " and " 
				"c6.genesexpressed12 = " + str(convertedDesignVector[11]) +" and " 
				"c7.genesexpressed = " + str(convertedDesignVector[6]) + " and " 
				"c7.genesexpressed13 = " + str(convertedDesignVector[12]) + " and " 
				"c6.p1 = c7.p1 and " 
				"CASE WHEN (c6.p3 = 5 or c6.p3 = 4 or c6.p3 = 6 or c6.p3 = 8) THEN " 
					"(c6.p3 = -1*c7.p2 or c6.p3 = c7.p2)" 
				" ELSE "
					"c6.p3 = -1*c7.p2" 
				" END and " 
				"c6.p5 = c7.p3 and " 
				"c6.p6 = c7.p4 and " 
				"c6.p7 = c7.p5 and " 
				"CASE WHEN (c6.p8 = 5 or c6.p8 = 4 or c6.p8 = 6 or c6.p8 = 8) THEN " 
					"(c6.p8 = -1*c7.p7 or c6.p8 = c7.p7)" 
				" ELSE " 
					"c6.p8 = -1*c7.p7" 
				" END and "
				##For debugging
				# "c6.id = 241 and c7.id = 240010 and "
				"c6.p9 = c7.p9")
	countResults = db.engine.execute(countSql)
	totalNumber = 0
	for cq in countResults:
		totalNumber += 1
	print totalNumber
	##################################################################

	sql = ("SELECT "
				# "count(*) as totalNumber,"
				"c6.id as c6id,"
				"c7.id as c7id,"
				"c6.numberOfGenes as c6numGenes,"
				"c7.numberOfGenes as c7numGenes," 
				"c6.p1 as p0," 
				"c7.p2 as p1," 
				"-1*c7.p2 as pm1," 
				"CASE WHEN (c6.p2 = 5 or c6.p2 = 4 or c6.p2 = 6 or c6.p2 = 8) THEN " 
					"c6.p2" 
				" ELSE " 
					"-1*c6.p2" 
				" END as p2," 
				"CASE WHEN (c6.p2 = 5 or c6.p2 = 4 or c6.p2 = 6 or c6.p2 = 8) THEN " 
					"-1*c6.p2" 
				" ELSE " 
					"c6.p2" 
				" END as pm2," 
				"c6.p4 as p3," 
				"-1*c6.p4 as pm3," 
				"c6.p5 as p4," 
				"c6.p6 as p5," 
				"c6.p7 as p8," 
				"c6.p8 as p9," 
				"-1*c6.p8 as pm9," 
				"CASE WHEN (c7.p6 = 5 or c7.p6 = 4 or c7.p6 = 6 or c7.p6 = 8) THEN "
					"c7.p6" 
				" ELSE " 
					"-1*c7.p6" 
				" END as p10," 
				"CASE WHEN (c7.p6 = 5 or c7.p6 = 4 or c7.p6 = 6 or c7.p6 = 8) THEN " 
					"-1*c7.p6" 
				" ELSE " 
					"c7.p6" 
				" END as pm10," 
				"c7.p8 as p11," 
				"-1*c7.p8 as pm11," 
				"c7.p9 as p12"
			" FROM " 
				"grfsmdb.circuits_with_additions c6," 
				"grfsmdb.circuits_with_additions c7" 
			" WHERE " 
				"c6.numberOfGenes < " + MAXNUMBEROFGENES + " and " 
				"c7.numberOfGenes < " + MAXNUMBEROFGENES + " and " 
				"c6.numberOf5s > " + MINNUMBEROF5S + " and " 
				"c7.numberOf5s > " + MINNUMBEROF5S + " and " 
				"c6.genesexpressed = " + str(convertedDesignVector[5]) + " and " 
				"c6.genesexpressed12 = " + str(convertedDesignVector[11]) +" and " 
				"c7.genesexpressed = " + str(convertedDesignVector[6]) + " and " 
				"c7.genesexpressed13 = " + str(convertedDesignVector[12]) + " and " 
				"c6.p1 = c7.p1 and " 
				"CASE WHEN (c6.p3 = 5 or c6.p3 = 4 or c6.p3 = 6 or c6.p3 = 8) THEN " 
					"(c6.p3 = -1*c7.p2 or c6.p3 = c7.p2)" 
				" ELSE "
					"c6.p3 = -1*c7.p2" 
				" END and " 
				"c6.p5 = c7.p3 and " 
				"c6.p6 = c7.p4 and " 
				"c6.p7 = c7.p5 and " 
				"CASE WHEN (c6.p8 = 5 or c6.p8 = 4 or c6.p8 = 6 or c6.p8 = 8) THEN " 
					"(c6.p8 = -1*c7.p7 or c6.p8 = c7.p7)" 
				" ELSE " 
					"c6.p8 = -1*c7.p7" 
				" END and "
				##For debugging
				"c6.id = 241 and c7.id = 240010 and "
				# "c6.id = 1 and c7.id = 30001 and "
				"c6.p9 = c7.p9")
	results = db.engine.execute(sql)
	count = 0
	countValid = 0
	quitEarly = 0

	timeSpentMakingCircuits = 0
	timeSpendLookingAtCircuits = 0

	numberOfSystemsMade = 0

	validQs = []
	circuitsThatWork = []
	printExtra = False
	skipped = 0

	for q in results:
		if q.c6id == 241:
			if q.c7id == 240010:
					printExtra = True
		#	if q.c6parts == '5,5,-3,5,5,5,5,5,5'
		# 	if q.c7parts == '5,3,5,5,5,-3,5,5,5':
		# 		print "This should be are boy"
		# 		printExtra = True
		count += 1

		genesSoFar = q.c6numGenes + q.c7numGenes
		# if count < 1600:
		# 	continue
		##Could also do this using the p1...p9 columns
		#[0, -2, -1, 3, 4, 5, 8, 9, 10, 11, 12]
		state2 = [q.p0, q.pm2, q.pm1, q.p3, q.p4, q.p5, q.p8, q.p9, q.p10, q.p11, q.p12]
		#[0, -2, -3, 1, 4, 5, 8, -10, -9, 11, 12]
		state5 = [q.p0, q.pm2, q.pm3, q.p1, q.p4, q.p5, q.p8, q.pm10, q.pm9, q.p11, q.p12]
		#[0, -2, -3, 1, 4, 5, 8, -10, -11, 9, 12]
		state11 = [q.p0, q.pm2, q.pm3, q.p1, q.p4, q.p5, q.p8, q.pm10, q.pm11, q.p9, q.p12]
		##Now check if these design ids are valid for each of these. If one is not, we go
		##onto the next q and do not add it to our state diagram
		##Have to build a circuit for each and determine number expressed
		states2511 = [(1,state2), (4,state5), (10,state11)]
		valid = True
		for state in states2511:
			if genesSoFar == 0:
				designId = 0
				if designId != convertedDesignVector[state[0]]:
					valid = False
					break
			else:
				partsArray = state[1]
				circ = gcb.buildOneCircuit(partsArray)
				designId = gcb.getNumberOfGenesExpressedForCircuit(circ)
				if designId != convertedDesignVector[state[0]]:
					valid = False
					break
		##If it is valid, then we want to test all the recombined circuits in this case
		##and see which ones match are design
		##PARTS = [5,1,4,3,6,8,2,-1,-3,-2]
		##Come up with some sort of metric that favorites certain ids and only considers
		##those first (ranking as we create them in a sense). One way we could do this
		##is by ensuring that we are not increasing the gene count over a set value (if 
		##we have a state machine that is regulating one gene, we should try avoiding
		##having many copies of that gene, so score 1s, 8s, 2s as higher or avoid them)

		if valid:
			#validQs.append(q)
			countValid += 1
			origArray = [q.p0,q.p1,q.p2,q.p3,q.p4,q.p5,0,0,q.p8,q.p9,q.p10,q.p11,q.p12]
			
			##Count the number of each part to possibly give the circuit some sort of score
			numberOfGenes = 0
			numberOf5s = 0
			for p in origArray:
				if p == 0:
					continue
				numberOfGenes += PART_SCORES[abs(p)]
				if p == 5:
					numberOf5s += 1

			##We should check putting 2 fives there first. Because if we put two fives and
			##we observe an unused part, then we know that this circuit will always be
			##have a redundant part, so we know it is not a valid circuit to consider

			for part6 in PARTS:
				##If we are adding a gene above the allowable threshold (which should be
				##set at the top of the function (will be set to 2 or 3 here)), skip this
				##part, as this circuit would rank low and is not worth using time to
				##analyze it

				##Other option that will be implemented for now: the number of genes in the
				##final circuit must equal EXACTLY the number of genes in the system (otherwise)
				##there are either two few genes so this cicruit is not valid anyways or there
				##are useless genes that can be replaced by simpler parts or 5s
				##The number of genes is stored in updatedNumberOfGenes

				newNumGenes = numberOfGenes + PART_SCORES[abs(part6)]

				if newNumGenes > threshold or newNumGenes == 0:
					skipped += 1
					continue
				for part7 in PARTS:
					newerNumGenes = newNumGenes + PART_SCORES[abs(part7)]
					##Taking into account the second paragraph above about exact number
					##of genes
					##if newerNumGenes > threshold or newerNumGenes == 0:
					if newerNumGenes != updatedNumberOfGenes:
						skipped += 1
						continue
					finalPartsArray = origArray[:]
					finalPartsArray[6] = part6
					finalPartsArray[7] = part7

					printMore = False
					# if finalPartsArray == [5,5,5,5,5,5,5,-3,5,5,-1,5,5]:
					# 	print "This should be valid"
					# 	printMore = True

					##This circuit has already been checked and validated so no need to look
					##at it again
					# if str(finalPartsArray) in circuitsChecked:
					# 	if printMore:
					# 		"The error is here"
					# 	skipped += 1
					# 	continue

					# if printExtra:
					# 	print finalPartsArray
					##In the case where we are looking at a diagram that has one gene
					##we do not need to build states 2,5,6,7,10,11,12,13 or 16 because we
					##have already looked at those (and know their design ids)

					##Something like this would also work when we are looking at diagrams
					##that have states with 0 in them
					##Have to fix this using the formatted input. And should also check every
					##state (unless the state has 0 genes expressed or it is a 1 gene system)

					##Explanation of what is happening below: we do not want to have to build
					##every single possible system and then check if it matches the vector.
					##Instead, we build one the circuits for the states that we have not checked
					##gene expression values in yet (in stateSet). We then validated that the
					##number of genes expressed in these states matches the design system (for
					##many of them, it does not). If all the states pass this check, then we make
					##the entire system and compare it to the original formatted vector. We cut the
					##run time ten fold by including this step in the process

					#allCircs = gcb.buildOneCircuit(finalPartsArray)
					stateSet = set([1,3,4,8,9,10,14,15,16])
					startMaking = time.time()
					#stateSet = set(range(1,17))

					##If there are not genes or promoters in a certain circuit, then we automatically
					##know that it has 0 genes expressed and that its children also have no genes
					##expressed. This could save lots of time when looking at states with 0 genes
					##expressed
					allCircs = gcb.build16StateCircuit(finalPartsArray, False, stateSet, convertedDesignVector)
					doneMaking = time.time()
					timeSpentMakingCircuits += (doneMaking - startMaking)
					if allCircs == False:
						if printMore:
							"No the error ie here"
						skipped += 1
						continue
					
					circsAndProms = gcb.build16StateCircuit(finalPartsArray, includeAllCircuits=True, getPromsAndTerms=True)
					allCircs = circsAndProms['allCircuits']
					promoterParts = circsAndProms['partsWithPromotersInThem']
					terminatorParts = circsAndProms['partsWithTerminatorsInThem']

					numberOfSystemsMade += 1

					##When we build this, we are also going to pass it the vector that 
					##we are trying to match to. As we are building each state, we can do a
					##quick check that the number of genes being expressed is the same. If
					##for a single state, they are not the same, then we can exit out of
					##the function. This should save a decent amount of run time
					startLooking = time.time()
					expressionVector = gcb.getFullExpressionVectorForCircuit(allCircs, convertedDesignVector, promoterParts, terminatorParts)

					endLooking = time.time()
					timeSpendLookingAtCircuits += (endLooking - startLooking)
					##If there are not genes expressed in this entire system or there are unused promoters
					##then it is not a circuit we want to be displaying
					if expressionVector['genes'] == 0 or len(expressionVector['unusedPromoters']) != 0 or len(expressionVector['unusedTerminators']) != 0:
					# if expressionVector['genes'] == 0 or len(expressionVector['unusedPromoters']) != 0:
					#if expressionVector['genes'] == 0:
						if printMore:
							print "Try again it's here fool"
						skipped += 1
						continue

					#print "O: " + str(finalPartsArray)
					##If there are unused promoters, then we have found a circuit that we can reduce
					##by replacing the unused promoter with either just a gene, a blank or a 
					##terminator.
					# if len(expressionVector['unusedPromoters']) > 0:
					# 	atIndexCombos = []
					# 	keyOrder = []
					# 	for key in expressionVector['unusedPromoters']:
					# 		keyOrder.append((int(key)-1)/2)
					# 		combos = []
					# 		##Have to come up with a valid mapping for the reductions
					# 		partIndex = (int(key)-1)/2
					# 		partIdAtIndex = finalPartsArray[partIndex]
					# 		combos.append(partIdAtIndex)
					# 		reducedPart = REDUCTIONMAPPINGS[partIdAtIndex]
					# 		combos.append(reducedPart)
					# 		finalPartsArray[partIndex] = reducedPart
					# 		atIndexCombos.append(combos)

					# 	if str(finalPartsArray) in circuitsChecked:
					# 		##print 'Was in already checked'
					# 		continue

					# 	numberUnused = len(keyOrder)
					# 	if numberUnused > 1:
					# 		result_list = list(itertools.product(*atIndexCombos))
					# 		for comb in result_list:
					# 			tempArray = finalPartsArray[:]
					# 			for index in xrange(numberUnused):
					# 				tempArray[keyOrder[index]] = comb[index]
					# 				circuitsChecked[str(tempArray)] = True
					# 	else:
					# 		circuitsChecked[str(finalPartsArray)] = True

					##print "P: " + str(finalPartsArray)
					# if len(expressionVector['unusedPromoters']) > 0:
					# 	continue

					##Have to format expression vector from above
					asDesignVector = formatDesignVectorAsInput(expressionVector['designVector'], expressionVector['genes'])
					asFormattedInput = sg.formatInput(asDesignVector, expressionVector['genes'], True)
					if np.array_equal(asFormattedInput, formattedDesignVector):
						##To reduce circuits appropriately
						print finalPartsArray
						formattedRedundantPartsArray = {}
						for up in expressionVector['usedParts']:
							##Have to split the part into the appropriate components
							splitPart = up.split('.')
							partType = splitPart[0]
							partIndex = splitPart[1]
							subPartIndex = splitPart[2]
							if partIndex not in formattedRedundantPartsArray:
								formattedRedundantPartsArray[partIndex] = { 'P': {}, 'T': {}}
							formattedRedundantPartsArray[partIndex][partType][subPartIndex] = True

						for partI in formattedRedundantPartsArray:
							realPartIndex = (int(partI) - 1)/2
							partNumber = finalPartsArray[realPartIndex]
							subPartsUsed = formattedRedundantPartsArray[partI]
							changeToPart = gcb.reducePart(partNumber, subPartsUsed)
							finalPartsArray[realPartIndex] = changeToPart

						circuitsThatWork.append(finalPartsArray)
						##For redundant terminator testing
						# print finalPartsArray

					# tot = 0
					# for c in xrange(len(allCircs)):
					# 	if c+1 not in stateSet:
					# 		continue
					# 	designId = gcb.getNumberOfGenesExpressedForCircuit([allCircs[c]])
					# 	if designId != convertedDesignVector[c]:
					# 		break
					# 	else:
					# 		tot += 1
					# if tot == len(stateSet):
					# 	circuitsThatWork.append(finalPartsArray)
		if count % 250 == 0:
			print str(100.0*count/totalNumber) + "% Complete"

	#rankedCircuits = cr.rankCircuits(circuitsThatWork)
	# print timeSpentMakingCircuits
	# print timeSpendLookingAtCircuits
	# print quitEarly
	# print numberOfSystemsMade
	print len(circuitsThatWork)
	print "Skipped " + str(skipped)
	#print rankedCircuits
	#print len(rankedCircuits)
	#print count
	#print countValid
	db.session.close()
	print time.time() - starttime
	if len(circuitsThatWork) == 0:
		print 'No circuits found'
		return ['No circuits found']
	#print circuitsThatWork
	return circuitsThatWork
	##answer:
	## 	c1 = 5,3,5,5,5,5,1,5,5,5,3,5,5
	##	c6 = '5,5,-3,5,5,5,5,5,5'
	##	c7 = '5,3,5,5,5,-3,5,5,5'
	##  c10 = '5,3,5,-1,5,5,5,5,5'

##Sums up the total genes expressed on each row
def convertDesignVectorToSearchFormat(formattedDesignVector):
	##Have to do some converting so that we get the format that we want for the search
	##We need to convert states 6,7,2,5, and 11 to designIds
	resultingVector = []
	for row in formattedDesignVector:
		resultingVector.append(int(sum(row)))
	return resultingVector

##Formats the design vector returned from gcb.getFullExpressionVectorForCircuit to match
##the format that was inputted into the search
def formatDesignVectorAsInput(dv, totGenes):
	finalOutput = []
	for state in dv:
		numAdded = 0
		stateVector = []
		for g in state:
			stateVector.append(int(g))
			numAdded += 1
		while numAdded < totGenes:
			stateVector.append(0)
			numAdded += 1
		finalOutput.append(stateVector)
	return finalOutput

##Given a circuit and the position of unused parts in the system, it returns the non-redundant
##circuit and other versions of the cicruits that would also have 
def reduceCircuitAndReturnRedundants(circuit, positionOfUnusedParts):
	print "This function will determine the reduced circuit for based on the unuse parts"
	newCircuitArray = circuit[:]


unusedInCounts = {}
count = 0

###Orientation and position for each part in original array
positionsAll = [
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	[1, -3, -2, 4, 5, 6, 9, 10, 11, 12, 13],
	[1, 2, 5, 6, 7, 8, 9, -11, -10, 12, 13],
	[1, 2, 3, 4, 5, -7, -6, 8, 9, 10, 13],
	[1, -3, -4, 2, 5, 6, 9, -11, -10, 12, 13],
	[1, -3, -2, 4, 5, 6, 9, 10, 13],
	[1, 2, 5, 6, 9, -11, -10, 12, 13],
	[1, 2, 5, -7, -6, 8, 9, -11, -12, 10, 13],
	[1, -3, -2, 4, 5, -7, -8, 6, 9, 10, 13],
	[1, 2, 5, -7, -6, 8, 9, 10, 13],
	[1, -3, -4, 2, 5, 6, 9, -11, -12, 10, 13],
	[1, -3, -4, 2, 5, 6, 9, 10, 13],
	[1, 2, 5, 6, 9, -11, -12, 10, 13],
	[1, 2, 5, -7, -8, 6, 9, -11, -12, 10, 13],
	[1, -3, -4, 2, 5, -7, -8, 6, 9, 10, 13],
	[1, 2, 5, -7, -8, 6, 9, 10, 13]
]

PROMOTERPIECES = set([3,6, -3, 10])

numberOfStates = len(positionsAll)
positionsAtEachState = {}
for k in positionsAll[0]:
	positionsAtEachState[k] = [0]*numberOfStates

numberOfPoses = len(positionsAll[0])

for sn in xrange(numberOfStates):
	numElements = len(positionsAll[sn])
	for pI in xrange(numElements):
		value = positionsAll[sn][pI]
		oriPosNumber = abs(value)
		orientation = int(value/oriPosNumber)

		positionsAtEachState[oriPosNumber][sn] = (pI+1) * orientation

##Special case for the 1 gene system where unused promoters appear because the gene is always
##transcribed by the same promoter
def redundantPromoterNextToGeneTorF(partArray):
	if (partArray[1] in PROMOTERPIECES or partArray[1] == 4) and abs(partArray[2]) == 1:
		for pI in xrange(4, len(partArray)):
			if partArray[pI] in PROMOTERPIECES:
				##This promoter is unused
				return True
	return False

##Another rule to check
def redundantPromNextToOtherProm(partArray):
	# indices = [2, 6, 10]
	inSet = set([3,6,10])
	inverseSet = set([-3, 6, -10])
	terms = set([3,6,-3,4])

	##Easy check here
	# if partArray[0] == 10:
	# 	if partArray[1] in terms and partArray[2] in terms:
	# 		return True

	for i in xrange(len(partArray)):
		# print partArray[i]
		if i % 4 == 0:
			if partArray[i] in inSet:
				if partArray[i+1] in terms and partArray[i+2] in terms:
					return True
			elif partArray[i] in inverseSet:
				if partArray[i-1] in terms and partArray[i-3] in terms:
					return True
		elif i % 4 == 2:
			if partArray[i] in inSet:
				# print partArray[i-2]
				# print partArray[i+1]
				if partArray[i-2] in terms and partArray[i+1] in terms:
					return True
			else:
				continue
		else:
			continue
	return False


##Can use above to do a quick check on unused promoters that way we can avoid looking at too
##many constructs that have unused promoters. This will be for one gene for now but can be
##expanded later. These quick rule out rules will also be expanded later for 
##Will have to run some sort of time analysis on this however
def redundantPromoterTorF(partArray, promoterOriginalLocation, geneLocations, pOri, gOri, numberOfStates=16):
	terms = set([3,-3,4,6])
	##For now, only one gene
	# print promoterOriginalLocation
	# print geneLocations
	# print pOri
	# print gOri

	if len(geneLocations) > 1:
		return True

	##Might be unnecessary
	genePosAbs = abs(geneLocations[0])+1
	promPosAbs = abs(promoterOriginalLocation)+1

	geneOri = gOri
	promOri = pOri


	for sn in xrange(numberOfStates):
		##We compare the positions of the promoter and gene in each location and see if
		##it can be eliminated quickly or not
		currentPromLocation = positionsAtEachState[promPosAbs][sn] * promOri
		currentGeneLocation = positionsAtEachState[genePosAbs][sn] * geneOri

		# print currentPromLocation
		# print currentGeneLocation
		##If its a dual sided promoter, we should set the signs to be the same
		if partArray[promPosAbs-1] == 6:
			if currentPromLocation * currentGeneLocation <= 0:
					currentPromLocation *= -1
		##Four cases, P+G on top, P top, G bot, P bot, G top, P bot, G bot
		##If they are not on same side, then we can skip to next state
		##can check by checking sign (also if they add to 0, then one or both elements are
		##not present in this state, so we can also skip)
		if currentPromLocation * currentGeneLocation <= 0:
			# print 'Skipping here'
			continue
		elif currentPromLocation < currentGeneLocation:
			skipState = False
			for ind in xrange(currentPromLocation, currentGeneLocation):
				##if the indices are positive, then we are reading on the top
				##if negative, reading on the bottom
				realI = abs(ind)
				# print realI
				# ori = 1
				# if currentPromLocation < 0:
				# 	ori = -1
				# print positionsAll[sn]
				stateArrayV = abs(positionsAll[sn][realI])
				# print stateArrayV
				# print partArray[stateArrayV-1]
				##Can do absolute value of the part here because -3 and 3 both work
				if abs(partArray[stateArrayV-1]) in terms:
					# print 'We should be skipping'
					skipState = True
					break

			if skipState:
				# print 'skippedState'
				continue
			return False

	return True


def redundantPromoterOrUnusedGeneBetweenTermsTorF(partArray):
	genes = set([1,-1,-2,8])
	terms = set([4, 3, -3, 6])

	pPresent = False
	gPresent = False
	prevEnd = 0
	p = 0
	while p < len(partArray):
	# for p in xrange(len(partArray)):
		# print p
		if p % 4 == 0 and p > 0:
			# print 'The part: ' + str(partArray[p])
			if partArray[p] not in terms and p != (len(partArray)-1):
				##Move to the next section of interest (+3 because we always add 1 at the end)
				p += 3
				pPresent = False
				gPresent = False
			else:
				# print 'Prev end: ' + str(prevEnd)
				# print 'P present: ' + str(pPresent)
				# print 'G present: ' + str(gPresent)
				# print 'The diff: ' + str(p-prevEnd)
				if p - prevEnd == 4 or prevEnd == 8:
					if pPresent and not gPresent:
						return True
					elif not pPresent and gPresent:
						return True
				else:
					prevEnd = p
					pPresent = False
					gPresent = False
		else:
			if partArray[p] in PROMOTERPIECES:
				# print 'p present'
				pPresent = True
			elif partArray[p] in genes:
				# print 'g present'
				gPresent = True
		p += 1
	return False

