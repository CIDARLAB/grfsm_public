"""
RecognitionSite.py

the class that deines a recognition site
"""
class RecognitionSite(object):
	##symbol: the recognition site symbol
	##orientation: 1 if facing to the right, -1 if facing left
	def __init__(self, symbol, orientation, partLocation=None):
		self.symbol = symbol
		self.orientation = orientation
		self.partLocation = partLocation

	def flip(self):
		self.orientation *= -1

	def getSymbol(self):
		return self.symbol

	def getOrientation(self):
		return self.orientation

	def setPartLocation(self, partLocation):
		self.partLocation = partLocation


	def getPartLocation(self):
		return self.partLocation

	def printMe(self):
		if self.orientation < 0:
			return '-' + self.getSymbol()
		else:
			return self.getSymbol()
		