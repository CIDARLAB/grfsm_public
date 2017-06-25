from operator import itemgetter

##Given a list of circuits with parts, returns the same list but ranked
def rankCircuits(circuitsToRank):
	rankedCircuits = []
	circuitWeightMatrix = {}

	PROMOTER_READ_THROUGH_W1 = set([9, 10, 11, 12, 22, 23, 24])
	PROMOTER_READ_THROUGH_W2 = set([13, 25])

	PROMOTER_W1 = set([2, 3, 9, 10, 12, 14, 16, 19, 21])
	PROMOTER_W2 = set([6, 11, 13, 17, 18, 22, 24])
	PROMOTER_W3 = set([20, 23, 25])

	##Determine ranking weight matrix for each circuit and then sort it at the end
	for c in range(len(circuitsToRank)):
		weightMatrix = [0, 0, 0, 0]
		for part in circuitsToRank[c]:
			absPart = abs(part)
			if absPart in PROMOTER_READ_THROUGH_W1:
				weightMatrix[0] += 1
			elif absPart in PROMOTER_READ_THROUGH_W2:
				weightMatrix[0] += 2
			if absPart == 7:
				weightMatrix[1] += 1
			if absPart == 5:
				weightMatrix[2] -= 1
			if absPart in PROMOTER_W1:
				weightMatrix[3] += 1
			elif absPart in PROMOTER_W2:
				weightMatrix[3] += 2
			elif absPart in PROMOTER_W3:
				weightMatrix[3] += 3	
		circuitWeightMatrix[c] = (weightMatrix[0], weightMatrix[1], weightMatrix[2], weightMatrix[3])

	##Sort based on values in weightMatrix
	sortedCircuits = sorted(circuitWeightMatrix.items(), key=itemgetter(1))

	for element in sortedCircuits:
		rankedCircuits.append(circuitsToRank[element[0]])
	return rankedCircuits
