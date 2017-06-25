"""Creates a circuit for testing"""
import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

import copy

import unittest

##SETUP
##Create the parts
part1 = part.Part(1, 1)
site1 = rs.RecognitionSite('D', 1)
part2 = part.Part(2, 1)
site2 = rs.RecognitionSite('[', 1)
part3 = part.Part(3, 1)
site3 = rs.RecognitionSite('(', 1)
part4 = part.Part(4,1)
site4 = rs.RecognitionSite('[', -1)
part5 = part.Part(5, 1)
site5 = rs.RecognitionSite('(', 1)
part6 = part.Part(6, 1)
site6 = rs.RecognitionSite('D', -1)
part7 = part.Part(7,1)

##Create the enzymes
enzyme1 = enz.Enzyme('Ara')
enzyme1.addSiteToRecognize('[')
enzyme1.addSiteToRecognize('D')
enzyme2 = enz.Enzyme('ATc')
enzyme2.addSiteToRecognize('(')

##SETUP: make simple flip circuit
def makeSimpleCicuit():
        circuit = gc.GeneticCircuit([])
        circuit.addComponent(part1)
        circuit.addComponent(site1)
        circuit.addComponent(part2)
        circuit.addComponent(site6)
        circuit.addComponent(part3)

        return copy.deepcopy(circuit)

##SETUP: make 3 state machine circuit
def makeCircuit3State():
    ##Create the circuit
    circuit = gc.GeneticCircuit([])
    circuit.addComponent(part1)
    circuit.addComponent(site1)
    circuit.addComponent(part2)
    circuit.addComponent(site2)
    circuit.addComponent(part3)
    circuit.addComponent(site3)
    circuit.addComponent(part4)
    circuit.addComponent(site4)
    circuit.addComponent(part5)
    circuit.addComponent(site5)
    circuit.addComponent(part6)
    circuit.addComponent(site6)
    circuit.addComponent(part7)

    return copy.deepcopy(circuit)

##Thec actual tests
class EnzymeTest(unittest.TestCase):
    ##Simple circuit test
    def test_simpleCircuit(self):
        ##Create the circuit
        circuit = makeSimpleCicuit()

        self.assertEqual(circuit.printCircuit(), [1,'D',2,'-D',3])
        newCircuit = enz.induceCircuit(enzyme1,circuit)
        self.assertEqual(newCircuit.printCircuit(), [1,'D',-2,'-D',3])

    def test_circuit_path1(self):
        circuit1 = makeCircuit3State()
        
        ##The original circuit
        self.assertEqual(circuit1.printCircuit(), [1,'D',2,'[',3,'(',4,'-[',5,'(',6,'-D',7])

        ##Circuit when exposed to ATc
        circuitA = enz.induceCircuit(enzyme2, circuit1)
        self.assertEqual(circuitA.printCircuit(), [1,'D',2,'[',3,'(',6,'-D',7])
        
        ##Curcuit when exposed to Ara after ATc
        circuitB = enz.induceCircuit(enzyme1, circuitA)
        self.assertEqual(circuitB.printCircuit(), [1,'D',-6,'-(',-3,'-[',-2,'-D',7])

    def test_circuit_path2(self):
        circuit2 = makeCircuit3State()
        
        ##The original circuit
        self.assertEqual(circuit2.printCircuit(), [1,'D',2,'[',3,'(',4,'-[',5,'(',6,'-D',7])
                
        ##Circuit when exposed to Ara
        circuitC = enz.induceCircuit(enzyme1, circuit2)
        self.assertEqual(circuitC.printCircuit(), [1,'D',-6,'-(',-5,'[',3,'(',4,'-[',-2,'-D',7])
        
        ##Circuit when exposed to ATc after Ara
        circuitD = enz.induceCircuit(enzyme2, circuitC)
        self.assertEqual(circuitD.printCircuit(), [1,'D',-6,'-(',-3,'-[',5,'(',4,'-[',-2,'-D',7])
    
if __name__ == '__main__':
    unittest.main()
