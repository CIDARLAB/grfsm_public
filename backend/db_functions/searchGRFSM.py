import numpy as np
from application import db
from application.models import grfsmArray, circuitArray

#grfsmDB = scipy.io.loadmat('grfsmDB.mat')
def circuitRank(circuits):
        ##TODO:
        ##implement the rank function from MATLAB to correctly rank the circuits
        return circuits


def searchGRFSMFromSQL(inputGRFSM):
        #print inputGRFSM
        states = 5
        grfsmMax = 14
        ##The inputGRFSM should be an array of arrays (i.e a matrix)
        ##We want to validate that the matrix has the right dimensions
        ##It should have exactly 5 states and if it as less than 14 genes,
        ##Fill in the rest with 0s
        ##
        ##Example:
        ##
        ##      [[1],[0],[1],[1],[0]]
        ##So we want to make sure that the size of the array is 5 and if
        ##each array does not have 14 states, we need to append a bunch of 0s
        ##to the end of each array
        if len(inputGRFSM) != states:
                return "error"

        updatedInputGRFSM = formatInput(inputGRFSM)
        ##Our updated varibale is in updatedInputGRFSM
        ##We now have to transform this into a 70 unit row vector, as this is how the information
        ##is stored in the database
        ##TODO: verify the format of this vetor as it could be flipped.
        ##Done. 

        rowVectorOfInput = []
        for state in updatedInputGRFSM:
                for geneExpr in state:
                        rowVectorOfInput.append(geneExpr)
        
        designVectorToString = ''
        for element in rowVectorOfInput:
            designVectorToString += str(int(element))

        #print designVectorToString
        ##Now have to look for the id that matches this string (that is a simple database query)
        ##TODO: implement query which returns the id we care about

        ##Get the design id matching the design vector string. There should only be one, as each is unique
        designObject = db.session.query(grfsmArray).filter(grfsmArray.design_vector==designVectorToString).first()
              
        ##Check that we actually returned and matched a design id
        if designObject == None:
            return ['Design does not exist']

        designId = designObject.id

        ##Now we just do a join and return the parts for all the circuitArrays who have that grfsm id
        ##for each one, split it so that it is an array and then append it to a master list which is what
        ##we want to return 
        print ('Joining...')
        joinedGrfsmCircuit = db.session.query(grfsmArray, circuitArray).filter(grfsmArray.id == circuitArray.grfsm_array_id).filter(grfsmArray.id == designId).all()
        #print joinedGrfsmCircuit
        circuitsList = []
        for q in joinedGrfsmCircuit:
            partsString = q.circuitArray.parts
            splitParts = partsString.split(',')
            ##New to turn this into an array of parts
            integerPartIds = [int(ele) for ele in splitParts]
            circuitsList.append(integerPartIds)

        db.session.close()
        #print circuitsList 
        if len(circuitsList) == 0:
            circuitsList.append('No circuits found')
        return circuitsList
        ##If the above is done, all that remains is to migrate all the data from matlab to mysql, and then
        ##upload the application code to aws, and then it should be ready to go!

        ##TODO: implement this funciton, test it, then migrate all the data

