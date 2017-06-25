"""Creates a circuit for testing"""
import os, sys
##Add the top level path to this file
lib_path = os.path.abspath(os.path.join(''))
sys.path.insert(0, lib_path)

import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

import GeneticCircuitBuilder as gcb

from application import db

import copy
import time
import random


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

#[0, 1, 4, -6, -5, 7, 8, 9, 12]
#[0, 1, 4, -6, -7, 5, 8, 9, 12]
def convertFrom(stateNumber, circuit):
	if stateNumber == 6:
		return [circuit[0], circuit[1], -1*circuit[3], -1*circuit[2], circuit[4], circuit[5], circuit[6], circuit[7], circuit[8]]
	elif stateNumber == 7:
		return [circuit[0], circuit[1], circuit[2], circuit[3], circuit[4], circuit[5], -1*circuit[7],-1*circuit[6], circuit[8]]
	elif stateNumber == 10:
		return [circuit[0], circuit[1], circuit[2], circuit[3], -1*circuit[5], -1*circuit[4], circuit[6], circuit[7], circuit[8]]

def convertFromWithCircuits(stateNumber, circuit):
	if stateNumber == 6:
		return [circuit[0], circuit[1], part.Part(circuit[3].getId(), -1*circuit[3].getOrientation(), circuit[3].getPartLocation()), part.Part(circuit[2].getId(), -1*circuit[2].getOrientation(), circuit[2].getPartLocation()), circuit[4], circuit[5], circuit[6], circuit[7], circuit[8]]
	elif stateNumber == 7:
		return [circuit[0], circuit[1], circuit[2], circuit[3], circuit[4], circuit[5], part.Part(circuit[7].getId(), -1*circuit[7].getOrientation(), circuit[7].getPartLocation()), part.Part(circuit[6].getId(), -1*circuit[6].getOrientation(), circuit[6].getPartLocation()), circuit[8]]
	elif stateNumber == 10:
		return [circuit[0], circuit[1], circuit[2], circuit[3], part.Part(circuit[5].getId(), -1*circuit[5].getOrientation(), circuit[5].getPartLocation()), part.Part(circuit[4].getId(), -1*circuit[4].getOrientation(), circuit[4].getPartLocation()), circuit[6], circuit[7], circuit[8]]


#Going to do same as above but want the genes to 'remember' where they are from
def convertFromAsGeneticCircuits(stateNumber, gcElement):
	components = gcElement.getComponents()[:]
	##Flip components order and return newCircuit
	newComponents = convertFrom(stateNumber, components)
	return gc.GeneticCircuit(newComponents)

##circuitsDone = 100000
##circuitsDone in while = 200000

