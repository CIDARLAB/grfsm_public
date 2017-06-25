"""
GeneticCircuit.py

a collection of Part and RecognitionSite elements in an array
"""
import Part as part
import RecognitionSite as rs

class GeneticCircuit(object):
	def __init__(self, components):
		self.components = components

	def addComponent(self,component):
		self.components.append(component)
		##If the component being added is a part, then we want to update the part
		##so that it holds the information to its location in the circuit, which will
		##be useful when determining where to place genes to get desired behavior
		##if isinstance(component, part.Part):
		if component.getPartLocation() is None:
			component.setPartLocation(len(self.components))
		return component

	def getComponents(self):
		return self.components[:]

	def getComponentOriginalMapping(self):
		csInCircuit = self.getComponents()
		mappingInCircuit = []
		for comp in csInCircuit:
			#if isinstance(comp, part.Part):
			mappingInCircuit.append(comp.getPartLocation())

		return mappingInCircuit

	def printCircuit(self, excludeRecombinationSites=False):
		output = []
		for element in self.components[:]:
			if excludeRecombinationSites and isinstance(element, rs.RecognitionSite):
				continue
			else:	
				output.append(element.printMe())
		return output

	##Runs through the genetic circuit and returns an array of the elements, in one array
	##that have a positive orientation and in another, the one that have a negative 
	##orientation. Positive can be seen as the 'top' and it read left to right, while
	##negative is the 'bottom' and is read right to left
	##Arguments:
	##	none
	##Returns:
	##	an hash with the keys positive and negative
	def readCircuit(self):
		positiveParts = []
		negativeParts = []
		components = self.getComponents()
		for component in components:
			##Only care about parts, and not recognition sites
			if isinstance(component, part.Part):
				##if its orientation is (+), add it to the positive parts with an append,
				##since being read from left to right
				if component.getOrientation() > 0:
					positiveParts.append(component)
				else:
					##The part is (-) so we add it to the front of the array rather than
					##append (we could also use a list reverse but...)
					negativeParts.insert(0, component)
		return {
			'positive': positiveParts,
			'negative': negativeParts
		}

	##Same as readCircuit but prints the part Ids
	def readCircuitAndGetPartIds(self):
		circuitReadthrough = self.readCircuit()

		positiveOrderedIds = []
		negativeOrderedIds = []
		for p in circuitReadthrough['positive']:
			positiveOrderedIds.append(p.printMe())
		for p in circuitReadthrough['negative']:
			negativeOrderedIds.append(p.printMe())
		return {
			'positive': positiveOrderedIds,
			'negative': negativeOrderedIds
		}

	##Goes through the top and bottom of the circuit and determines which
	##genes are expressed
	def printAllParts(self, withLocations=False):
		components = self.getComponents()

		topOutput = []
		bottomOutput = []
		for component in components:
			##Only care about parts
			if isinstance(component, part.Part):
				ori = component.getOrientation()
				if ori > 0:
					##The part is not flipped, so we add its top sequence normally
					##And read the bottom in reverse
					if withLocations:
						topOutput += component.printSpecificExpression()['TOP']
						bottomExp = component.printSpecificExpression()['BOTTOM']
					else:
						topOutput += component.printExpression('TOP')
						bottomExp = component.printExpression('BOTTOM')
					bottomExp.reverse()
					bottomOutput += bottomExp
				else:
					##Same as above but flip the logic
					if withLocations:
						topExp = component.printSpecificExpression()['TOP']
					else:
						topExp = component.printExpression('TOP')
					topExp.reverse()
					bottomOutput += topExp
					if withLocations:
						topOutput += component.printSpecificExpression()['BOTTOM']
					else:
						topOutput += component.printExpression('BOTTOM')
                ##Have to reverse the bottom array
		bottomOutput.reverse()
		return {
			'TOP': topOutput,
			'BOTTOM': bottomOutput
		}

	##Same as above but prints not just 'G' but the code name for that gene
	def printAllPartsWithGeneNames(self):
		components = self.getComponents()

		topOutput = []
		bottomOutput = []
		for component in components:
			##Only care about parts
			if isinstance(component, part.Part):
				ori = component.getOrientation()
				speExpr = component.printSpecificExpression()
				if ori > 0:
					##The part is not flipped, so we add its top sequence normally
					##And read the bottom in reverse
					topOutput += speExpr['TOP']
					bottomExp = speExpr['BOTTOM']
					bottomExp.reverse()
					bottomOutput += bottomExp
				else:
					##Same as above but flip the logic
					topExp = speExpr['TOP']
					topExp.reverse()
					bottomOutput += topExp
					topOutput += speExpr['BOTTOM']
                ##Have to reverse the bottom array
		bottomOutput.reverse()
		return {
			'TOP': topOutput,
			'BOTTOM': bottomOutput,
		}

	##Prints only the genes that are expressed. It also print which promoters where used 
	##in the design, because we are going to use this to eliminate circuits that have parts
	##that are not used (redundant circuits). If a promoter is used on a certain part, then 
	##we will add it to the array of usedPromoters
	def printOnlyExpressed(self, returnOnlyExpressedGenes=True, printExtra=False, topStart=0, bottomStart=0):
		expressions = self.printAllPartsWithGeneNames()

		##State stores whether we are currently 'reading' or not
		##When it passes a promoter it gets set to 1, when it sees a terminator
		##sequnce is gets set to 0
		state = topStart
		##currentPromoterPartIndex stores which is the most recent promoter that has set
		##the state to transcription, while the part currentPromoterPartNumber is which
		##promoter on the part specfically. To be used to determine reductions to simpler
		##systems
		currentPromoterPartIndex = -1
		currentPromoterPartPromoterNumber = -1
		expressedGenes = []


		##Below, the expressed genes array when we remove certain terminators
		##The keys are the terminators we remove and the value is the array of expressed
		##genes when that terminator is removed. The key is a little more complex. It will
		##be the position of the term and point to the specific term of that part. So far example
		##part 4 has two terminators, one on each side. If the top one is labelled 1 and the
		##bottom one is labelled 2, then the array will look like this (let's say this part is
		##originally at location 7:
		##{
		##	7: {
		##		1: [G.3.1],
		##		2: [G.4.1, G.5.1]
		##	}
		##}
		expressedGenesWithRemovedTerms = {}
		##We have to store the state separately for when we are pretending a terminator
		##not present. Stored where the key is the terminator being removed and the value
		##is the value of the state for this terminator being removed
		stateByTerm = {}

		##Labelled partial because this calls a promoter part expressed if any of the promoters
		##on the part are being used. We want to be able to reduce circuits, so we will need to
		##know specifically which promoter is not being used to determine which part to replace
		##it with
		expressedPromoters = []
		expressedPromotersPartial = []

		###There's an error with these because it's not picking up when certain terms are being
		##expressed
		expressedTerminators = []
		expressedTerminatorsFull = []

		##TODO: this needs to also look at the bottom of the circuit. 
		##Done.

		##A terminator is defined as redundant if we remove it from the circuit and the
		##expressed genes are no affected. To test for this, everytime we come upon a terminator
		##we will have two separate expressed genes arrays that we add to (one without and one
		##with said terminator). Once we have looked through the entire register, we will 
		##compare these designs and if the genes expressed are the same, then we have a 'useless'
		##terminator
		##What this means 
		topStateChanged = False
		bottomStateChanged = False

		for element in expressions['TOP']:
			if element[0] == 'P':
				state = 1
				topStateChanged = True
				splitPromValues = element.split('.')
				currentPromoterPartIndex = int(splitPromValues[1])
				currentPromoterPartPromoterNumber = splitPromValues[2]

				##Want to iterate through all the removed terminator states and update
				##the state to one for them as well (uncomment once the arrays have been set
				##up properly)
				for partNumber in stateByTerm:
					for term in stateByTerm[partNumber]:
						stateByTerm[partNumber][term] = 1

			elif element[0] == 'G':
				if state == 1:
					expressedGenes.append(element)
					expressedPromotersPartial.append(currentPromoterPartIndex)
					expressedPromoters.append('P.' + str(currentPromoterPartIndex) + '.' + str(currentPromoterPartPromoterNumber))
					currentPromoterPartIndex = -1
					currentPromoterPartPromoterNumber = -1

				##Want to iterate through all the removed terminator states and update
				##the genes expressed for them as well (uncomment once the arrays have been set
				##up properly)
				for partNumber in stateByTerm:
					for term in stateByTerm[partNumber]:
						if stateByTerm[partNumber][term] == 1:
							expressedGenesWithRemovedTerms[partNumber][term].append(element)


			elif element[0] == 'T' or element[0] == 't' or element[0] == 'i':
				##Have to fix this to determine what is a non-redundant terminator
				if element[0] == 'T':
					##So here, we want to add the genes that have already been expressed
					##to the expressedGenesWithRemovedTerms and then set the state to being
					##unchanged
					##Have to split the thing up to get part location and term number
					splitTermValues = element.split('.')
					if splitTermValues[1] not in expressedGenesWithRemovedTerms:
						expressedGenesWithRemovedTerms[splitTermValues[1]] = {}
						stateByTerm[splitTermValues[1]] = {}

					expressedGenesWithRemovedTerms[splitTermValues[1]][splitTermValues[2]] = expressedGenes[:]
					stateByTerm[splitTermValues[1]][splitTermValues[2]] = state

					##expressedTerminators.append(int(element[2:]))
				state = 0
				topStateChanged = True
				currentPromoterPartIndex = -1
				currentPromoterPartPromoterNumber = -1
			else:
				continue
		##This tells us what the state of transcirption is at the end of the top segment (0 means
		##that transcription would not carry over to the next segment, 1 means it would)
		topStateAtEnd = state

		state = bottomStart
		for element in expressions['BOTTOM']:
			if element[0] == 'P':
				state = 1
				bottomStateChanged = True
				splitPromValues = element.split('.')
				currentPromoterPartIndex = int(splitPromValues[1])
				currentPromoterPartPromoterNumber = splitPromValues[2]

				##Want to iterate through all the removed terminator states and update
				##the state to one for them as well (uncomment once the arrays have been set
				##up properly)
				for partNumber in stateByTerm:
					for term in stateByTerm[partNumber]:
						stateByTerm[partNumber][term] = 1

			elif element[0] == 'G':
				if state == 1:
					expressedGenes.append(element)
					expressedPromotersPartial.append(currentPromoterPartIndex)
					expressedPromoters.append('P.' + str(currentPromoterPartIndex) + '.' + str(currentPromoterPartPromoterNumber))
					currentPromoterPartIndex = -1
					currentPromoterPartPromoterNumber = -1
				##Want to iterate through all the removed terminator states and update
				##the genes expressed for them as well (uncomment once the arrays have been set
				##up properly)
				for partNumber in stateByTerm:
					for term in stateByTerm[partNumber]:
						if stateByTerm[partNumber][term] == 1:
							expressedGenesWithRemovedTerms[partNumber][term].append(element)
				##Implicit T when you see a gene (on both sides actaully.....)
				##Done. This is what the 'i' symbol now means
			elif element[0] == 'T' or element[0] == 't' or element[0] == 'i':
				if element[0] == 'T':
					##So here, we want to add the genes that have already been expressed
					##to the expressedGenesWithRemovedTerms and then set the state to being
					##unchanged
					##Have to split the thing up to get part location and term number
					splitTermValues = element.split('.')
					if splitTermValues[1] not in expressedGenesWithRemovedTerms:
						expressedGenesWithRemovedTerms[splitTermValues[1]] = {}
						stateByTerm[splitTermValues[1]] = {}
						
					expressedGenesWithRemovedTerms[splitTermValues[1]][splitTermValues[2]] = expressedGenes[:]
					stateByTerm[splitTermValues[1]][splitTermValues[2]] = state

				state = 0
				bottomStateChanged = True
				currentPromoterPartIndex = -1
				currentPromoterPartPromoterNumber = -1
			else:
				continue

		bottomStateAtEnd = state

		##We want to go through all of the terminators and determine which ones are necessary
		##Necessary terminators are defined as terminators where, if we remove them, the 
		##gene expression profile changes
		for termNum in expressedGenesWithRemovedTerms:
			##For now, to call a terminator part redundant, all of the parts on that terminator
			##have to be useless
			for t in expressedGenesWithRemovedTerms[termNum]:
				if set(expressedGenesWithRemovedTerms[termNum][t]) != set(expressedGenes):
					##Add this part to the expressed terminators for now. Later on we will
					##want to do a further reduction, if for example, we are using a 
					##bidirectional terminator where only one is used and the other is unused
					expressedTerminators.append(termNum)
					expressedTerminatorsFull.append('T.' + str(termNum) + '.' + str(t))
					break

		# if printExtra:
		# 	print expressedTerminators
		# 	print expressedTerminatorsFull
		# 	print expressedPromoters
		# 	print expressedPromotersPartial
		# print stateByTerm

		if returnOnlyExpressedGenes:
			return expressedGenes
		else:
			return {
				'expressedGenes': expressedGenes,
				'expressedPromoters': expressedPromotersPartial,
				'expressedTerminators': expressedTerminators,
				'expressedPromotersFull': expressedPromoters,
				'expressedTerminatorsFull': expressedTerminatorsFull,
				'topOutputState': topStateAtEnd,
				'bottomOutputState': bottomStateAtEnd,
				'topStateChanged': topStateChanged,
				'bottomStateChanged': bottomStateChanged
			}


