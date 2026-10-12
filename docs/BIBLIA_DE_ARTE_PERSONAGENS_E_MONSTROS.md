# PROVA ARCADE — Bíblia de arte: personagens, monstros, vilões e props

> Documento para você enviar ao GPT (ou a qualquer artista) junto com os seus esboços. Cada item tem: **papel no jogo, história, referência de arte, forma/cor, animações e um COMANDO pronto para o Blender**. Quando você mandar os esboços, o desenho de cada item é redefinido por inteiro; os nomes, papéis e animações abaixo continuam valendo para o jogo encaixar sem retrabalho.

---

## 0. COMANDO-MESTRE (cole isto primeiro, antes de qualquer item)

```
Você é artista 3D sênior de jogos 2D modernos (plataforma). Vou te passar esboços e uma
lista de personagens/monstros. Para cada item, modele no Blender (5.x) e RENDERIZE como
sprites 2D para um jogo de plataforma web.

ESTILO GERAL: "casual viral moderno" — formas arredondadas e grossas, silhueta legível a
30 px de altura, cores saturadas, brilho especular suave (acabamento de brinquedo/vinil),
olhos grandes e expressivos, contorno limpo, rim light colorido. Referências de linguagem:
Fall Guys (corpos "feijão"), Brawl Stars / Clash Royale (volumes grossos, rosto marcante),
Rayman Legends (2D vivo e luminoso), Ori and the Blind Forest (luz e brilho),
Kirby (simplicidade fofa com personalidade). Público: alunos de 11 a 18 anos; os vilões
devem parecer ameaçadores e "legais", nunca infantis demais; sem sangue, sem armas reais.
PROIBIDO copiar personagens existentes (nada de Mario, Sonic, Among Us etc.); apenas a
linguagem de forma/cor/animação.

TÉCNICA: low-poly suave (3k–12k triângulos por personagem), subdivisão leve, materiais
Principled BSDF (roughness 0.2–0.45, coat 0.4–0.8), emissão só em olhos/cristais/runas.
Câmera ORTOGRÁFICA, fundo transparente, vista 3/4 com o personagem virado -50° em Z
(olhando para a DIREITA da tela), luz principal sol 3.4 de cima-esquerda, rim azulado por
trás, preenchimento suave. Render Cycles CPU 24–48 amostras + denoise, PNG RGBA 8 bits,
256×256 px (heróis, monstros pequenos, moeda), 384×384 px (chefes), pés sempre na mesma
linha de base, margens iguais em todos os quadros.

COR DO JOGADOR: todo HERÓI tem UM material chamado "PlayerColor" (cor única do corpo).
Entregue cada herói em DUAS versões: P1 = azul #2F6BFF e P2 = laranja #FF6A2B
(o corpo inteiro assume essa cor; acessórios mantêm a cor própria). Isso é essencial para
os alunos nunca confundirem quem é P1 e P2.

ENTREGA: nome de arquivo  <tipo>_<nome>_<quadro>.png  (ex.: char_nina_p1_00.png) e uma
tira horizontal por animação. Ao final, liste os quadros gerados e os pivôs usados.
```

---

## 1. HISTÓRIA DO MUNDO (narrativa que amarra tudo, sem tocar no conteúdo da prova)

**Instituto Aurora** é um laboratório flutuante que guarda o **Núcleo do Saber**, uma esfera de luz que mantém o conhecimento do mundo organizado. Uma figura misteriosa, o **Doutor Entropia**, quer transformar tudo em "ruído": ideias embaralhadas, sinais cortados, luz apagada. Ele rachou o Núcleo e espalhou os pedaços em **três mundos**, cada um vigiado por um **Guardião** criado a partir de um defeito que ele mesmo inventou:

| Mundo | Guardião (chefe) | O que ele "estragou" |
|---|---|---|
| Caverna dos Cristais | **Colosso de Cristal** | a luz (o mundo ficou sem foco e sem cor nítida) |
| Ruínas dos Ossos | **Titã de Ossos** | o movimento (tudo travado, rígido, sem comando) |
| Floresta das Sinapses | **Hidra Sináptica** | os sinais (mensagens embaralhadas, cada cabeça fala uma coisa) |

