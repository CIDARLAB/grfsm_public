import Part as part
import RecognitionSite as rs
import GeneticCircuit as gc
import Enzyme as enz

##Create the enzymes
enzyme1 = enz.Enzyme('Ara')
enzyme1.addSiteToRecognize('[')
enzyme1.addSiteToRecognize('D')
enzyme2 = enz.Enzyme('ATc')
enzyme2.addSiteToRecognize('(')

circuit = gc.GeneticCircuit([])

site1 = rs.RecognitionSite('D', 1)
site2 = rs.RecognitionSite('[', 1)
site3 = rs.RecognitionSite('(', 1)
site4 = rs.RecognitionSite('[', -1)
site5 = rs.RecognitionSite('(', 1)
site6 = rs.RecognitionSite('D', -1)

##Overwrite the parts in this circuit
part1_1 = part.Part(1, 1)
part2_1 = part.Part(3, 1)
part3_1 = part.Part(5, 1)
part4_1 = part.Part(7, 1)
part5_1 = part.Part(9, 1)
part6_1 = part.Part(11, 1)
part7_1 = part.Part(13, 1)

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

c2 = enz.induceCircuit(enzyme1, circuit)
c3 = enz.induceCircuit(enzyme2, circuit)
c4 = enz.induceCircuit(enzyme2, c2)
c5 = enz.induceCircuit(enzyme1, c3)

# print circuit.printAllPartsWithGeneNames()
# print c2.printAllPartsWithGeneNames()
# print c3.printAllPartsWithGeneNames()
# print c4.printAllPartsWithGeneNames()
# print c5.printAllPartsWithGeneNames()

# print circuit.printCircuit(excludeRecombinationSites=True)
# print c2.printCircuit(excludeRecombinationSites=True)
# print c3.printCircuit(excludeRecombinationSites=True)
# print c4.printCircuit(excludeRecombinationSites=True)
# print c5.printCircuit(excludeRecombinationSites=True)

print circuit.getComponentOriginalMapping()
print c2.getComponentOriginalMapping()
print c3.getComponentOriginalMapping()
print c4.getComponentOriginalMapping()
print c5.getComponentOriginalMapping()
