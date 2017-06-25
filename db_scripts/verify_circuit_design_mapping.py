from application import db
from application.models import grfsmArray, circuitArray

from backend.db_functions.searchGRFSM import *
from backend.db_functions.circuitRank import *
from backend.python_alg.GeneticCircuitBuilder import build5StateCircuit, buildDesignVectorFromCircuitParts

import numpy as np

import sys

import time

print 'Running the script...'
startTime = time.time()

numberOfStates = 5

##Get the circuit parts. Could create circuits from scratch but want to validate that the mapping is good
coST = time.time()
circuitObjects = db.session.query(circuitArray).filter(circuitArray.id < maxId).filter(circuitArray.id > minId).all()
print 'Got all the circuit objects. There are: ' + str(len(circuitObjects)) + '. It took ' + str(time.time()-coST) + 's'

##Build the grfsm array dictionary to look into
coST = time.time()
grfsmArrayObjects = db.session.query(grfsmArray).all()
grfsmArrayMapping = {}
for gao in grfsmArrayObjects:
	grfsmArrayMapping[gao.id] = gao.design_vector
print 'Finished making the grfsm array objects dictionary' + '. It took ' + str(time.time()-coST) + 's'

gcbCircuits = []

##Build the circuit object
coST = time.time()
for co in circuitObjects:
	##Have to convert parts string to an array
	partsString = co.parts
	splitParts = partsString.split(',')
	##New to turn this into an array of parts
	integerPartIds = [int(ele) for ele in splitParts]
	gcbCircuits.append((co.id, build5StateCircuit(integerPartIds), co.grfsm_array_id))
print 'Finished building the circuit objects' + '. It took ' + str(time.time()-coST) + 's'

##For each state determine the expression
coST = time.time()
circuits2designs = {}
countNumberFailed = 0
for ele in gcbCircuits:
	gid = ele[0]
	g = ele[1]
	grfsmId = ele[2]
	design = buildDesignVectorFromCircuitParts(g)
	circuits2designs[gid] = design

	##Compare the designs
	designInDB = grfsmArrayMapping[grfsmId]

	if designInDB != design:
		print('Circuit ' + str(gid) + ' does not match its design ' + str(grfsmId))
		countNumberFailed += 1
print 'Comparison took ' + str(time.time()-coST) + 's'
db.session.close()

endTime = time.time()

print 'Number failed: ' + str(countNumberFailed)
print (endTime - startTime)