Os jogadores são **Aprendizes do Instituto**. A assistente **AURA** envia "casos" (as perguntas) como transmissões de rádio do laboratório: resolver um caso religa um **portão de energia** e abre caminho. Derrotar o Guardião recupera um pedaço do Núcleo. No fim, o Doutor Entropia aparece só como silhueta numa tela (gancho para uma próxima temporada).

> Regra de design: **a história é entretenimento**. Chefes e monstros nunca fazem pergunta e nunca "corrigem" resposta. Nada do que acontece na luta altera a nota.

---

## 2. HERÓIS (4 jogáveis)

Todos: corpo "feijão" brilhante na cor do jogador, olhos grandes com brilho, mãos de luva branca, sapatos escuros. Altura em jogo ≈ 35 px; precisa ler bem pequeno.

### 2.1 NINA — "Cientista curiosa"
- **Papel:** a aprendiz que anota tudo; ideal para quem gosta de investigar.
- **História:** filha de dois pesquisadores do Instituto; encontrou o primeiro pedaço do Núcleo brilhando num armário e decidiu que ninguém ia apagá-lo.
- **Referência de arte:** corpo Fall Guys + acessórios de "cientista fofa" (Rayman/Kirby): cabelo castanho curto de lado, rabo de cavalo, **óculos de proteção grandes** sobre os olhos.
- **Forma/cor:** silhueta com rabo de cavalo atrás; óculos escuros arredondados; luvas brancas; faixa preta nos óculos.
- **Animações (loop/quadros):** parada 2q respirando · correr 6q · pulo 1q (braços para cima) · queda 1q · dano 1q (braços abertos, inclinada para trás) · vitória 4q (opcional).
- **COMANDO BLENDER:** `Modele "Nina": corpo feijão (esfera 0.56×0.50×0.72 m, centro z=0.95) no material PlayerColor; olhos grandes brancos com pupila preta e brilho; óculos de proteção redondos (dois anéis pretos + faixa) sobre os olhos; cabelo castanho curto + rabo de cavalo; luvas brancas; sapatos escuros. Renderize 11 quadros em P1 e P2 conforme o COMANDO-MESTRE: idle×2, run×6, jump, fall, hurt.`

### 2.2 TÉO — "Explorador veloz"
- **Papel:** o mais ágil; boné e fones, estilo "rapaz urbano".
- **História:** entregador de recados do Instituto; conhece todos os atalhos e perdeu o "ritmo" quando o Doutor Entropia cortou a música do laboratório.
- **Referência:** Brawl Stars (volumes grossos, boné marcante) + Fall Guys.
- **Forma/cor:** **boné amarelo com aba larga** para a frente, **fones de ouvido** (arco preto + conchas vermelhas), olhos grandes.
- **Animações:** idem Nina; corrida com leve inclinação para a frente.
- **COMANDO BLENDER:** `Modele "Téo": corpo feijão PlayerColor; boné amarelo (calota achatada + aba larga 0.25 m) ; fones: arco fino preto passando por cima da cabeça e duas conchas vermelhas nas laterais; olhos grandes; luvas brancas. 11 quadros × P1/P2.`

### 2.3 BYTE — "Robô gentil"
- **Papel:** a opção "tech"; passa confiança e calma.
- **História:** construído por AURA para ser o "braço" dela nas fases; tem uma única missão, proteger os aprendizes. Fala em bipes.
- **Referência:** WALL-E/BB-8 (simpatia), Fall Guys (volume), Brawl Stars (robôs brincalhões).
- **Forma/cor:** corpo feijão PlayerColor com **visor preto brilhante embutido** na frente (dois olhos de LED ciano) , antena fina com bulbo vermelho, parafusos metálicos nas laterais, faixa escura na cintura.
- **Animações:** idem; no dano o visor mostra "> <" (opcional).
- **COMANDO BLENDER:** `Modele "Byte": corpo feijão PlayerColor; visor retangular arredondado embutido (preto brilhante, quase rente ao corpo) com dois LEDs ciano emissivos; antena (cilindro fino + esfera vermelha emissiva); parafusos metálicos nas laterais; sem boca. 11 quadros × P1/P2.`

