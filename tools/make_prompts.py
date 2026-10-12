# Gera o caderno de prompts (estilo da Raposa) para o GPT: folhas com fundo magenta, prontas para o jogo.  © Thiago Silva.
import os, re
DESK = os.path.join(os.path.expanduser('~'), 'Desktop'); ART = os.path.join(DESK, 'ARTE_PROVA_ARCADE')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def forma(folder):
    f = os.path.join(ART, folder, 'HISTORIA_E_REFERENCIA.md')
    if not os.path.exists(f): return ''
    t = open(f, encoding='utf-8').read(); m = re.search(r'## Forma e cor\n(.+?)\n\n', t, re.S)
    return m.group(1).strip() if m else ''

STYLE = ("MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), "
         "contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. "
         "Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. "
         "Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.")

HEROES = [
 ('char_nina', 'NINA — cientista curiosa', '01_Herois/Nina', "menina de cabelo castanho preso em rabo de cavalo, óculos redondos de armação preta, jaleco branco sobre roupa escura, mochila com tubo luminoso ciano, luvas brancas, carrega um tubo de ensaio com brilho ciano"),
 ('char_teo', 'TÉO — explorador veloz', '01_Herois/Teo', "menino de cabelo castanho, boné amarelo com o símbolo ∧, fones de ouvido vermelhos, jaqueta amarela, calça escura, tênis amarelo e preto, mochila com tela ciano"),
 ('char_byte', 'BYTE — robô de proteção', '01_Herois/Byte', "robô redondo amarelo de corpo arredondado, visor preto com dois LEDs ciano verticais, antena fina com LED vermelho, faixa escura na cintura, parafusos laterais; flutua/anda sobre um pequeno propulsor, sem pernas longas (pode ter 2 pés pequenos)"),
]
ENEMIES = [('en_sentinel', 'Sentinela', '03_Monstros/Sentinela'), ('en_spider', 'Aranha de Cristal', '03_Monstros/Aranha_de_Cristal'), ('en_skull', 'Crânio Rastejante', '03_Monstros/Cranio_Rastejante'),
           ('en_spore', 'Parasita Esporo', '03_Monstros/Parasita_Esporo'), ('en_drone', 'Drone', '03_Monstros/Drone'), ('en_wraith', 'Espectro', '03_Monstros/Espectro'),
           ('en_vulture', 'Abutre de Ossos', '03_Monstros/Abutre_de_Ossos'), ('en_wisp', 'Fogo-Fátuo', '03_Monstros/Fogo_Fatuo')]
BOSSES = [('boss_colossus', 'Colosso de Cristal', '04_Chefoes/Colosso_de_Cristal'), ('boss_titan', 'Titã de Ossos', '04_Chefoes/Tita_de_Ossos'), ('boss_hydra', 'Hidra Sináptica', '04_Chefoes/Hidra_Sinaptica')]

