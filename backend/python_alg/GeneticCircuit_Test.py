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
def makeSimpleCircuit():
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

    ##Overwrite the parts in this circuit
    part1_1 = part.Part(5, 1)
    part2_1 = part.Part(5, 1)
    part3_1 = part.Part(1, 1)
    part4_1 = part.Part(7, -1)
    part5_1 = part.Part(5, 1)
    part6_1 = part.Part(10, -1)
    part7_1 = part.Part(10, -1)
    
    circuit.addComponent(part1_1)
    circuit.addComponent(site1)
    circuit.addComponent(part2_1)
    circuit.addComponent(site2)
    circuit.addComponent(part3_1)
    circuit.addComponent(site3)
    circuit.addComponent(part4_1)
    circuit.addComponent(site4)
    circuit.addComponent(part5_1)
    circuit.addComponent(site5)
    circuit.addComponent(part6_1)
    circuit.addComponent(site6)
    circuit.addComponent(part7_1)

    return copy.deepcopy(circuit)

def makeFullTestCircuit():
        ##Create the circuit
        circuit = gc.GeneticCircuit([])
        component1 = part.Part(14, 1)
        component2 = part.Part(1, -1)
        component3 = part.Part(5, 1)
        component4 = part.Part(5, 1)
        component5 = part.Part(3, -1)
        component6 = part.Part(5, 1)
        component7 = part.Part(5, 1)

        circuit.addComponent(component1)
        circuit.addComponent(site1)
        circuit.addComponent(component2)
        circuit.addComponent(site2)
        circuit.addComponent(component3)
        circuit.addComponent(site3)
        circuit.addComponent(component4)
        circuit.addComponent(site4)
        circuit.addComponent(component5)
        circuit.addComponent(site5)
        circuit.addComponent(component6)
        circuit.addComponent(site6)
        circuit.addComponent(component7)

        return copy.deepcopy(circuit)

def make3GeneTestCircuit():
        ##Create the circuit
        circuit = gc.GeneticCircuit([])
        component11 = part.Part(1, -1)
        component22 = part.Part(14, 1)
        component33 = part.Part(2, 1)
        component44 = part.Part(1, -1)
        component55 = part.Part(5, 1)
        component66 = part.Part(5, 1)
        component77 = part.Part(14, -1)

        circuit.addComponent(component11)
        circuit.addComponent(site1)
        circuit.addComponent(component22)
        circuit.addComponent(site2)
        circuit.addComponent(component33)
        circuit.addComponent(site3)
        circuit.addComponent(component44)
        circuit.addComponent(site4)
        circuit.addComponent(component55)
        circuit.addComponent(site5)
        circuit.addComponent(component66)
        circuit.addComponent(site6)
        circuit.addComponent(component77)

        return copy.deepcopy(circuit)

