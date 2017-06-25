"""Reconstruct 3 input, 16 state circuit from some of its states"""
import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

import GeneticCircuitBuilder as gcb

import copy
import time
import random

c6s = [[6, -1, -1, 1, 1, 1, 1, 1, 1], [8, -1, -1, 1, 1, 1, 1, 1, 1], [-1, -1, -1, 1, 1, 1, 1, 1, 1], [6, -1, -4, 1, 1, 1, 1, 1, 1], [8, -1, -4, 1, 1, 1, 1, 1, 1], [-1, -1, -4, 1, 1, 1, 1, 1, 1], [6, -1, -3, 1, 1, 1, 1, 1, 1], [8, -1, -3, 1, 1, 1, 1, 1, 1], [-1, -1, -3, 1, 1, 1, 1, 1, 1], [6, -1, -5, 1, 1, 1, 1, 1, 1]]
c7s = [[6, 1, 1, 1, 1, -1, -1, 1, 1], [8, 1, 1, 1, 1, -1, -1, 1, 1], [-1, 1, 1, 1, 1, -1, -1, 1, 1], [6, 4, 1, 1, 1, -1, -1, 1, 1], [8, 4, 1, 1, 1, -1, -1, 1, 1], [-1, 4, 1, 1, 1, -1, -1, 1, 1], [6, 3, 1, 1, 1, -1, -1, 1, 1], [8, 3, 1, 1, 1, -1, -1, 1, 1], [-1, 3, 1, 1, 1, -1, -1, 1, 1], [6, 5, 1, 1, 1, -1, -1, 1, 1]]
c10s = [[6, 1, 1, -1, -1, 1, 1, 1, 1], [8, 1, 1, -1, -1, 1, 1, 1, 1], [-1, 1, 1, -1, -1, 1, 1, 1, 1], [6, 4, 1, -1, -1, 1, 1, 1, 1], [8, 4, 1, -1, -1, 1, 1, 1, 1], [-1, 4, 1, -1, -1, 1, 1, 1, 1], [6, 3, 1, -1, -1, 1, 1, 1, 1], [8, 3, 1, -1, -1, 1, 1, 1, 1], [-1, 3, 1, -1, -1, 1, 1, 1, 1], [6, 5, 1, -1, -1, 1, 1, 1, 1]]

def pseudoSearch(designVector):
	##Have to get all the circuits that could work
	##Then have to convert them to their originals (or could convert to something else)

	##Could reconstruct certain other states from just 6 and 7 for example and then search through
	##those and only pick the ones that are valid from there
	print "Test"


def convert(sn, array):
	##Split by commas
	#aL = array.split(',')

	aL = array[:]
	finalArray = ['_','_','_','_','_','_','_','_','_','_','_','_','_']
	if sn == 6:
		finalArray = [aL[0], -1*int(aL[2]), -1*int(aL[1]), aL[3], aL[4], aL[5],'_', '_', aL[6], aL[7], '_', '_', aL[8]]
	elif sn == 7:
		finalArray = [aL[0], aL[1], '_', '_', aL[2], aL[3], '_', '_', aL[4], -1*int(aL[6]), -1*int(aL[5]), aL[7], aL[8]]
	elif sn == 10:
		finalArray = [aL[0], aL[1], '_', '_', aL[2], -1*int(aL[4]), -1*int(aL[3]), aL[5], aL[6], aL[7], '_', '_', aL[8]]
	elif sn == 12:
		finalArray = [aL[0], aL[3], -1*int(aL[1]), -1*int(aL[2]), aL[4], aL[5], '_', '_', aL[6], aL[7], '_', '_', aL[8]]
	elif sn == 13:
		finalArray = [aL[0], aL[1], '_', '_', aL[2], aL[3], '_', '_', aL[4], aL[7], -1*int(aL[5]), -1*int(aL[6]), aL[8]]
	elif sn == 16:
		finalArray = [aL[0], aL[1], '_', '_', aL[2], aL[5], -1*int(aL[3]), -1*int(aL[4]), aL[6], aL[7], '_', '_', aL[8]]

	return finalArray	


##Given a state 6 and 7 circuit, we can reconstruct (fully) states 2, 5, 11
##So we can do the following for a search:
##If the returned states 6 and 7 are compatible, construct  states 2, 5, 11 from them and get their
##their designs values. If they match what the user is searching for, then we reconstruct the
##Whole circuit (or can compare state 10 or something)
##genesExpressedByState: a length 16 array that has the number of genes expressed in each state
def reconstructFrom67Only(s6, s7, genesExpressedByState):
	validCircuits = []
	for c in s6:
		for d in s7:
			converted = [converted(6,c), converted(7, d)]
			if compare(6, converted[0], 7, converted[1]):
				##Now build circuits 2, 5, 11 from them and test to see if they
				##Have good designs
				circuits2511 = construct2511From67(converted[0][0:8]+converted[1][8:])
				##For each circuit, determine its design id and see if that matches what the
				##desired design is. If all three match, then we construct the final circuit
				##(either using the parts from state10 or some other way) (could repeat this)
				##For the other state combinations as well and then we would have checked
				##through all the states and should be able to confirm the correct circuits
				statesChecked = 0
				for key in circuits2511:
					partsArray = circuits2511[key]
					circ = gcb.buildOneCircuit(partsArray)
					designId = gcb.getNumberOfGenesExpressedForCircuit(circ)
					if designId == genesExpressedByState[key-1]:
						statesChecked += 1
						##If we have checked all of the states and it has passed, then it is a
						##valid circuit
						if statesChecked == 3:
							validCircuits.append(converted[0][0:8]+converted[1][8:])
							break
					else:
						break
	
	return validCircuits