o = []
o.append("# Prompts para o GPT — arte do DEMO no estilo da Raposa\n")
o.append("Cada prompt gera **uma folha** com fundo **magenta liso**. Anexe sempre: (1) a **folha da Raposa** (referência de estilo/layout) e (2) a **ficha do personagem** que você já gerou. Depois rode o comando de encaixe (no fim de cada item). O jogo recorta o fundo magenta sozinho.\n")
o.append("## Regras que valem para todas as folhas\n- Fundo **#FF00FF** liso, sem sombra no chão e sem texto.\n- Todos os quadros na **mesma escala** e com os **pés na mesma linha**.\n- Personagem virado para a **direita** (o jogo espelha sozinho).\n- Resolução: peça a folha em **2048 px de largura ou mais** (a Raposa saiu com 1448 px; quanto maior, mais nítido no celular).\n- Não peça sombras projetadas nem cenário: atrapalham o recorte.\n- Se o GPT desenhar o fundo com degradê ou sombra, peça: *\"refaça com fundo magenta #FF00FF totalmente chapado\"*.\n")
o.append("## Estilo (cole no início de TODO prompt)\n```\n" + STYLE + "\n```\n")
o.append("## 1) Heróis — folha 4×3 (11 quadros)\nOrdem dos quadros (esquerda→direita, cima→baixo): **1** parado · **2** parado B (piscada ou respiro) · **3–8** corrida em ciclo completo (6 quadros, pés alternando) · **9** pulo (subindo) · **10** queda (descendo) · **11** dano (encolhido/deitado).\n")
for nm, title, folder, desc in HEROES:
    o.append(f"### {title}\n```\n{STYLE}\n\nPersonagem: {desc}.\nFolha 4 colunas × 3 linhas (11 quadros; o 12º fica vazio): 1 parado; 2 parado B (piscada); 3 a 8 corrida (6 quadros, ciclo completo); 9 pulo subindo; 10 queda descendo; 11 dano (encolhido).\nManter exatamente o design, as cores e os acessórios da ficha anexa.\n```\nEncaixe: `python tools/pack_sheet.py <folha.png> {nm} 4 3 11`\n")
o.append("## 2) Monstros — folha 2×1 (2 quadros de andar/voar)\nQuadro 1 e 2 = ciclo de movimento (pernas/asas alternando). Mesmo estilo, fundo magenta.\n")
for nm, title, folder in ENEMIES:
    o.append(f"### {title}\n```\n{STYLE}\n\nMonstro: {title}. Design: {forma(folder)}\nFolha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo \"bravo mas simpático\", legível em 25 px.\n```\nEncaixe: `python tools/pack_sheet.py <folha.png> {nm} 2 1 2`\n")
o.append("## 3) Chefões — folha 3×1 (3 quadros)\nQuadro 1 **parado/respirando** · quadro 2 **preparando o ataque** (corpo tenso, olhos vermelhos, avisa o jogador) · quadro 3 **exausto** (ajoelhado/cabeça baixa, **ponto fraco brilhando amarelo** no peito ou nuca: é quando o jogador pode pisar).\n")
for nm, title, folder in BOSSES:
    o.append(f"### {title}\n```\n{STYLE}\n\nChefão: {title}. Design: {forma(folder)}\nGrande, imponente, cara de chefão de verdade. Folha 3 colunas × 1 linha: 1 parado; 2 preparando ataque; 3 exausto com ponto fraco amarelo brilhando.\n```\nEncaixe: `python tools/pack_sheet.py <folha.png> {nm} 3 1 3`\n")
o.append("## 4) AURA (guia holográfica) — folha 2×1\n```\n" + STYLE + "\n\nAURA: orbe branco luminoso com rostinho simpático e um anel inclinado em volta (estilo Saturno), flutuando. Quadro 1 e 2 = flutuação (anel girando, brilho pulsando).\n```\nEncaixe: `python tools/pack_sheet.py <folha.png> aura 2 1 2`\n")
o.append("## Depois de encaixar\n1. Recarregue o jogo (Ctrl+F5).\n2. Veja o personagem na tela de abertura e numa fase.\n3. Se algum quadro ficar torto, regenere só aquela folha.\n\n**Limite honesto:** a qualidade final depende da folha que o GPT entregar. Se o fundo vier com degradê, os quadros vierem em escalas diferentes ou os pés em alturas diferentes, o recorte funciona mas o movimento fica 'pulando'. Nesse caso peça de novo reforçando 'mesma escala e mesma linha do chão'.\n")
txt = '\n'.join(o)
open(os.path.join(ROOT, 'docs', 'PROMPTS_ARTE_DEMO_ESTILO_RAPOSA.md'), 'w', encoding='utf-8').write(txt)
open(os.path.join(ART, '00_PROMPTS_DEMO_ESTILO_RAPOSA.md'), 'w', encoding='utf-8').write(txt)
print(len(txt), 'bytes')
