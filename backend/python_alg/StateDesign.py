"""
StateDesign.py

describes a design for a statemachine
"""
class StateDesign(object):
	def __init__(self, numberOfStates, numberOfGenes):
		self.numberOfStates = numberOfStates
		self.states = []
		self.numberOfGenes = numberOfGenes

	def addState(self, expressionOfGenes):
		##TODO:
		##Have to make sure that the expressionOfGenes array is of the same size
		##as the number of genes this state machine is regulating
		self.states.append(expressionOfGenes)

	def getStateExpressionVector(self, stateNumber):
		return self.states[stateNumber][:]

	def getAllStates(self):
		return self.states[:]