def construct2511From67(circ):
	return {
		#[0, -2, -1, 3, 4, 5, 8, 9, 10, 11, 12]
		2: [circ[0], -1*circ[2], -1*circ[1], circ[3], circ[4], circ[5], circ[8], circ[9], circ[10], circ[11], circ[12]],
		#[0, -2, -3, 1, 4, 5, 8, -10, -9, 11, 12]
		5: [circ[0], -1*circ[2], -1*circ[3], circ[1], circ[4], circ[5], circ[8], -1*circ[10], -1*circ[9], circ[11], circ[12]],
		#[0, -2, -3, 1, 4, 5, 8, -10, -11, 9, 12]
		11: [circ[0], -1*circ[2], -1*circ[3], circ[1], circ[4], circ[5], circ[8], -1*circ[10], -1*circ[11], circ[9], circ[12]]
	}


def redundantCircuit(circuit):
	##There are certain configurations in the original circuit that are not valid and so the
	##subsequent circuits that this leads to should also not be included in the overall database

	##A circuit that has a part sequence of 4 _ 4 where the part in the middle is not 5 is
	##redundant, since any part in the middle essentially acts as a 5
	for i in xrange(len(circuit)):
		index1 = i
		index2 = i+2
		if circuit[index1] == 4 and circuit[index2] == 4 and circuit[index1+1] != 5:
			##We should be skipping this circuit and not saving it in the database
			return True
	return False


def reconstructFull(s6, s7, s10, s12=[], s13=[], s16=[]):
	##Each s# argument is a list of 9 parts that matched the design for that state
	##Each state has its own conversion that has to happen to turn from the left to right below

	##Should be a string in this format: 8,9,1,4,4,5,-2,3,5 that can be split by commas

	##From each state we get the following info about the positioning
	##
	##13 component array of parts = []
	##
	##S6:  [0, -2, -1, 3, 4, 5, 8, 9, 12] ->    [0, 1, 2, 3, 4, 5, _, _, 8, 9, __, __, 12]
	##S7:  [0, 1, 4, 5, 8, -10, -9, 11, 12] ->  [0, 1, _, _, 4, 5, _, _, 8, 9, 10, 11, 12]
	##S10: [0, 1, 4, -6, -5, 7, 8, 9, 12] ->    [0, 1, _, _, 4, 5, 6, 7, 8, 9, __, __, 12]
	##S12: [0, -2, -3, 1, 4, 5, 8, 9, 12] ->    [0, 1, 2, 3, 4, 5, _, _, 8, 9, __, __, 12]
	##S13: [0, 1, 4, 5, 8, -10, -11, 9, 12] ->  [0, 1, _, _, 4, 5, _, _, 8, 9, 10, 11, 12]
	##S16: [0, 1, 4, -6, -7, 5, 8, 9, 12] ->    [0, 1, _, _, 4, 5, 6, 7, 8, 9, __, __, 12]

	##Each state will return a list of parts like on the right above
	##We will only convert 3 of the states (6,7,10)
	for c in s6:
		for d in s7:
			for e in s10:
				converted = [convert(6, c), convert(7, d), convert(10, e)]
				##Have to compare all three circuits to one another
				if compare(6, converted[0], 7, converted[1]):
					if compare(6, converted[0], 10, converted[2]):
						if compare(7, converted[1], 10, converted[2]):
							print "All three parts match, can test circuit"
							finalCircuit = converted[0][0:6]+converted[2][6:8]+converted[1][8:13]
							print finalCircuit
	

##Sn1 = state number 1, s1 = the converted array (with '_'), same goes for sn2/s2
def compare(sn1, s1, sn2, s2):
	substrings = {
		6: {
			2: True,
		},
		7: {
			10: True,
		},
		10: {
			6: True,
		},
		12: {
			2: True,
		},
		13: {
			10: True,
		},
		16: {
			6: True,
		}
	}
	##We only need to iterate through one dictionary
	##This is the actuall comparison
	if s1[0:2] != s2[0:2]:
		# print "False 0"
		# print (sn1, sn2)
		# print (s1[0:2], s2[0:2])
		return False
	if s1[4:6] != s2[4:6]:
		# print "False 4"
		# print (sn1, sn2)
		# print (s1[4:6], s2[4:6])
		return False
	if s1[8:10] != s2[8:10]:
		# print "False 8"
		# print (sn1, sn2)
		# print (s1[8:10], s2[8:10])
		return False
	if s1[12] != s2[12]:
		# print "False 12"
		# print (sn1, sn2)
		# print (s1[12], s2[12])
		return False

	for key in substrings[sn1]:
		if key in substrings[sn2]:
			if s1[key:key+2] != s2 [key: key+2]:
				return False
	return True


tests = [
	'0,-2,-1,3,4,5,8,9,12', 
	'0,1,4,5,8,-10,-9,11,12', 
	'0,1,4,-6,-5,7,8,9,12',
	'0,-2,-3,1,4,5,8,9,12',
	'0,1,4,5,8,-10,-11,9,12',
	'0,1,4,-6,-7,5,8,9,12'
	]
testStates = [6,7,10,12,13,16]
whatItShouldBe = []

# for i in xrange(len(tests)):
# 	print convert(testStates[i], tests[i])

# print compare(testStates[0], convert(testStates[0], tests[0]), testStates[1], convert(testStates[1], tests[1]))
print reconstructFull(c6s, c7s, c10s)