### 2.4 RAPOSA — "Ágil e esperta"
- **Papel:** a opção "bichinho"; carismática.
- **História:** mascote do Instituto; escapou de um experimento do Doutor Entropia e agora ajuda quem entra no laboratório.
- **Referência:** Crash/Spyro (mascotes expressivos) em volume Fall Guys; orelhas triangulares Kirby-like.
- **Forma/cor:** corpo na cor do jogador, **orelhas pontudas** com interior escuro, **focinho e peito branco**, **rabo grosso com ponta branca** que balança.
- **Animações:** idem; rabo com movimento secundário (balanço) em todos os quadros.
- **COMANDO BLENDER:** `Modele "Raposa": corpo feijão PlayerColor; duas orelhas cônicas com interior escuro; focinho branco com nariz preto; barriga/peito branco; rabo de 3 esferas com ponta branca animado em balanço. 11 quadros × P1/P2.`

---

## 3. ASSISTENTE

### 3.1 AURA — "Assistente do Instituto"
- **Papel:** quem "entrega" as perguntas; precisa parecer uma personagem amiga, nunca um professor.
- **História:** IA do laboratório, protege o Núcleo; só consegue falar por transmissões curtas (os "casos").
- **Referência:** EVE (WALL-E), BB-8, hologramas suaves de Ori (brilho).
- **Forma/cor:** cabeça esférica branca cerâmica, **visor escuro com olhos de LED ciano**, **anel de energia ciano** em volta do corpo (tipo Saturno, ABAIXO do rosto), cone luminoso embaixo (flutua), mãozinhas esféricas.
- **Animações:** flutuar (balanço vertical 24q em loop) · falar (olhos piscam 4q) · sorrir (opcional).
- **COMANDO BLENDER:** `Modele "AURA": esfera branca cerâmica 0.62 m, visor retangular escuro embutido com dois LEDs ciano, anel de energia ciano emissivo em volta do corpo (inclinação 10°), cone luminoso transparente embaixo, duas mãos esféricas. Render 256×256: quadro 0 idle, quadros 1–4 piscando.`

---

## 4. VILÃO PRINCIPAL (aparece só em cena)

