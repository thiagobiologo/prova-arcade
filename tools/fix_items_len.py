# Equaliza o comprimento das alternativas (a correta era a mais longa em 13 de 18 formas) SEM mudar o sentido de cada equívoco.
P = 'app/js/items.js'
s = open(P, encoding='utf-8').read()
R = [
 ("O olho, sozinho, interpreta as imagens; a lesão no cérebro afetou apenas a memória dela.", "O olho, sozinho, interpreta as imagens; a lesão no cérebro afetou apenas a memória dela, não o reconhecimento visual."),
 ("O olho deixou de emitir os raios que alcançam os objetos, por isso ela não os reconhece.", "O olho deixou de emitir os raios que alcançam os objetos, por isso ela já não consegue identificá-los ao olhar."),
 ("Os olhos dele emitem um feixe que ilumina as poltronas, e esse feixe fica mais forte com o tempo.", "Os olhos dele emitem um feixe que ilumina as poltronas, e esse feixe fica mais forte com o passar do tempo no escuro."),
 ("As poltronas produzem uma luz fraca própria, que só se torna visível quando a luz da tela diminui.", "As poltronas produzem uma luz fraca própria, que só se torna visível quando a luz da tela diminui no ambiente."),
 ("Convergente: ela junta os raios e, assim, aproxima a imagem da retina.", "Convergente: ela junta os raios antes de entrarem no olho e, assim, aproxima a imagem distante da retina."),
 ("Nenhuma: o problema está na retina, que precisa ser aproximada do cristalino com exercícios.", "Nenhuma: o problema está na retina, que precisa ser aproximada do cristalino com exercícios oculares diários."),
 ("Convergente, pois aumenta o tamanho aparente do rosto, e por isso ela passa a reconhecê-lo.", "Convergente, pois aumenta o tamanho aparente do rosto, e por isso ela passa a reconhecê-lo de longe sem esforço."),
 ("Paulo usa lente convergente e Rita usa lente divergente.", "Paulo usa lente convergente, pois tem hipermetropia, e Rita usa lente divergente, pois tem miopia."),
 ("Paulo usa lente divergente e Rita usa lente convergente.", "Paulo usa lente divergente, pois tem hipermetropia, e Rita usa lente convergente, pois tem miopia."),
 ("Os dois usam o mesmo tipo de lente; muda apenas o grau de cada uma.", "Os dois usam o mesmo tipo de lente; muda apenas o grau de cada uma, de acordo com o defeito."),
 ("O esqueleto também sustenta o corpo e serve de apoio: sem ossos rígidos para os músculos puxarem, não haveria movimento.", "O esqueleto também sustenta o corpo e dá apoio: sem ossos rígidos para os músculos puxarem, não haveria movimento."),
 ("A fala está certa: o esqueleto apenas protege os órgãos, e o movimento depende só dos músculos.", "A fala está certa: o esqueleto apenas protege os órgãos internos, e o movimento depende só dos músculos do animal."),
 ("A fala está errada: quem move o animal são os ossos, e os músculos só dão forma ao corpo.", "A fala está errada: quem move o animal são os ossos, e os músculos só dão forma e volume ao corpo dele."),
 ("Sustenta o corpo, protege órgãos e fornece apoio para a ação dos músculos.", "Sustenta o corpo, protege órgãos importantes e fornece apoio para a ação dos músculos."),
 ("Move o corpo sozinho, sem precisar de músculos ou de nervos.", "Move o corpo sozinho, sem precisar de músculos ou de nervos para comandar o movimento."),
 ("Músculos só puxam (contraem); para movimentos opostos, músculos antagonistas se alternam, um contraindo enquanto o outro relaxa.", "Músculos só puxam (contraem); para movimentos opostos, músculos antagonistas se alternam: um contrai enquanto o outro relaxa."),
 ("Cada músculo empurra o osso para um lado, e o músculo oposto o empurra de volta.", "Cada músculo empurra o osso para um lado, e o músculo oposto o empurra de volta, alternando a força o tempo todo."),
 ("Os dois músculos se contraem juntos o tempo todo; só a intensidade da força muda.", "Os dois músculos se contraem juntos o tempo todo; só a intensidade da força muda conforme o movimento desejado."),
 ("Os ossos é que dobram o cotovelo sozinhos, então a fraqueza dos músculos não explicaria o problema.", "Os ossos é que dobram o cotovelo sozinhos, então a fraqueza dos músculos não explicaria o problema do braço."),
 ("Os músculos empurram o osso como molas; sem uso, perderam a \"mola\" e o cotovelo não dobra.", "Os músculos empurram o osso como molas; sem uso, perderam a \"mola\" e por isso o cotovelo não consegue dobrar."),
 ("Os ossos recebem a ordem do cérebro e puxam os músculos para o salto acontecer.", "Os ossos recebem a ordem do cérebro e puxam os músculos, e é assim que o salto acontece no momento certo."),
 ("Os músculos percebem a bola e decidem sozinhos; os nervos só avisam o cérebro depois.", "Os músculos percebem a bola e decidem sozinhos; os nervos só avisam o cérebro depois que o movimento acontece."),
 ("Porque os ossos das pernas deixam de receber ordens e, por isso, deixam de puxar os músculos.", "Porque os ossos das pernas deixam de receber ordens do cérebro e, por isso, deixam de puxar os músculos."),
 ("Porque os músculos agem sem comando do sistema nervoso, e a lesão apenas enfraquece os ossos.", "Porque os músculos agem sem comando do sistema nervoso, e a lesão apenas enfraquece os ossos das pernas dele."),
 ("Todas elas, pois qualquer substância ingerida chega ao cérebro e altera o comportamento.", "Todas elas, pois qualquer substância ingerida chega ao cérebro e altera o comportamento de quem a consome."),
 ("A cafeína é psicoativa: estimula o sistema nervoso, aumentando o estado de alerta e podendo atrapalhar o sono.", "A cafeína é psicoativa: estimula o sistema nervoso, aumenta o alerta e pode atrapalhar o sono."),
 ("A cafeína age só no estômago, e o incômodo vem da digestão, não do sistema nervoso.", "A cafeína age só no estômago, e o incômodo vem da digestão do café, não do sistema nervoso da pessoa."),
 ("A cafeína é natural e de venda livre, por isso não atua no sistema nervoso.", "A cafeína é natural e de venda livre, por isso não atua no sistema nervoso nem muda o comportamento."),
 ("O álcool aumenta a força dos músculos, e a pessoa perde o controle da velocidade do carro.", "O álcool aumenta a força dos músculos, e a pessoa perde o controle da velocidade do carro por excesso de força."),
 ("A nicotina é psicoativa: o sistema nervoso se adapta a ela, e a falta causa desconforto, caracterizando dependência.", "A nicotina é psicoativa: o sistema nervoso se adapta a ela, e a falta causa desconforto, o que caracteriza dependência."),
 ("É falta de força de vontade, pois substâncias legais não alteram o funcionamento do sistema nervoso.", "É falta de força de vontade, pois substâncias vendidas legalmente não alteram o funcionamento do sistema nervoso de ninguém."),
 ("É coincidência: o cigarro é vendido legalmente e, por isso, não causa dependência.", "É coincidência: o cigarro é vendido legalmente e, por isso, não causa dependência nem altera o cérebro."),
 ("É falsa: o sistema nervoso em desenvolvimento é mais sensível, e o uso precoce aumenta os riscos, inclusive de dependência.", "É falsa: o sistema nervoso em desenvolvimento é mais sensível, e o uso precoce aumenta os riscos, como a dependência."),
 ("É verdadeira: adolescentes são mais resistentes, então os efeitos no sistema nervoso são menores.", "É verdadeira: adolescentes são mais resistentes que adultos, então os efeitos no sistema nervoso deles são bem menores."),
 ("É verdadeira apenas para bebidas vendidas legalmente, que não afetam o sistema nervoso.", "É verdadeira apenas para bebidas vendidas legalmente, que não afetam o sistema nervoso nem causam dependência."),
]
miss = 0
for a, b in R:
    if a in s: s = s.replace(a, b, 1); continue
    a2, b2 = a.replace('"', '\\"'), b.replace('"', '\\"')
    if a2 in s: s = s.replace(a2, b2, 1); continue
    miss += 1; print('NÃO ACHEI:', a[:60])
open(P, 'w', encoding='utf-8').write(s); print('trocas:', len(R) - miss, 'de', len(R))
