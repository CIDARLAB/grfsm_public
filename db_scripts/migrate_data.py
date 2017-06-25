from application import db
from application.models import grfsmArray, circuitArray

import numpy as np
import scipy.io

import sys

import time
startTime = time.time()

grfsmDB = scipy.io.loadmat('grfsmDB.mat')

grfsmArrayDB = grfsmDB['grfsmArray']
circuitArrayDB = grfsmDB['circuitArray']
circuit2grfsmDB = grfsmDB['circuit2grfsm']

numberEntered = 0
##Have to configure the grfsm array data so that it can be put into the database
##The format is: id, 70 character string of 0's and 1's
totalCircuits = len(circuitArrayDB)
print totalCircuits
exit()
idThreshold = 5000000
#print totalCircuits
##Check if id is already in the data base
idssql = db.session.query(circuitArray).filter(circuitArray.id_in_matlab > idThreshold).all()
ids = {}
for q in idssql:
	ids[q.id_in_matlab] = True


grfsmIdsInMatLab = {}
grfsmIdQuery = db.session.query(grfsmArray).filter(grfsmArray.id_in_matlab >= 75268).all()

for q in grfsmIdQuery:
	grfsmIdsInMatLab[int(q.id_in_matlab)] = int(q.id)

for i in xrange(totalCircuits):
	idOfCircuit = i+1
	if idOfCircuit in ids or idOfCircuit <= idThreshold:
		continue
	elif numberEntered < 250000:
		if numberEntered == 0:
			sys.stdout.write('insert into circuit_array (parts, grfsm_array_id, id_in_matlab) values ')
		elif numberEntered % 10000 == 0:
			sys.stdout.write(';')
			print ''
			sys.stdout.write('insert into circuit_array (parts, grfsm_array_id, id_in_matlab) values ')
		else:
			a=1
		circuit = circuitArrayDB[i]
		##For the grfsm, creates its string representation
		circuitPartsList = []
		for part in circuit:
			circuitPartsList.append(str(int(part)))
		arrayString = ','.join(circuitPartsList)
		grfsmArrayId_in_matlab = int(circuit2grfsmDB[i][0])

		grfsmArrayId = grfsmIdsInMatLab[grfsmArrayId_in_matlab]

		#toAdd = circuitArray(parts=arrayString, grfsm_array_id=grfsmArrayId, id_in_matlab=idOfCircuit)
		sys.stdout.write("('" + arrayString + "'," + str(grfsmArrayId) + ',' + str(idOfCircuit) + ')')
		#db.session.add(toAdd)
		numberEntered +=1
		if numberEntered % 10000 == 0 and numberEntered != 0:
			#print 1.0*numberEntered/1000 * 100
			a = 1
			#db.session.commit()
		else:
			sys.stdout.write(',')
	else: 
		break
sys.stdout.write(';')
# numberEntered = 0
# ##Have to configure the grfsm array data so that it can be put into the database
# ##The format is: id, 70 character string of 0's and 1's
# totalGRFSMs = len(grfsmArrayDB[0])
# #print totalGRFSMs
# ##Check if id is already in the data base
# idssql = db.session.query(grfsmArray).all()
# ids = {}
# for q in idssql:
# 	ids[q.id_in_matlab] = True

# for i in xrange(totalGRFSMs):
# 	idOfGRFSM = i+1
# 	if idOfGRFSM in ids:
# 		continue
# 	elif numberEntered < 60000:
# 		if numberEntered == 0:
# 			sys.stdout.write('insert into grfsm_array (design_vector, id_in_matlab) values ')
# 		elif numberEntered % 5000 == 0:
# 			sys.stdout.write(';')
# 			print ''
# 			sys.stdout.write('insert into grfsm_array (design_vector, id_in_matlab) values ')
# 		else:
# 			a=1
# 		design = grfsmArrayDB[:,i]
# 		##For the grfsm, creates its string representation
# 		grfsmString = ''
# 		for num in design:
# 			grfsmString += str(int(num))
# 		toAdd = grfsmArray(design_vector=grfsmString, id_in_matlab=idOfGRFSM)
# 		sys.stdout.write("('" + grfsmString + "'," + str(idOfGRFSM) + ')')
# 		#db.session.add(toAdd)
# 		numberEntered +=1
# 		if numberEntered % 5000 == 0 and numberEntered != 0:
# 			#print 1.0*numberEntered/1000 * 100
# 			a = 1
# 			#db.session.commit()
# 		else:
# 			sys.stdout.write(',')
# 	else: 
# 		break

# sys.stdout.write(';')
#db.session.commit()
db.session.close()
endTime = time.time()
