"""
Part.py

the class that defines a basic genetic part
"""
class Part(object):
	##id: the id of the part
	##orientation: 1 if 'up', -1 if 'down'
	##genes: the gene names
	##partLocation: the parts Location in the circuit, which we don't know until the
	##				part is added to the circuit
	def __init__(self, id, orientation, partLocation=None):
		self.id = id
		self.orientation = orientation
		##By default, the genes will be name 1,2,3 and the user can specific this
		##if they want
		self.genes = ['1','2','3']
		self.terms = ['1','2','3','4','5']
		self.proms = ['1','2','3','4','5']
		self.partLocation = partLocation

	def flip(self):
		self.orientation *= -1

	def getId(self):
		return self.id

	def getOrientation(self):
		return self.orientation

	def printMe(self):
		return self.id * self.orientation

	def containsPromoter(self):
		if self.id in set([1,4,5,7,8,15]):
			return False
		return True

	##Prints the components in the part based on the PARTS array
	##topOrBottom: should be either 'TOP' or 'BOTTOM'
	def printExpression(self, topOrBottom):
		partID = self.getId()
		return PARTS[partID]['SEQUENCE'][topOrBottom][:]

	##partLocation: in the original, unrecombined circuit, each part appears in a 
	##specific spot. This spot has an id (in the case of the 5 state state-machine,
	##the ids are 1-7. The partLocation will be used in the name to distiniguish which
	##genes are which. This will be important when trying to determine where to position
	##genes so that we get the desired output
	def setPartLocation(self, partLocation):
		self.partLocation = partLocation


	def getPartLocation(self):
		return self.partLocation

	##For a given part, will set assign the genes to be the specific genes
	##That we are using in this part. Not all value have to be passed into it
	##They are assigned in order, starting with the top and then moving onto the
	##bottom. For example, for part id=25, gene0 corresponds to the first gene
	##in TOP, gene1 to the second one, and gene2 to the gene on the bottom
	def setGenes(self, gene0, gene1, gene2):
		self.genes = [gene0, gene1, gene2]

	def getGene(self, geneNumber):
		geneName = 'G.' + str(self.getPartLocation()) + '.' + str(self.genes[geneNumber])
		return geneName

	##Rather than only returning an array with 'G', returns the actual value stored
	##for that gene. To be used to determine whether a gene is on or not later on

	##This is a very expensive function, may want to rewrite or find a way to do this
	##more efficiently
	def printSpecificExpression(self):
		top = self.printExpression('TOP')
		bottom = self.printExpression('BOTTOM')

		topRead = []
		bottomRead = []
		geneNumber = 0
		termNumber = 0
		promNumber = 0
		for element in top:
			if element == 'G':
				topRead.append(self.getGene(geneNumber))
				geneNumber += 1
			elif element == 'P':
				topRead.append(element + '.' + str(self.getPartLocation()) + '.' + str(self.proms[promNumber]))
				promNumber += 1
			elif element == 'T':
				topRead.append(element + '.' + str(self.getPartLocation()) + '.' + str(self.terms[termNumber]))
				termNumber += 1
			else:
				topRead.append(element)
		for element in bottom:
			if element == 'G':
				bottomRead.append(self.getGene(geneNumber))
				geneNumber += 1
			elif element == 'P':
				bottomRead.append(element + '.' + str(self.getPartLocation()) + '.' + str(self.proms[promNumber]))
				promNumber += 1
			elif element == 'T':
				bottomRead.append(element + '.' + str(self.getPartLocation()) + '.' + str(self.terms[termNumber]))
				termNumber += 1
			else:
				bottomRead.append(element)

		return {
			'TOP': topRead,
			'BOTTOM': bottomRead
		}



##An array that contains all of the parts where the part id
##corresponds to the location in the array
##
##Notes about data structure
##A part looks like the following:
##	{
##		'ID': the id of the part
##		'SEQUENCE': the elements in this part. An element being a promoter, gene, or 
##			terminator (keyed TOP and BOTTOM)
##			G: gene
##			P: promoter
##			t: fake terminator
##			T: terminator
##			i: implicit terminator after genes (this is a bidirectional terminator)
##		Sequence are read from left to right
##	}
PARTSWITHOUTPROMOTERS = set([1,4,5,7,8,15])
PARTSWITHTERMINTAORS = set([3, 4, 7, 15])
PARTSWITHTERMINTAORS_INCOMPLETE = set([4])

