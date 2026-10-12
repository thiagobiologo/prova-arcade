# Prompts para o GPT — arte do DEMO no estilo da Raposa

Cada prompt gera **uma folha** com fundo **magenta liso**. Anexe sempre: (1) a **folha da Raposa** (referência de estilo/layout) e (2) a **ficha do personagem** que você já gerou. Depois rode o comando de encaixe (no fim de cada item). O jogo recorta o fundo magenta sozinho.

## Regras que valem para todas as folhas
- Fundo **#FF00FF** liso, sem sombra no chão e sem texto.
- Todos os quadros na **mesma escala** e com os **pés na mesma linha**.
- Personagem virado para a **direita** (o jogo espelha sozinho).
- Resolução: peça a folha em **2048 px de largura ou mais** (a Raposa saiu com 1448 px; quanto maior, mais nítido no celular).
- Não peça sombras projetadas nem cenário: atrapalham o recorte.
- Se o GPT desenhar o fundo com degradê ou sombra, peça: *"refaça com fundo magenta #FF00FF totalmente chapado"*.

## Estilo (cole no início de TODO prompt)
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.
```

## 1) Heróis — folha 4×3 (11 quadros)
Ordem dos quadros (esquerda→direita, cima→baixo): **1** parado · **2** parado B (piscada ou respiro) · **3–8** corrida em ciclo completo (6 quadros, pés alternando) · **9** pulo (subindo) · **10** queda (descendo) · **11** dano (encolhido/deitado).

### NINA — cientista curiosa
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Personagem: menina de cabelo castanho preso em rabo de cavalo, óculos redondos de armação preta, jaleco branco sobre roupa escura, mochila com tubo luminoso ciano, luvas brancas, carrega um tubo de ensaio com brilho ciano.
Folha 4 colunas × 3 linhas (11 quadros; o 12º fica vazio): 1 parado; 2 parado B (piscada); 3 a 8 corrida (6 quadros, ciclo completo); 9 pulo subindo; 10 queda descendo; 11 dano (encolhido).
Manter exatamente o design, as cores e os acessórios da ficha anexa.
```
Encaixe: `python tools/pack_sheet.py <folha.png> char_nina 4 3 11`

### TÉO — explorador veloz
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Personagem: menino de cabelo castanho, boné amarelo com o símbolo ∧, fones de ouvido vermelhos, jaqueta amarela, calça escura, tênis amarelo e preto, mochila com tela ciano.
Folha 4 colunas × 3 linhas (11 quadros; o 12º fica vazio): 1 parado; 2 parado B (piscada); 3 a 8 corrida (6 quadros, ciclo completo); 9 pulo subindo; 10 queda descendo; 11 dano (encolhido).
Manter exatamente o design, as cores e os acessórios da ficha anexa.
```
Encaixe: `python tools/pack_sheet.py <folha.png> char_teo 4 3 11`

### BYTE — robô de proteção
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Personagem: robô redondo amarelo de corpo arredondado, visor preto com dois LEDs ciano verticais, antena fina com LED vermelho, faixa escura na cintura, parafusos laterais; flutua/anda sobre um pequeno propulsor, sem pernas longas (pode ter 2 pés pequenos).
Folha 4 colunas × 3 linhas (11 quadros; o 12º fica vazio): 1 parado; 2 parado B (piscada); 3 a 8 corrida (6 quadros, ciclo completo); 9 pulo subindo; 10 queda descendo; 11 dano (encolhido).
Manter exatamente o design, as cores e os acessórios da ficha anexa.
```
Encaixe: `python tools/pack_sheet.py <folha.png> char_byte 4 3 11`

## 2) Monstros — folha 2×1 (2 quadros de andar/voar)
Quadro 1 e 2 = ciclo de movimento (pernas/asas alternando). Mesmo estilo, fundo magenta.

### Sentinela
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Sentinela. Design: Cúpula de metal azul-aço, faixa-visor vermelha emissiva com sobrancelhas pretas bravas, 4 perninhas esféricas, antena com bulbo vermelho.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_sentinel 2 1 2`

### Aranha de Cristal
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Aranha de Cristal. Design: Corpo violeta escuro, fileira de cristais ciano emissivos nas costas, olhos rosa brilhantes, 8 pernas finas com pontas ciano.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_spider 2 1 2`

### Crânio Rastejante
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Crânio Rastejante. Design: Crânio marfim grande, órbitas pretas com pupilas laranja, mandíbula que abre e fecha, perninhas de osso, sobrancelha de osso.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_skull 2 1 2`

### Parasita Esporo
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Parasita Esporo. Design: Corpo gelatinoso magenta brilhante, um olho grande ciclope, pontos verdes luminosos nas costas, 3 tentáculos curtos.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_spore 2 1 2`

