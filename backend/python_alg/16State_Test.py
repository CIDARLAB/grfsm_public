"""Creates a circuit for testing"""
import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

import GeneticCircuitBuilder as gcb

import copy
import time

allParts = part.PARTS

customParts = []
for ele in allParts:
	toAdd = None
	numberOfGenes = 0
	if len(ele.keys()) > 0:
		for tOb in ele['SEQUENCE']:
			for v in ele['SEQUENCE'][tOb]:
				if v == 'G':
					numberOfGenes += 1
		toAdd = ele
	else:
		toAdd = {'ID': 0}

	toAdd['numberOfGenes'] = numberOfGenes
	if toAdd['ID'] in [3,5,10]:
		customParts.append(toAdd)

###Very custom parts

##Valid ids are numbers from 1-25
##Going to build a tree. Root is the empty array  and the length of a branch is how many genes
##it regulates. So we want to look at only the elements that have length 4
class Node:
	def __init__(self, id, value, parent):
		self.id = id
		self.parent = parent
		self.value = value

	def getValue(self):
		return self.value

	def getId(self):
		return self.id

	def getParent(self):
		return self.parent

	def getChildren(self):
		if self.value >= 4:
			return []
		else:
			##Need to compute the children. Can only be a child if the value of the node created is
			##0 or less (and also may want to factor in how long this chain is, as a chain of 13 
			##is the max that is tolerated)
			currentValue = self.getValue()
			children = []
			for possibleChild in customParts:
				newValue = currentValue + possibleChild['numberOfGenes']
				if newValue <= 4:
					children.append(Node(possibleChild['ID'], newValue, self))
		return children

	def getPath(self):
		path = []
		currentNode = self
		while currentNode is not None:
			path.append(currentNode.id)
			currentNode = currentNode.getParent()
		return path

def getValidCircuits():
	validCircuits = []

	root = Node(0, 0, None)
	level = 0
	nodesInLevel = [root]
	while level < 13:
		nextLevelNodes = []
		for node in nodesInLevel:
			children = node.getChildren()
			for n in children:
				if n.getValue() == 4:
					validCircuits.append(n.getPath())
			nextLevelNodes = nextLevelNodes + children

		nodesInLevel = nextLevelNodes
		level += 1
	return validCircuits

##Far too time consuming to do it the way above
startTime = time.time()
#print len(getValidCircuits())
print time.time() - startTime

# vCircs = getValidCircuits()
# for circ in vCircs:
# 	while len(circ) < 13:
# 		circ.append(5)
	##Build a circuit with the list of parts
	##Start from root and look at all the nodes!

##Create the enzymes
##TP901 sites: F,O (blue)
##BxbI sites: X, I (orange arrow)
##A118 sites: A, B (purple)
enzyme2 = enz.Enzyme('TP901')
enzyme2.addSiteToRecognize('F')
enzyme2.addSiteToRecognize('O')
enzyme1 = enz.Enzyme('BxbI')
enzyme1.addSiteToRecognize('X')
enzyme1.addSiteToRecognize('I')
enzyme3 = enz.Enzyme('A118')
enzyme3.addSiteToRecognize('A')
enzyme3.addSiteToRecognize('B')

testParts = [i for i in xrange(13)]

# c1 = gcb.build16StateCircuit(testParts)
# c2 = enz.induceCircuit(enzyme1, c1)
# c3 = enz.induceCircuit(enzyme2, c1)
# c4 = enz.induceCircuit(enzyme3, c1)
# c5 = enz.induceCircuit(enzyme2, c2)
# c6 = enz.induceCircuit(enzyme3, c2)
# c7 = enz.induceCircuit(enzyme1, c3)
# c8 = enz.induceCircuit(enzyme3, c3)
# c9 = enz.induceCircuit(enzyme1, c4)
# c10 = enz.induceCircuit(enzyme2, c4)
# c11 = enz.induceCircuit(enzyme3, c5)
# c12 = enz.induceCircuit(enzyme2, c6)
# c13 = enz.induceCircuit(enzyme3, c7)
# c14 = enz.induceCircuit(enzyme1, c8)
# c15 = enz.induceCircuit(enzyme2, c9)
# c16 = enz.induceCircuit(enzyme1, c10)

# allCs = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16]
allCs = gcb.build16StateCircuit(testParts, True)
elementExpression = [[],[],[],[],[],[],[],[],[],[],[],[],[]]
#print elementExpression
for i in xrange(len(allCs)):
	##Print the state expression of the current circuit
	currentCircuit = allCs[i].printCircuit(excludeRecombinationSites=True)
	print "S" + str(i+1) + ": " + str((currentCircuit[:]))

	##For each, see what it's expression profile is in each state
	for j in xrange(13):
		if j in currentCircuit:
			elementExpression[j].append('1')
		elif int(-1 * j) in currentCircuit:
			elementExpression[j].append('2')
		else:
			elementExpression[j].append('0')
	

# print len(elementExpression)
# print len(elementExpression[0])

for i in xrange(len(elementExpression)):
# 	if i in [2,3,7,10]:
# 	#	if elementExpression[i][7] != elementExpression[i][13]:
 	# print i
	print elementExpression[i]

# for i in xrange(16):
# 	print elementExpression[10][i]






