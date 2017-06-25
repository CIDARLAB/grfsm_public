"""
Enzyme.py

Defines an enzyme. Enzymes are set to recognize certain site. They can recognize multiple
"""
import copy as copy

import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc

class Enzyme(object):
	##Takes a name
	def __init__(self, name):
		self.name = name
		self.sitesRecognized = []

	def addSiteToRecognize(self, symbol):
		self.sitesRecognized.append(symbol)

	def getSitesRecognized(self):
		return self.sitesRecognized[:]

"""
induceCircuit

Method to induce a circuit with an enzyme
Arguments:
	enzyme: the enzyme that it changing the circuit
	geneticcircuit: the geneticcircuit being changed
Returns:
	the new circuit, an instance of GeneticCircuit
"""
def induceCircuit(enzyme, geneticcircuit):	
	##Now iterate through each site that this enzyme recognizes and id the
	##genetic circuit contains those sites, then we have to either flip or cut
	components = geneticcircuit.getComponents()
	newCircuit = gc.GeneticCircuit(components)
	for site in enzyme.sitesRecognized:
		##Get the cut site locations, which can be different from what they were
		##in the original circuit if it's been cut
		siteLocations = __getCutSiteLocations(enzyme, newCircuit)
		if site in siteLocations:
			##There are cut sites. Check if there are two. Won't worry about other
			##Cases for now but should be implemented later on
			##
			##TODO: handle cases when there are more than 2 cut sites
			if len(siteLocations[site]) == 2:
				[cut1, cut2] = siteLocations[site]
				tempCircuit = __induceWithSingleSite(newCircuit, cut1, cut2)
				newCircuit = tempCircuit
	return newCircuit

##Searchs through the genetic circuits and gets the cut sites for
##this enzyme
def __getCutSiteLocations(enzyme, geneticcircuit):
	components = geneticcircuit.getComponents()
	siteLocations = {}
	for i in range(len(components)):
		element = components[i]
		if isinstance(element, rs.RecognitionSite):
			##Check if this enzyme cares about this recognition site
			elementSymbol = element.getSymbol()
			if elementSymbol in enzyme.getSitesRecognized():
				##Store the location of the recognition site
				if elementSymbol in siteLocations:
					siteLocations[elementSymbol].append(i)
				else:
					siteLocations[elementSymbol] = [i]
	return siteLocations


##Method to induce a circuit with at single site
def __induceWithSingleSite(geneticcircuit, site1, site2):
	oldCircuitComponents = geneticcircuit.getComponents()
	cut1orientation = oldCircuitComponents[site1].getOrientation()
	cut2orientation = oldCircuitComponents[site2].getOrientation()

	tempCircuit = None
	if cut1orientation == cut2orientation:
		tempCircuit = __cutCircuit(oldCircuitComponents, site1, site2)
	else:
		tempCircuit = __flipCircuit(oldCircuitComponents, site1, site2)
	return tempCircuit

##Method that does the flipping work
def __flipCircuit(oldCircuitComponents, flip1, flip2):
	tempCircuit = gc.GeneticCircuit([])
	subComponents = oldCircuitComponents[flip1:flip2+1][:]
	newSubsComps = []
	for element in subComponents:
		##Create new element instance so original circuit does not get modified
		if isinstance(element, part.Part):
			newElement = part.Part(element.getId(), element.getOrientation(), element.getPartLocation())
		else:
			newElement = rs.RecognitionSite(element.getSymbol(), element.getOrientation())
		newElement.flip()
		newSubsComps.append(newElement)
	newSubsComps.reverse()

	for i in range(len(oldCircuitComponents)):
		if flip1 <= i and i <= flip2:
			tempCircuit.addComponent(newSubsComps[i-flip1])
		else:
			tempCircuit.addComponent(oldCircuitComponents[i])
	return tempCircuit

##Method that does the cutting work
def __cutCircuit(oldCircuitComponents, cut1, cut2):
	tempCircuit = gc.GeneticCircuit([])
	for i in range(len(oldCircuitComponents)):
		if cut1 <= i and i < cut2:
			next
		else:
			tempCircuit.addComponent(oldCircuitComponents[i])
	return tempCircuit

