"""Creates a circuit for testing"""
import os, sys, inspect
# realpath() will make your script run, even if you symlink it :)
import numpy as np
import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

import GeneticCircuitBuilder as gcb

import copy
import time
import random

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

def formatInput(inputGRFSM, maxGenesRegulated=14):
        updatedInputGRFSM = []
        numberOfStates = len(inputGRFSM)

        numberOfGenes = len(inputGRFSM[0])
            
        ##Custom comparator function to correctly sort the columns in the array
        ##Takes two indices and returns the one that is larger
        def compareTwoIndicies(left, right):
            rowToCompare = 0
            leftValue = inputGRFSM[0][left]
            rightValue = inputGRFSM[0][right]


            while leftValue == rightValue and rowToCompare < numberOfStates:
            	leftValue = inputGRFSM[rowToCompare][left]
            	rightValue = inputGRFSM[rowToCompare][right]
            	rowToCompare += 1

            return leftValue - rightValue


        newlyFormattedInput = np.array(inputGRFSM)
        geneIndices = sorted(range(numberOfGenes), cmp=lambda x,y: compareTwoIndicies(x,y))

        finalInputArray = np.zeros(numberOfStates)
        ##Now have to buld up the array with the new indicies
        for index in geneIndices:
        	finalInputArray = np.c_[finalInputArray, newlyFormattedInput[:,index]]
        finalInputArray = np.delete(finalInputArray, 0, 1)

        while np.shape(finalInputArray)[1] < maxGenesRegulated:
        	finalInputArray = np.c_[np.zeros(numberOfStates), finalInputArray]

        return finalInputArray 


circuitParts = [5,3,5,1,5,5,1,5,5,5,3,1,5]
circuits = gcb.build16StateCircuit(circuitParts)
result = gcb.getFullExpressionVectorForCircuit(circuits)
print result['designVector']
fI = formatDesignVectorAsInput(result['designVector'], result['genes'])
print formatInput(fI, result['genes'])