from application import db
from application.models import grfsmArray, circuitArray

from backend.db_functions.searchGRFSM import *
from backend.db_functions.circuitRank import *
from backend.python_alg.GeneticCircuitBuilder import build5StateCircuit, buildDesignVectorFromCircuitParts

import numpy as np

import sys

import time

def calculatedGenesRegulated(designVector):
	genesRegulated = 0

	numberOfColumns = 14
	includedColumns = {}
	for i in xrange(len(designVector)):
		ele = str(designVector)[i]
		if ele == '1':
			##Find out which column
			col = int(i) % 14
			##Increase genes regulated number only if this is the first 1 in the column
			if col not in includedColumns:
				includedColumns[col] = True
				genesRegulated += 1

	return genesRegulated

##Build the grfsm array dictionary to look into
coST = time.time()
grfsmArrayObjects = db.session.query(grfsmArray).all()
grfsmArrayMapping = {}
for gao in grfsmArrayObjects:
	grfsmArrayMapping[gao.id] = gao.design_vector
print 'Finished making the grfsm array objects dictionary' + '. It took ' + str(time.time()-coST) + 's'

##For all thegrfsms, calculate how many genes are being regulated by that system. To do so:
##	Check each column and see if there is at least one 1.
##	Number of columns that have at least one '1' is the number of genes being regulated
coST = time.time()
genesRegulatedNumbers = {}
for gg in grfsmArrayMapping:
	numberOfGenesRegulated = calculatedGenesRegulated(grfsmArrayMapping[gg])
	if numberOfGenesRegulated not in genesRegulatedNumbers:
		genesRegulatedNumbers[numberOfGenesRegulated] = 1
	else:
		genesRegulatedNumbers[numberOfGenesRegulated] += 1
print 'Finished making the grfsm array objects dictionary' + '. It took ' + str(time.time()-coST) + 's'	

for key in genesRegulatedNumbers:
	print 'Designs regulating ' + str(key) + ' genes: ' + str(genesRegulatedNumbers[key])

db.session.close()