##Should add some sort of way for this function to realize that is has completed so it
##does enter duplicates into the database
def generateCircuitCreationQuery(start, stop):
	startTime = time.time()

	parts = [5,1,4,3,6,8,2,-1,-3,-2]

	##At the first position, parts 1, 4 Also, part 2
	##3 will affect the design in the same way, so all circuits that have part 2 at the beginning
	##have the same design as circuits with part 3 and all other parts being equal
	##Also, -1 = -2 =(results in the same thing) (-3 is the same as just a terminator on the top, whic
	##is useless)

	##For the other end, we observe the same thing, but flip piece 1 (the end also cannot move)
	#Having an 8 at postiion 1 is the same as having a -1 and having an 8 at position 13 is the
	#same as having a 1 (since these ones never flip)
	parts1 = [5,6,-1]
	parts13 = [5,6,1]


	numParts = len(parts)
	numParts1 = len(parts1)
	numParts13 = len(parts13)

	##sampleCircuitParts = [random.choice(parts) for i in xrange(13)]
	designsAndCounts = {}
	circuitsDone = start
	#circuitsDone = 10000

	##See how long it takes to get 100000 designs
	c6s = []
	c7s = []
	c10s = []
	values = ""
	loadingDots = ""
	while circuitsDone < stop:
		if (stop - circuitsDone) % 10000 == 0:
			loadingDots = loadingDots + ". "
			print loadingDots

		circuit = [
			parts1[circuitsDone%numParts1], 
			parts[circuitsDone/numParts1 % numParts],
			parts[circuitsDone/(numParts1*numParts**1) % numParts],
			parts[circuitsDone/(numParts1*numParts**2) % numParts],
			parts[circuitsDone/(numParts1*numParts**3) % numParts],
			parts[circuitsDone/(numParts1*numParts**4) % numParts],
			parts[circuitsDone/(numParts1*numParts**5) % numParts],
			parts[circuitsDone/(numParts1*numParts**6) % numParts],
			##Commenting out to test for the 9 part circuit
			# parts[circuitsDone/(numParts1*numParts**7) % numParts],
			# parts[circuitsDone/(numParts1*numParts**8) % numParts],
			# parts[circuitsDone/(numParts1*numParts**9) % numParts],
			# parts[circuitsDone/(numParts1*numParts**10) % numParts],
			parts13[circuitsDone/(numParts1*numParts**7*numParts13) % numParts13]
		]

		##Different factors that could be useful for ranking circuits and searching through a
		##smaller space
		numberOfGenes = 0
		numberOf5s = 0
		for ele in circuit:
			eleValue = abs(ele)
			if eleValue == 1 or eleValue == 2:
				numberOfGenes += 1
			elif eleValue == 5:
				numberOf5s += 1
			elif eleValue == 8:
				numberOfGenes += 2
		##Convert the circuit from 6 -> 12, 7 -> 13, 10 -> 16
		as12 = convertFrom(6, circuit)
		as13 = convertFrom(7, circuit)
		##as16 = convertFrom(10, circuit)


		##Insert redundancy checks here. We check if the circuit would be valid for each of the
		##states we are interested in (6,7,10). We return a binary string of the form '000' for
		##example where positions 0,1,2 correspond to whether the circuit is valid for states 
		##6, 7, 10 respectively
		##Ignoring this for now
		# if redundantCircuit(circuit):
		# 	##Skip this circuit
		# 	#print "Skipping circuit: " + str(circuit)
		# 	circuitsDone += 1
		# 	continue

		#buildCircuitsStart = time.time()
		c1 = gcb.buildOneCircuit(circuit)

		##Should use the convertFromAsGeneticCircuit function to retain where the parts are from
		##Doing this does not save much run time as the bulk of the searches work is on recontruction
		##Rather than locating circuits right now
		#c2 = [convertFromAsGeneticCircuits(6, c1[0])]
		#c3 = [convertFromAsGeneticCircuits(7, c1[0])]

		#designIds = gcb.getGenesExpressedState(c1[0], {12: c2[0], 13: c3[0]})

		c2 = gcb.buildOneCircuit(as12)
		c3 = gcb.buildOneCircuit(as13)
		#c4 = gcb.buildOneCircuit(as16)
		#buildCircuitsEnd = time.time()
		#print c1[0].printCircuit(excludeRecombinationSites=True)
		circuitsDone += 1
		#buildexpressionStart = time.time()
		#designId = designIds['ori']
		#designId2 = designIds[12]
		#designId3 = designIds[13]
		designId = gcb.getNumberOfGenesExpressedForCircuit(c1)
		designId2 = gcb.getNumberOfGenesExpressedForCircuit(c2)
		designId3 = gcb.getNumberOfGenesExpressedForCircuit(c3)
		#designId4 = gcb.getNumberOfGenesExpressedForCircuit(c4)
		#buildExpressionEnd = time.time()

		# toPrint = None
		# print "New 16 state starts below"
		# for cI in xrange(len(test)):
		# 	c = test[cI]
		# 	if cI == 0:
		# 		print c.printCircuit(True)

		# 	if cI == 5:
		# 		c6s.append(c.printCircuit(True))
		# 	elif cI == 6:
		# 		c7s.append(c.printCircuit(True))
		# 	elif cI == 9:
		# 		c10s.append(c.printCircuit(True))
		# totTime = buildExpressionEnd - buildCircuitsStart
		# print "Tot time per circuit: " + str(totTime)
		# print "Raw build time per circuit: " + str(buildCircuitsEnd - buildCircuitsStart)
		# print "Build time: " + str(100.0*(buildCircuitsEnd - buildCircuitsStart)/totTime)
		# print "Raw expression build time per circuit: " + str(buildExpressionEnd - buildexpressionStart)
		# print "Expression build time: " + str(100.0*(buildExpressionEnd - buildexpressionStart)/totTime)
		#printedCircuit = str(c1[0].printCircuit())[1:-1].replace(' ', '')
		partsString = ""
		for ele in c1[0].printCircuit():
			partsString = partsString+str(ele)+","
		partsString = partsString[:-1]
		##Without c10
		fullLine = "("+str(designId)+","+str(designId2)+","+str(designId3)+","+str(numberOfGenes)+","+str(numberOf5s)+","+partsString+"),"
		#fullLine = "('"+printedCircuit+"',"+str(designId)+","+str(designId2)+","+str(designId3)+","+str(designId4)+","+partsString+"),"
		values  = values + fullLine

		#if (designId, designId2, designId3, designId4) in designsAndCounts:
		#	designsAndCounts[(designId, designId2, designId3, designId4)] += 1
		#else:
		#	designsAndCounts[(designId, designId2, designId3, designId4)] = 1

	toPrint = "insert into grfsmdb.circuits_with_additions (genesexpressed, genesexpressed12, genesexpressed13, numberOfGenes, numberOf5s, p1, p2, p3, p4, p5, p6, p7, p8, p9) values " + values
	#toPrint = "insert into test.circuit_test (parts, genesexpressed, genesexpressed12, genesexpressed13, genesexpressed16, p1, p2, p3, p4, p5, p6, p7, p8, p9) values " + values
	return toPrint[:-1] + "; commit;"
#print time.time() - startTime
#print designsAndCounts
startingTime = time.time()
inputtedAmount = "select count(*) as amount from grfsmdb.circuits_with_additions;"
totalAmountQ = db.engine.execute(inputtedAmount)
previousEnd = None
for q in totalAmountQ:
	previousEnd = int(q.amount)

rangeLimit = 20
interval = 50000
for i in xrange(rangeLimit):
	newEnd = previousEnd + interval
	insertQuery = generateCircuitCreationQuery(previousEnd, newEnd)
	results = db.engine.execute(insertQuery)
	previousEnd = newEnd
	print str((i+1)*100.0/rangeLimit) + "% of Insertions Completed"


print "Update last point to: " + str(previousEnd)
db.session.close()
print "Time taken to insert " + str(rangeLimit*interval) +": " + str(time.time() - startingTime) + " seconds"