##DEPRECATED! THIS FUNCTION SHOULD BE DELETED
def searchGRFSM(inputGRFSM, test=False):
        toLoad = 'grfsmDB_Test.mat'
        #grfsmDB = scipy.io.loadmat('DB4_test.mat')
        if not test:
		    toLoad = 'grfsmDB.mat'
        
        #print inputGRFSM
        grfsmDB = scipy.io.loadmat('grfsmDB.mat')
        grfsmArray = grfsmDB['grfsmArray']
        circuitArray = grfsmDB['circuitArray']
        circuit2grfsm = grfsmDB['circuit2grfsm']

        states = 5
        grfsmMax = 14

        ##Binary search for circuitArray

        ##TODO: rexamine this function and fix it because it does not work at all
        ##like it is supposed to.
        ##Done. Several unit tests pass. More will be implemented in the future to
        ##continnue validation
        def searchForCircuits(grfsmId):
                numGRFSMs = len(circuit2grfsm) 
                startingPoint = numGRFSMs / 2
                done = False
                currentPoint = startingPoint
                interval = startingPoint / 2

                ##A way better implementation
                leftPoint = 0
                rightPoint = numGRFSMs-1
                currentPoint = -1
                #print("Goal " + str(grfsmId))
                while rightPoint-leftPoint > 1:
                    midPoint = (rightPoint + leftPoint)/2
       	            currentGRFSMId = circuit2grfsm[midPoint]
                    if currentGRFSMId == grfsmId:
                        currentPoint = midPoint
                        break
                    elif currentGRFSMId > grfsmId:
                        ##Go right
                        rightPoint = midPoint
                    elif currentGRFSMId < grfsmId:
                        ##Go left
                        leftPoint = midPoint

                #No circuit matching the id was found
                if currentPoint == -1:
                    return []

                firstCircuitIndex = currentPoint
                while circuit2grfsm[firstCircuitIndex-1] == grfsmId:
                        firstCircuitIndex -= 1
                lastCircuitIndex = currentPoint
                while circuit2grfsm[lastCircuitIndex+1] == grfsmId:
                        lastCircuitIndex += 1

                ##Use lastCircuitIndex+1 => have to add +1 because last value is not
                ##included when making an array this way in python ([0:2] only includes
                ##entries 0, 1 and not 2)
                return circuitArray[firstCircuitIndex:lastCircuitIndex+1]

        
        ##The inputGRFSM should be an array of arrays (i.e a matrix)
        ##We want to validate that the matrix has the right dimensions
        ##It should have exactly 5 states and if it as less than 14 genes,
        ##Fill in the rest with 0s
        ##
        ##Example:
        ##
        ##      [[1],[0],[1],[1],[0]]
        ##So we want to make sure that the size of the array is 5 and if
        ##each array does not have 14 states, we need to append a bunch of 0s
        ##to the end of each array
        if len(inputGRFSM) != states:
                return "error"

        updatedInputGRFSM = formatInput(inputGRFSM)
        ##Our updated varibale is in updatedInputGRFSM
        ##We now have to transform this into a 70 unit row vector, as this is how the information
        ##is stored in the database
        ##TODO: verify the format of this vetor as it could be flipped.
        ##Done. 

        rowVectorOfInput = []
        for state in updatedInputGRFSM:
                for geneExpr in state:
                        rowVectorOfInput.append(geneExpr)
        
        
        currentStates = np.array(rowVectorOfInput)
        ##Search the data base to find the matching design (this probably
        ##will be the slowest part)
        designIndex = -1
        for i in range(len(grfsmArray[0])):
                if np.array_equal(grfsmArray[:,i], currentStates):
                        designIndex = i
                        break

        ##Kind of confusing but the id of the actual design is designIndex + 1
        ##designIndex keeps the location of this design in the grfsmArray (which
        ##column it's in that is, starting at a 0 index

        ##Now we want to look through circuits2grfsm and find all the circuits
        ##that point to this grfsm
        circuits = searchForCircuits(designIndex + 1)
        #print circuits

        ##Now we just have to do the ranking an we are done
        return circuits.tolist()

##Given a circuit and circuit design, determines which gene should be assigned to which
##position in each part
##Might have to use the python code I was working with earlier in the other modules to
##accomplish this

##The input needs some strange and fun formatting!
##
##TODO: change this so it can handle 16 state as well (removing hard coded values and replacing them
##with variable parameters)
def formatInput(inputGRFSM, maxGenesRegulated=14, threeState=False):
        updatedInputGRFSM = []
        numberOfStates = len(inputGRFSM)

        numberOfGenes = len(inputGRFSM[0])

        if numberOfGenes == 0:
           return np.zeros(numberOfStates)
            
        ##Custom comparator function to correctly sort the columns in the array
        ##Takes two indices and returns the one that is larger
        def compareTwoIndicies(left, right):
            rowToCompare = 0
            leftValue = inputGRFSM[0][left]
            rightValue = inputGRFSM[0][right]


            while leftValue == rightValue and rowToCompare < numberOfStates:
            	leftValue = inputGRFSM[rowToCompare][left]
            	rightValue = inputGRFSM[rowToCompare][right]
            	rowToCompare += 1

            return leftValue - rightValue


        newlyFormattedInput = np.array(inputGRFSM)
        geneIndices = sorted(range(numberOfGenes), cmp=lambda x,y: compareTwoIndicies(x,y))

        finalInputArray = np.zeros(numberOfStates)
        ##Now have to buld up the array with the new indicies
        for index in geneIndices:
        	finalInputArray = np.c_[finalInputArray, newlyFormattedInput[:,index]]
        finalInputArray = np.delete(finalInputArray, 0, 1)

        while np.shape(finalInputArray)[1] < maxGenesRegulated:
        	finalInputArray = np.c_[np.zeros(numberOfStates), finalInputArray]

        ##For the three input state machine, no gene should have an all 0s column
        zerosCol = np.zeros(numberOfStates)
        if threeState:
            colsToDelete = []
            for colI in xrange(len(finalInputArray.T)):
                col = finalInputArray.T[colI]
                if np.count_nonzero(col) == 0:
                    #print "Should delete " + str(colI)
                    colsToDelete.append(colI)
            finalInputArray = np.delete(finalInputArray, colsToDelete, 1)
        return finalInputArray 