class GeneticCircuitTest(unittest.TestCase):
        ##Testing reading on the simple circuit
        def test_simpleCircuit(self):
                ##Create the circuit
                circuit = makeSimpleCircuit()

                self.assertEqual(circuit.printCircuit(), [1,'D',2,'-D',3])
                ##Check the the expression profile is as expected
                self.assertEqual(circuit.printAllParts()['TOP'], ['G','i','G','P','t','P'])
                self.assertEqual(circuit.printAllParts()['BOTTOM'], ['T','i','i'])
                self.assertEqual(circuit.printOnlyExpressed(), [])

                circuit1 = enz.induceCircuit(enzyme1, circuit)
                self.assertEqual(circuit1.printAllParts()['TOP'], ['G','i','i', 't', 'P'])
                self.assertEqual(circuit1.printAllParts()['BOTTOM'], ['T', 'G', 'P','i'])

        def test_3StateCircuit(self):
                circuit = makeCircuit3State()

                self.assertEqual(circuit.printCircuit(), [5,'D',5,'[',1,'(',-7,'-[',5,'(',-10,'-D',-10])
                self.assertEqual(circuit.printAllParts()['TOP'], ['G','i'])
                self.assertEqual(circuit.printAllParts()['BOTTOM'], ['P','P','T','i'])

                ##Induce the circuit with enzyme1 and validate
                circuit1 = enz.induceCircuit(enzyme1, circuit)
                self.assertEqual(circuit1.printCircuit(), [5,'D',10,'-(',-5,'[',1,'(',-7,'-[',-5,'-D',-10])
                self.assertEqual(circuit1.printAllParts()['TOP'], ['P','G','i'])
                self.assertEqual(circuit1.printAllParts()['BOTTOM'], ['P','T','i'])

                ##Induce the circuit with enzyme2 and validate
                circuit2 = enz.induceCircuit(enzyme2, circuit1)
                self.assertEqual(circuit2.printCircuit(), [5,'D',10,'-(',-1,'-[',5,'(',-7,'-[',-5,'-D',-10])
                self.assertEqual(circuit2.printAllParts()['TOP'], ['P','i'])
                self.assertEqual(circuit2.printAllParts()['BOTTOM'], ['P','T','G','i'])        

                ##Induce the circuit with enzyme2 and validate that it is correct
                circuit3 = enz.induceCircuit(enzyme2, circuit)
                self.assertEqual(circuit3.printCircuit(), [5,'D',5,'[',1,'(',-10,'-D',-10])
                self.assertEqual(circuit3.printAllParts()['TOP'], ['G','i'])
                self.assertEqual(circuit3.printAllParts()['BOTTOM'], ['P','P','i'])

                ##Inducde the circuit with enzyme1 and validate it
                circuit4 = enz.induceCircuit(enzyme1, circuit3)
                self.assertEqual(circuit4.printCircuit(), [5,'D',10,'-(',-1,'-[',-5,'-D',-10])
                self.assertEqual(circuit4.printAllParts()['TOP'], ['P','i'])
                self.assertEqual(circuit4.printAllParts()['BOTTOM'],['P','G','i'])

        ##Make a test that prints the specific genes expressed at each level. This will
        ##require setting up a new circuit whose genes are named
        def test_circuitWithGenes(self):
                circuit = makeFullTestCircuit()
                self.assertEqual(circuit.printAllPartsWithGeneNames()['TOP'], ['P', 'i','T'])
                self.assertEqual(circuit.printAllPartsWithGeneNames()['BOTTOM'], ['t', 'P', 'G.3.1', 'i','t'])

                circuit1 = enz.induceCircuit(enzyme1, circuit)
                self.assertEqual(circuit1.printAllPartsWithGeneNames()['TOP'], ['P', 't', 'P', 'G.3.1','i'])
                self.assertEqual(circuit1.printAllPartsWithGeneNames()['BOTTOM'], ['i','T', 't'])

                circuit2 = enz.induceCircuit(enzyme2, circuit1)
                self.assertEqual(circuit2.printAllPartsWithGeneNames()['TOP'], ['P', 'T', 'G.3.1','i'])
                self.assertEqual(circuit2.printAllPartsWithGeneNames()['BOTTOM'], ['i','t', 'P', 't'])

                circuit3 = enz.induceCircuit(enzyme2, circuit)
                self.assertEqual(circuit3.printAllPartsWithGeneNames()['TOP'], ['P','i'])
                self.assertEqual(circuit3.printAllPartsWithGeneNames()['BOTTOM'], ['G.3.1', 'i', 't'])
                
                circuit4 = enz.induceCircuit(enzyme1, circuit3)
                self.assertEqual(circuit4.printAllPartsWithGeneNames()['TOP'], ['P', 'G.3.1','i'])
                self.assertEqual(circuit4.printAllPartsWithGeneNames()['BOTTOM'], ['i','t'])

        ##Tests circuit with 3 genes (RFP, BFP, GFP)
        def test_circuitWith3Genes(self):
                circuit = make3GeneTestCircuit()
                self.assertEqual(circuit.printOnlyExpressed(), ['G.5.1', 'G.7.1'])

                circuit1 = enz.induceCircuit(enzyme1, circuit)
                self.assertEqual(circuit1.printOnlyExpressed(), ['G.7.1'])
                

                circuit2 = enz.induceCircuit(enzyme2, circuit1)
                self.assertEqual(circuit2.printOnlyExpressed(), ['G.7.1', 'G.1.1'])

                circuit3 = enz.induceCircuit(enzyme2, circuit)
                self.assertEqual(circuit3.printOnlyExpressed(), ['G.5.1'])
                
                circuit4 = enz.induceCircuit(enzyme1, circuit3)
                self.assertEqual(circuit4.printOnlyExpressed(), ['G.5.1', 'G.1.1'])

                
if __name__ == '__main__':
    unittest.main()