PARTS = [
	{},
	{
		'ID' : 1,
		'SEQUENCE' : {
			'TOP' : ['G','i'],
			'BOTTOM' : ['i']
			}
	},
	{
		'ID' : 2,
		'SEQUENCE' : {
			'TOP' : ['G','P'],
			'BOTTOM' : ['i']
		}
	},
	{
		'ID' : 3,
		'SEQUENCE' : {
			'TOP' : ['t', 'P'],
			'BOTTOM' : ['T']
		}
	},
	{
		'ID' : 4,
		'SEQUENCE' : {
			'TOP' : ['T'],
			'BOTTOM' : ['T']
		}
	},
	{
		'ID' : 5,
		'SEQUENCE' : {
			'TOP' : [],
			'BOTTOM' : []
		}
	},
	{
		'ID' : 6,
		'SEQUENCE' : {
			'TOP' : ['P'],
			'BOTTOM' : ['P']
		}
	},
		{
		'ID' : 7,
		'SEQUENCE' : {
			'TOP' : ['T'],
			'BOTTOM' : []
			}
	},
	{
		'ID' : 8,
		'SEQUENCE' : {
			'TOP' : ['G','i'],
			'BOTTOM' : ['G','i']
		}
	},
	{
		'ID' : 9,
		'SEQUENCE' : {
			'TOP' : ['P'],
			'BOTTOM' : ['G','i']
		}
	},
	{
		'ID' : 10,
		'SEQUENCE' : {
			'TOP' : ['P'],
			'BOTTOM' : []
		}
	},
	{
		'ID' : 11,
		'SEQUENCE' : {
			'TOP' : ['G','P'],
			'BOTTOM' : ['P']
		}
	},
	{
		'ID' : 12,
		'SEQUENCE' : {
			'TOP' : ['G','P'],
			'BOTTOM' : ['G','i']
		}
	},
		{
		'ID' : 13,
		'SEQUENCE' : {
			'TOP' : ['G','P'],
			'BOTTOM' : ['G', 'P']
			}
	},
	{
		'ID' : 14,
		'SEQUENCE' : {
			'TOP' : ['P'],
			'BOTTOM' : ['t']
		}
	},
	{
		'ID' : 15,
		'SEQUENCE' : {
			'TOP' : ['T'],
			'BOTTOM' : ['t']
		}
	},
	{
		'ID' : 16,
		'SEQUENCE' : {
			'TOP' : ['G', 'P', 'G','i'],
			'BOTTOM' : ['i']
		}
	},
	{
		'ID' : 17,
		'SEQUENCE' : {
			'TOP' : ['G', 'P', 'G', 'P'],
			'BOTTOM' : ['i']
		}
	},
	{
		'ID' : 18,
		'SEQUENCE' : {
			'TOP' : ['P','G','P'],
			'BOTTOM' : ['i']
		}
	},
		{
		'ID' : 19,
		'SEQUENCE' : {
			'TOP' : ['P','G','i'],
			'BOTTOM' : ['i']
			}
	},
	{
		'ID' : 20,
		'SEQUENCE' : {
			'TOP' : ['P','G','i','P'],
			'BOTTOM' : ['P']
		}
	},
	{
		'ID' : 21,
		'SEQUENCE' : {
			'TOP' : ['G','P','G','i'],
			'BOTTOM' : ['G','i']
		}
	},
	{
		'ID' : 22,
		'SEQUENCE' : {
			'TOP' : ['P','G','P'],
			'BOTTOM' : ['G','i']
		}
	},
	{
		'ID' : 23,
		'SEQUENCE' : {
			'TOP' : ['G','P','G','P'],
			'BOTTOM' : ['P']
		}
	},
	{
		'ID' : 24,
		'SEQUENCE' : {
			'TOP' : ['G','P','G','P'],
			'BOTTOM' : ['G','i']
		}
	},
	{
		'ID' : 25,
		'SEQUENCE' : {
			'TOP' : ['G','P','G','P'],
			'BOTTOM' : ['G','P']
		}
	}
]