### Drone
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Drone. Design: Esfera branca, olho vermelho único com sobrancelha, hélice no topo e dois rotores laterais.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_drone 2 1 2`

### Espectro
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Espectro. Design: Corpo-gota violeta com cauda pontuda, olhos ciano brilhantes, duas asas de cristal ciano translúcidas.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_wraith 2 1 2`

### Abutre de Ossos
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Abutre de Ossos. Design: Corpo marrom escuro, cabeça de crânio com bico dourado, olhos laranja, asas com costelas de osso.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_vulture 2 1 2`

### Fogo-Fátuo
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Monstro: Fogo-Fátuo. Design: Orbe branco-esverdeado luminoso com olhos escuros grandes e cauda de bolhas verdes.
Folha 2 colunas × 1 linha: quadro 1 e quadro 2 = ciclo de movimento. Visual de inimigo "bravo mas simpático", legível em 25 px.
```
Encaixe: `python tools/pack_sheet.py <folha.png> en_wisp 2 1 2`

## 3) Chefões — folha 3×1 (3 quadros)
Quadro 1 **parado/respirando** · quadro 2 **preparando o ataque** (corpo tenso, olhos vermelhos, avisa o jogador) · quadro 3 **exausto** (ajoelhado/cabeça baixa, **ponto fraco brilhando amarelo** no peito ou nuca: é quando o jogador pode pisar).

### Colosso de Cristal
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Chefão: Colosso de Cristal. Design: Torso em bloco arredondado de rocha roxa escura (#2E2560), ombros esféricos, núcleo e rachaduras ciano brilhantes, cristais ciano/magenta nas costas, cabeça de bloco com olhos amarelos emissivos e sobrancelhas pesadas, punhos enormes.
Grande, imponente, cara de chefão de verdade. Folha 3 colunas × 1 linha: 1 parado; 2 preparando ataque; 3 exausto com ponto fraco amarelo brilhando.
```
Encaixe: `python tools/pack_sheet.py <folha.png> boss_colossus 3 1 3`

### Titã de Ossos
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Chefão: Titã de Ossos. Design: Crânio grande com chifres longos e mandíbula com presas, olhos fundos com brilho laranja, caixa torácica de costelas com núcleo laranja, braços longos com garras, osso marfim (#EADFC2).
Grande, imponente, cara de chefão de verdade. Folha 3 colunas × 1 linha: 1 parado; 2 preparando ataque; 3 exausto com ponto fraco amarelo brilhando.
```
Encaixe: `python tools/pack_sheet.py <folha.png> boss_titan 3 1 3`

### Hidra Sináptica
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

Chefão: Hidra Sináptica. Design: Corpo gelatinoso magenta/roxo (#A82AE0) com espinhos escuros, 3 pescoços longos com cabeças grandes, olhos verdes neon com sobrancelhas furiosas, bocas com presas, pontos de luz como "sinapses".
Grande, imponente, cara de chefão de verdade. Folha 3 colunas × 1 linha: 1 parado; 2 preparando ataque; 3 exausto com ponto fraco amarelo brilhando.
```
Encaixe: `python tools/pack_sheet.py <folha.png> boss_hydra 3 1 3`

## 4) AURA (guia holográfica) — folha 2×1
```
MESMO ESTILO da folha da Raposa que anexei: ilustração 3D-cartoon pintada à mão, lúdica e artística, proporção fofa (cabeça grande), contorno suave, pelagem/tecido com textura e luz de contorno quente, olhos grandes e expressivos, cores saturadas, silhueta limpa e legível em tamanho pequeno. Personagem inteiro em cada quadro, mesma escala e MESMA linha do chão (pés na mesma altura) em todos os quadros, virado para a DIREITA. Fundo MAGENTA LISO #FF00FF (sem gradiente, sem sombra no chão, sem texto, sem moldura), quadros separados por uma linha branca fina.

AURA: orbe branco luminoso com rostinho simpático e um anel inclinado em volta (estilo Saturno), flutuando. Quadro 1 e 2 = flutuação (anel girando, brilho pulsando).
```
Encaixe: `python tools/pack_sheet.py <folha.png> aura 2 1 2`

## Depois de encaixar
1. Recarregue o jogo (Ctrl+F5).
2. Veja o personagem na tela de abertura e numa fase.
3. Se algum quadro ficar torto, regenere só aquela folha.

**Limite honesto:** a qualidade final depende da folha que o GPT entregar. Se o fundo vier com degradê, os quadros vierem em escalas diferentes ou os pés em alturas diferentes, o recorte funciona mas o movimento fica 'pulando'. Nesse caso peça de novo reforçando 'mesma escala e mesma linha do chão'.