### 4.1 DOUTOR ENTROPIA
- **Papel:** antagonista; surge em silhueta nas telas de transição ("ele está olhando").
- **História:** ex-pesquisador do Instituto que se convenceu de que "saber demais cansa": quer apagar o Núcleo para o mundo ficar "em silêncio". Cada Guardião é um defeito que ele inventou.
- **Referência:** vilões elegantes e teatrais (Dr. Facilier, Syndrome) em versão silhueta; capa longa, cartola de lente quebrada, mãos de névoa roxa.
- **Forma/cor:** silhueta alta e fina, capa rasgada que vira fumaça, monóculo rachado que brilha magenta, roxo/preto com detalhes magenta (#FF4FD8).
- **Animações:** só silhueta em 3 poses (observando, rindo, recuando) para uso em telas.
- **COMANDO BLENDER:** `Modele "Doutor Entropia" apenas como silhueta/estatueta alta: cartola com lente quebrada, capa longa se desfazendo em fumaça, monóculo magenta emissivo. Render 512×768 transparente, 3 poses.`

---

## 5. CHEFES / GUARDIÕES (3) — com padrão de ataque (já programado no jogo)

Todos: tamanho 384×384, 3 quadros: **idle · tele (preparando ataque, brilha vermelho/laranja) · stun (atordoado, olhos apagados)**. Altura em jogo ≈ 66 px. Vida: 3 pisões (2 no modo rápido). **Vencer dá moedas e abre a saída; não tem pergunta.**

### 5.1 COLOSSO DE CRISTAL — Mundo 1
- **História:** um golem de uma antiga mina de prismas; o Doutor Entropia lhe tirou o "foco", então ele só enxerga vultos e ataca tudo o que se mexe.
- **Referência:** Rock Golem estilo Clash Royale + cristais de Hollow Knight (Crystal Peak) em versão colorida/limpa.
- **Forma/cor:** torso em bloco arredondado de rocha roxa escura (#2E2560), ombros esféricos, **núcleo e rachaduras ciano brilhantes (#7DF9FF)**, **cristais ciano/magenta nas costas e ombros**, cabeça pequena de bloco com **olhos amarelos emissivos e sobrancelhas pesadas**, punhos enormes.
- **Ataque (jogo):** anda → treme e brilha **vermelho** (aviso) → **investida em linha reta** → bate na parede e fica zonzo.
- **Fraqueza:** pisar na cabeça.
- **COMANDO BLENDER:** `Modele "Colosso de Cristal" (golem de rocha roxa com cristais ciano/magenta, olhos amarelos emissivos, núcleo ciano no peito com rachaduras luminosas). 3 poses: idle, tele (braços para o alto, cristais e rachaduras VERMELHOS emissivos), stun (cabeça baixa, olhos apagados cinza). Render 384×384.`

### 5.2 TITÃ DE OSSOS — Mundo 2
- **História:** o esqueleto de um animal gigante de um museu; Entropia soprou "vida" nele, mas sem os nervos: ele se move por impulso, em saltos.
- **Referência:** Bone Dragon/Skeleton King estilo Clash Royale + Hollow Knight (insetos de osso) com acabamento limpo.
- **Forma/cor:** **crânio grande com chifres longos e mandíbula com presas**, **olhos fundos com brilho laranja**, caixa torácica de costelas com **núcleo laranja** dentro, braços longos de osso com **garras**, osso marfim (#EADFC2) e sombras quentes.
- **Ataque (jogo):** anda → agacha e brilha **vermelho** → **salta** e, ao cair, solta **duas ondas de choque no chão** que o jogador pula.
- **COMANDO BLENDER:** `Modele "Titã de Ossos": esqueleto bípede curvado, crânio com chifres e presas, olhos laranja emissivos em órbitas fundas, caixa torácica de 5 costelas com núcleo laranja, braços longos com garras. Poses: idle, tele (agachado, olhos e núcleo VERMELHOS), stun (curvado, olhos apagados). 384×384.`

### 5.3 HIDRA SINÁPTICA — Mundo 3
- **História:** nasceu de uma floresta de fibras luminosas; cada cabeça repete uma "mensagem" diferente, e elas brigam entre si: a hidra não sabe qual sinal seguir.
- **Referência:** hidras de Brawl Stars/Clash + neon de Avatar (floresta bioluminescente), tentáculos/dendritos.
- **Forma/cor:** corpo gelatinoso magenta/roxo (#A82AE0) com **espinhos escuros**, **3 pescoços longos com cabeças grandes**, olhos verdes neon (#7DFFA3) com sobrancelhas furiosas, bocas com presas; pontos de luz ao longo do corpo como "sinapses".
- **Ataque (jogo):** pausa → cabeça central abre a boca com luz laranja → **dispara orbes verdes** (um alto, um baixo; o jogador passa por baixo ou pula).
- **COMANDO BLENDER:** `Modele "Hidra Sináptica": corpo gelatinoso roxo-magenta com espinhos, três pescoços em S e três cabeças com presas e olhos verdes emissivos, pontos de luz tipo sinapse. Poses: idle, tele (cabeça central com boca aberta e brilho laranja), stun (pescoços caídos, olhos apagados). 384×384.`

---

## 6. MONSTROS COMUNS (por mundo: 1 terrestre + 1 voador) — 256×256, 2 quadros cada

> Dano por contato; **vencem-se pisando por cima**. Barra de vida: monstros comuns morrem em 1 pisão (sem barra); só os chefes têm barra.

| Mundo | Terrestre | Voador |
|---|---|---|
| Campo de Treino | **Sentinela** (robô-cúpula) | **Drone** |
| Caverna dos Cristais | **Aranha de Cristal** | **Espectro** |
| Ruínas dos Ossos | **Crânio Rastejante** | **Abutre de Ossos** |
| Floresta das Sinapses | **Parasita Esporo** | **Fogo-fátuo** |

### 6.1 SENTINELA (Campo de Treino)
- **História:** robô de segurança do pátio de treino, programado para "afastar visitantes"; só sabe patrulhar.
- **Referência:** robôs-cúpula de Clash Royale/Brawl Stars; visor vermelho de "inimigo bobo mas sério".
- **Forma/cor:** cúpula de metal azul-aço, **faixa-visor vermelha emissiva com sobrancelhas pretas bravas**, 4 perninhas esféricas, antena com bulbo vermelho.
- **Animação:** 2q andando (pernas alternando). **COMANDO:** `Modele "Sentinela": cúpula metálica azul-aço, visor vermelho emissivo com sobrancelhas, 4 pernas, antena. 2 quadros de caminhada.`

### 6.2 DRONE (Campo de Treino)
- **Forma/cor:** esfera branca, **olho vermelho único** com sobrancelha, **hélice no topo e dois rotores laterais**. **Animação:** 2q (hélice em ângulos diferentes). **COMANDO:** `Modele "Drone": esfera branca, olho vermelho emissivo, hélice no topo e dois rotores. 2 quadros.`

### 6.3 ARANHA DE CRISTAL (Caverna)
- **História:** aranha que se alimenta de luz; os cristais nas costas crescem a cada luz que ela rouba.
- **Referência:** aranhas de Hollow Knight/Terraria em versão "toy"; cristais ciano.
- **Forma/cor:** corpo violeta escuro, **fileira de cristais ciano emissivos nas costas**, **olhos rosa brilhantes**, 8 pernas finas com pontas ciano. **Animação:** 2q (pernas alternando). **COMANDO:** `Modele "Aranha de Cristal": corpo violeta, cristais ciano emissivos nas costas, olhos rosa emissivos, 8 pernas. 2 quadros.`

### 6.4 ESPECTRO (Caverna)
- **História:** eco de um explorador perdido na caverna; só quer companhia (mas machuca).
- **Forma/cor:** corpo-gota violeta com cauda pontuda, **olhos ciano brilhantes**, **duas asas de cristal ciano translúcidas**. **Animação:** 2q (asas para cima/baixo). **COMANDO:** `Modele "Espectro": corpo-gota violeta, olhos ciano emissivos, duas asas de cristal ciano. 2 quadros (asas altas/baixas).`

### 6.5 CRÂNIO RASTEJANTE (Ruínas)
- **História:** crânio de um explorador que "esqueceu" o corpo; anda sobre os próprios ossos da coluna.
- **Forma/cor:** **crânio marfim grande** com **órbitas pretas e pupilas laranja**, **mandíbula que abre e fecha**, perninhas de osso, sobrancelha de osso. **Animação:** 2q (mandíbula + passos). **COMANDO:** `Modele "Crânio Rastejante": crânio marfim com órbitas pretas e pupilas laranja emissivas, mandíbula móvel, 4 pernas de osso. 2 quadros.`

### 6.6 ABUTRE DE OSSOS (Ruínas)
- **Forma/cor:** corpo marrom-escuro, **cabeça de crânio com bico dourado**, olhos laranja, **asas com costelas de osso**. **Animação:** 2q (batida de asa). **COMANDO:** `Modele "Abutre de Ossos": corpo marrom, cabeça-crânio com bico dourado, asas de costelas. 2 quadros.`

### 6.7 PARASITA ESPORO (Floresta)
- **História:** esporo que se agarrou a uma fibra luminosa e aprendeu a andar.
- **Forma/cor:** corpo gelatinoso **magenta brilhante**, **um olho grande ciclope**, **pontos verdes luminosos** nas costas, 3 tentáculos curtos. **Animação:** 2q (squash/stretch). **COMANDO:** `Modele "Parasita Esporo": corpo gelatinoso magenta, olho grande único, pontos verdes emissivos, 3 tentáculos. 2 quadros com squash.`

### 6.8 FOGO-FÁTUO (Floresta)
- **Forma/cor:** orbe branco-esverdeado luminoso com **olhos escuros grandes** e **cauda de bolhas verdes**. **Animação:** 2q (cauda ondulando). **COMANDO:** `Modele "Fogo-fátuo": orbe luminoso verde-água com olhos escuros e cauda de bolhas. 2 quadros.`

---

## 7. OBSTÁCULOS E MECÂNICAS DE FASE (arte necessária)

| Item | Função | Arte pedida |
|---|---|---|
| **Espinhos** | dano por contato | cristais/espinhos metálicos em trio, ponta vermelha |
| **Serra giratória** | dano, movimento em trilho | disco serrilhado metálico com cubo central; 4 quadros girando |
| **Plataforma móvel** | carrega o jogador | laje com luz embaixo |
| **Plataforma que cai** | desmorona 0,4 s depois do pisão | laje rachada |
| **Plataforma que pisca** | aparece/some em ciclo | laje translúcida com contorno brilhante |
| **Mola** | lança o jogador para cima | mola de bobina com cabeça colorida; 3 quadros (solta, comprimida, esticada) |
| **Portal secreto** | leva à fase secreta | arco de energia dourado com estrela |
| **Checkpoint** | salva o ponto | bandeira com mastro de luz |
| **Portão de energia** | liga após cada "caso" | barreira ciano com pilares |

---

## 8. COLETÁVEIS E ECONOMIA (a arte precisa deixar claro para que serve)

| Item | Para que serve (regra do jogo) | Arte |
|---|---|---|
| **Moeda** | +10 pontos; **a cada 25 moedas ganha 1 coração** (até 5) | moeda dourada 3D girando (8 quadros) |
| **Estrela do Saber** (3 por fase, escondidas) | +100 pontos e **1 escudo dourado** (absorve 1 dano); achar as 3 libera a medalha "Estrelada" | estrela 3D girando (8 quadros) |
| **Coração** | +1 vida (até 5); aparece em fase secreta e como recompensa de chefe | coração 3D brilhante |
| **Escudo** | aura dourada ao redor do herói até levar 1 dano | bolha dourada translúcida |
| **Pontos** | só diversão: viram **medalha** (bronze/prata/ouro) e ranking da turma; **nunca** entram na nota | — |

---

## 9. INTERFACE (identidade visual)

- **Fonte de títulos:** Lilita One (livre). **Texto:** Nunito (livre).
- **P1 = azul #2F6BFF · P2 = laranja #FF6A2B** em moldura, marcador, tela de vez e botões.
- **Blocos de resposta:** A = amarelo ● · B = verde ■ · C = roxo ▲ (cor + forma + letra, para daltonismo e para quem não lê).
- **Barra de vida (corações)** no canto superior; **barra de vida do chefe** no centro; **contador de moedas com progresso até o próximo coração**.

---

## 10. CHECKLIST DE ENTREGA PARA O GPT/BLENDER

1. 4 heróis × 2 cores × 11 quadros (idle×2, run×6, jump, fall, hurt).
2. AURA (5 quadros) e Doutor Entropia (3 poses).
3. 3 chefes × 3 quadros (idle, tele, stun).
4. 8 monstros comuns × 2 quadros.
5. Props: moeda×8, estrela×8, coração, escudo, 3 blocos de resposta (normal e aceso), serra×4, mola×3, portal secreto.
6. Atlas: uma tira horizontal por animação, pés na mesma linha de base, fundo transparente.

*Quando você tiver os esboços, envie junto com este documento; o desenho final substitui o atual sem mudar o jogo.*
