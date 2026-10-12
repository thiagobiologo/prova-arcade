# Prova Arcade — protótipo (demo)

© Thiago Silva. Todos os direitos reservados. Uso restrito a licenciados.
Conteúdo do demo: **Ciências · 6º ano · 3º bimestre** (EF06CI08, EF06CI09, EF06CI10 — Currículo Paulista / Habilidades Essenciais, SEDUC-SP).

## 0. Duas edições do mesmo jogo

| | **PREMIUM (vitrine)** | **PESQUISA (aplicação em sala)** |
|---|---|---|
| Para quê | diretoria de ensino, LinkedIn, congresso, apresentação comercial | coletar dados reais dos alunos e sustentar o projeto cientificamente |
| Personagem | só a **Raposa** | 4 personagens à escolha |
| Fases | treino + **2 fases** (cada uma com chefão) | treino + **3 fases** (cada uma com chefão) |
| Tela inicial | selo "Edição demonstração · Premium" + 3 diferenciais | sobria, só o jogo |
| Painel | o mesmo (BI, modais, Excel, PDF) | o mesmo |

A edição é uma propriedade da **licença** (Central de Gestão → Licenças e uso → coluna *Edição*; botão *Trocar edição*). A licença da gestora está como **PREMIUM**; a do autor como **PESQUISA**. Quem entra por QR Code herda a edição da licença da aplicação.

## 0.1 Regras novas de jogo (valem nas duas edições)
* **Vida curta**: começa com **2 corações** (máx. 3); **40 moedas = +1 coração**. Cair em buraco, serra ou espinho custa vida de verdade.
* **Chefões de verdade**: 4 a 8 pontos de vida (conforme o chefão e o modo), maiores, **blindados** a maior parte do tempo — só dá para pisar quando ele fica **exausto** (ponto fraco aceso, aviso "PISE AGORA!"). Pisar fora da hora só quica ("BLINDADO!"). Na metade da vida ele entra em **FÚRIA**: mais rápido, ataca em sequência e **chovem pedras** com aviso vermelho no chão.
* **Saída da fase** redesenhada: arco de pedra de pé no chão (selado enquanto o chefão está vivo; abre com energia dourada e a seta "SAÍDA").
* **Tela em pé (vertical)**: o jogo agora também roda com o celular em pé (tela cheia, mundo mais alto, painel da AURA no alto, botões embaixo). Na horizontal continua como antes.
* **Pergunta dentro do jogo**: o caso da AURA vira um **painel holográfico ligado à AURA** (feixe de luz da AURA até o balão), e a alternativa do bloco/barril/balão mais próximo **acende no painel** enquanto o aluno chega perto dele.
* Plataformas no ar ganharam **base de rocha** (não parecem soltas).

## 0.2 Terceira rodada (pergunta integrada, fases verticais, demo rastreada)
* **Pergunta como mecânica** — as 3 alternativas ficam trancadas e só se leem chegando perto de cada objeto; só dá para responder depois de ouvir as 3 versões (+6 moedas de recompensa). Estratégia e fontes em `docs/ESTRATEGIA_PERGUNTA_NO_JOGO.md`.
* **Fases mais difíceis e verticais** — *torre-muro* (o chão não passa: sobe em zigue-zague e atravessa por cima, com espinhos embaixo), *esmagador* estilo Thwomp (treme, despenca, volta), *canhão* estilo Mega Man (tiros na altura do corpo), mais serras/blinks já existentes.
* **Fase secreta de verdade** — porta **invisível** no fim de uma torre opcional; só brilha de leve ao chegar perto.
* **Link de demonstração rastreado** (LinkedIn/WhatsApp): Central de Gestão → *Aplicações e QR* → Tipo = *Demonstração para um destinatário*. Cada pessoa recebe **um link próprio** com limite de aparelhos (ex.: 3), validade, **marca d'água com o nome do destinatário** na tela inteira e botão **Quem abriu** (IP, aparelho, horário) para ver se o link foi repassado. Pausar/excluir derruba na hora.
* **Instância independente da vitrine** — `INICIAR_DEMO_INDEPENDENTE.bat` (porta 8900, banco `data_demo`, edição Premium forçada) ou `render-demo.yaml` para publicar à parte. Dados da pesquisa e da vitrine nunca se misturam.
* **Arte no estilo da Raposa para todos** — `docs/PROMPTS_ARTE_DEMO_ESTILO_RAPOSA.md` (também em `Desktop/ARTE_PROVA_ARCADE/00_PROMPTS_DEMO_ESTILO_RAPOSA.md`): um prompt por herói, monstro, chefão e AURA, e o comando `python tools/pack_sheet.py` que recorta a folha e encaixa no jogo.

> **Honestidade sobre proteção:** nada impede 100% alguém de gravar a tela ou copiar o que o navegador baixa. O que o sistema faz é **tornar vazamento rastreável** (link único, marca d'água, limite de aparelhos, log) e **juridicamente claro** (termos na abertura). A proteção forte continua sendo registro no INPI + termo de licença.

## 0.3 Quarta rodada (inimigos, primeiro plano, loja, publicação)
* **Monstros agressivos**: avisam com "!" e **investem** contra você; morcegos **mergulham**; alguns **pulam**. Há **monstros com espinhos nas costas (imortais para pisão e para tiro)**, **atiradores** (cospem bolas em arco) e **voadores atiradores**. Na fase 3 há **fantasmas imortais** que perseguem devagar.
* **Primeiro plano estilo Donkey Kong Country**: troncos/cristais/pilares/cipós e blocos de pedra passam **na frente do herói e da câmera** (parallax maior que 1) em alguns trechos planos e seguros. Nunca em arena de pergunta nem de chefão.
* **Apoio adaptativo só no trecho difícil**: depois de várias tentativas a ajuda liga, mas some **26 blocos adiante** (e sempre ao passar de checkpoint, portão ou fase). Nunca vale para o jogo inteiro.
* **Moedas não dão mais vida**: viram **carteira**. No fim da prova há a **Loja**: skins (cor) e acessórios (coroa, auréola, chapéu…). Em 2 jogadores dá para **presentear o outro**. Só cosmético, **nunca entra na nota**. Vidas: 2 (máx. 3) e só voltam por coração raro ou sala secreta.
* **Arte 2D desenhada por código**: Nina, Téo, Byte, 8 monstros, 3 chefões e AURA (sem Blender), `python tools/art2d/build.py`. A Raposa continua a sua folha. O atlas 3D anterior está em `tools/gfx_blender_backup`.
* **Cenário**: texturas novas de chão/plataforma/tijolo, decoração mais densa (placas, lanternas, bandeiras, caixotes, arbustos), **lava/água/ácido nos buracos**, **baús**, **gemas**, **vento ascendente**.
* **Publicar na internet / QR no celular**: veja **`PUBLICAR_NA_NUVEM.md`** (o QR não abre com 4G se o endereço for o do seu computador). Repositório para o GitHub: `README.md`, `LICENSE`, `.gitignore`, CI e `tools/make_public_showcase.mjs` (versão pública **sem** o banco de itens).

## 0.4 Quinta rodada (demo como produto à parte, pergunta mais exigente)
* **Atalhos na Área de Trabalho** (`PROVA_ARCADE_DEMO`): `1_ABRIR_O_DEMO` (entra direto), `2_ABRIR_PAINEL_DO_DEMO` (painel sem senha, só neste PC), `3_PARAR_O_DEMO`. A demo roda **independente** (porta 8900, banco `data_demo`) e o painel mostra **só partidas jogadas de verdade**; os alunos fictícios continuam opcionais e marcados como "simulado".
* **Capa da demo** sem selo "premium"; edição vista pelo painel como **DEMO PÚBLICA**. A frase de licença passou a ser neutra.
* **Pergunta**: 4ª caixa **NÃO SEI** (conta como não correta e vira o indicativo **IDK** no painel); **tempo mínimo de leitura** com barra (8 a 20 s conforme o tamanho do texto); **rótulos** sobre os objetos depois que a versão é ouvida; painel **centralizado** no celular (em pé e deitado); as alternativas erradas foram **alongadas** para a correta deixar de ser a mais comprida (era em 13 de 18 formas; agora 8, próximo do acaso).
* **Fase de gelo** (*Geleira dos Cristais*): o chão **derrapa** (aceleração e atrito baixos), com brilho de gelo e aviso na entrada.
* **Mais difícil**: monstros mais rápidos e agressivos (investem de mais longe, mergulham mais), mais atiradores e mais emboscadas em todas as fases. **Escudo só no bônus especial** (completar a fase bônus); estrela comum agora dá pontos e moedas.
* **Fase bônus**: se você **morre ou cai, sai automaticamente** e perde o bônus.
* **Arte coerente**: contorno escuro fino também na Raposa (original sem contorno guardado em `tools/art_src/char_fox_sem_contorno.png`); referência de estilo: cartoon vivo de contorno grosso estilo *Congo's Caper* (SNES). **Nenhum recurso do jogo original foi copiado.**
* **Conferência curricular**: `docs/CONFERENCIA_CURRICULAR.md` (o que foi e o que **não** foi possível confirmar; SAEB não avalia Ciências no 6º ano).

## 0.5 Sexta rodada (demo com banco amplo e arte em pixel art de 16 bits)
* **Arte em PIXEL ART (16 bits)** para todo o elenco: Raposa, Nina, Téo, Byte, 8 monstros, 3 chefões, AURA, moeda, estrela e pedestais. Gerada por `python tools/art2d/build_px.py` (paleta limitada por personagem, bordas duras e contorno de 1 px). A Raposa continua sendo a **sua folha**, convertida para 16 bits. Backups: `tools/gfx_vector2d_backup` (ilustração suave) e `tools/gfx_blender_backup` (3D). Para trocar, copie os PNG + `manifest.json` do backup para `app/gfx` e aumente `V` em `app/js/gfx.js`.
* **Banco de questões da demo: 63 itens** (21 por habilidade: formas A–G em 3 facetas por habilidade). A cada partida da demo as perguntas são **sorteadas, sem repetir**, uma de cada habilidade por fase. A edição de pesquisa continua com as formas A/B fixas (equidade entre alunos). Os 45 itens novos estão em `app/js/bank_extra.js` e **precisam de revisão por professor de Ciências**.
* **Rascunhos de texto** para WhatsApp e LinkedIn: `docs/TEXTOS_LINKEDIN_WHATSAPP.md`. **Nada foi publicado**: aguardando a sua análise.

## 0.6 Sétima rodada (harmonia 16 bits, saída na parede, chefões novos)
* **Visual 16 bits unificado**: o jogo inteiro agora é desenhado em baixa resolução e ampliado sem suavizar (cenário, plataformas, personagens, monstros, chefões e HUD de jogo combinam entre si). Controle: constante `PX` em `resize()` de `app/js/game.js`.
* **Raposa redesenhada no mesmo estilo dos demais** (mesma "mão" de Nina/Téo/Byte, mantendo a identidade: laranja, rabo de ponta branca, arreio com emblema ciano). A folha pintada original ainda pode ser usada: `FOX_SHEET=1 python tools/art2d/build_px.py`.
* **Chefões refeitos** (Colosso de Cristal, Titã de Ossos, Hidra Sináptica): mais ameaçadores, maiores e com rachaduras de luz. Correção importante: o chefão exausto agora **se agacha**, porque a cabeça dele ficava alta demais para qualquer pulo (a pisada só funcionava em teste, não jogando).
* **Saída = porta na parede do fundo** (gelo, pedra, ruína ou mata, conforme a fase). Ao entrar, o herói some e a tela fecha em círculo antes de ir à próxima fase.
* **Menos pontos de salvamento** e sem bandeiras: agora são **totens de pedra com cristal**. Bandeiras decorativas removidas.
* **Detalhes de teto** (estalactites, rocha, raízes, folhagem) em primeiro plano.
* **Monstros voltam** quando você morre e retorna ao ponto de salvamento (como nos clássicos de plataforma).
* **Demo só com a versão de ~8 minutos**: o botão de prova completa não aparece.

## 1. Como abrir agora (no seu computador)

```bash
cd Desktop/prova-arcade-DEMO
node server.js
```
Precisa de Node 22 ou mais novo. O servidor sobe em `http://localhost:8899`.

| O quê | Endereço | Acesso |
|---|---|---|
| **Jogo** (licença da gestora, 30 dias, 60 aparelhos) | http://localhost:8899/ | código `PROVA-HF5Z-5D5E` + nome completo |
| **Jogo** (licença do autor, sem validade) | http://localhost:8899/ | código `PROVA-2CG3-FCC5` + nome completo |
| **Central de Gestão** (BI, resultados, QR Code, licenças) | http://localhost:8899/admin | senha em `data/ADMIN_SENHA.txt` |
| **Entrada por QR Code** (cai direto no jogo) | `/q/<token>` | sem digitar nada |
| Painel da turma (exemplo, dados simulados) | http://localhost:8899/app/painel.html | precisa estar logado no jogo |

Os códigos e a senha ficam em `data/CODIGOS_DE_ACESSO.txt` e `data/ADMIN_SENHA.txt` (não vão para o servidor publicado; cada instalação gera os seus e os imprime no log na primeira execução).

## 2. Aplicar a prova por QR Code

1. **Central de Gestão → Aplicações e QR Code**: escolha a licença, dê um nome (ex.: *Ciências 6º A · 3º bim*), escolha **Demo rápido (~8 min)** ou **Completo**, defina a validade e clique **Gerar QR Code**.
2. Projete o QR, baixe o PNG ou **imprima o cartaz A4**.
3. O aluno aponta a câmera, toca no link e o jogo abre já na escolha de jogadores (sem código, sem instalar nada). Ele se identifica (nome + turma), escolhe o personagem e joga.
4. Ao terminar, o resultado é **gravado** e aparece na Central (Visão geral e Resultados).
5. Dá para **pausar ou excluir** a aplicação a qualquer momento: o QR para de funcionar na hora.

> O QR só funciona para os alunos se o servidor estiver **publicado na internet** (item 3).

## 3. Publicar na web (obrigatório para usar em sala)

Sem dependências: basta `node server.js` num lugar com HTTPS.

* **Docker** (`Dockerfile` pronto): **monte um volume persistente em `/srv/data`** (licenças, aplicações e resultados). `TRUST_PROXY=1` já está definido.
* **Render.com**: `render.yaml` de exemplo (precisa de disco persistente).
* **VPS** (Hetzner, DigitalOcean, Oracle Free): `node server.js` com `pm2` + **Caddy** (HTTPS automático).
* Depois de publicar, abra a Central **pelo endereço público** e gere o QR de novo (o QR carrega o endereço do site).
* Faça **backup** do arquivo `data/licencas.db` (contém licenças e resultados).

### Rede do estado (bloqueios / "página maliciosa")
O jogo **não carrega nada de fora** (sem CDN, rastreadores, código ofuscado ou `eval`), tem CSP restritiva e cookies seguros. Filtros olham o **domínio**: use domínio próprio com HTTPS (evite subdomínios gratuitos de túnel) e peça à TI da Diretoria para liberar. **O teste real na rede do estado ainda não foi feito.**

## 4. Proteção da ideia

* Só entra com licença; o código do jogo **não é entregue sem sessão válida**.
* Você vê **quem usa** (nome, aparelho, IP, horário), limita **aparelhos**, define **validade**, **bloqueia** e **derruba sessões em tempo real**.
* O diagnóstico tem **marca d'água** (titular/licença) e rodapé de direitos autorais.
* Nenhuma trava de navegador é inviolável: a proteção real é licença no servidor + registro de uso + **registro no INPI** (programa de computador) + termo de licença.

## 5. O que o demo faz

* 1 ou 2 jogadores no mesmo aparelho; **P1 azul / P2 laranja** em tudo (moldura, marcador, tela inteira de "VEZ DO JOGADOR").
* **Vida em corações** (2, máx. 3; **moedas não curam**: viram carteira para a loja). **Estrela escondida = escudo** (segura 1 dano). **Porta dourada ★ = fase secreta** (bônus). Pontos viram medalha; **nada disso entra na nota**.
* **Dificuldade alta**: espinhos, serras, plataformas móveis, que caem e que piscam, molas, inimigos terrestres e voadores, chefe por fase. **Apoio adaptativo**: quem cai muito recebe ajuda (inimigos mais lentos, pontes sobre buracos, espinhos inofensivos, mais tolerância no pulo), só nos trechos de plataforma.
* **Os "casos" da AURA estão embutidos no jogo**, em 6 formas de responder (cor + forma + letra em todas), **uma diferente por pergunta**: **barril que cai do alto** (pisar), **balão** (pular e encostar), **porta** (ficar parado dentro), **bloco de interrogação** (bater com a cabeça), **monstrinho** (pisar) e **pedestal** (ficar parado em cima). Tudo dentro do tema de cada mundo. Sem pop-up, sem relógio, sem certo/errado durante a prova. Passar por cima não escolhe nada.
* **Arma limitada (Orbe de Luz)**: ao derrotar um chefão você ganha 3 tiros (máx. 6), **sem recarga** (tecla X ou botão ✦). Não funciona durante as perguntas e não entra na nota.
* **Cenários**: 4 camadas de parallax por mundo + névoa + elementos animados (pássaros, cristais flutuantes, abutres, cipós). Fundos feitos por você podem ser plugados em `app/gfx/bg/`.
* **Leitura em voz alta** (botão 🔊, caixa de som no chão ou ligada na identificação), para quem ainda não lê com fluência. *Depende de voz em português no aparelho.*
* **Música adaptativa**: calma nas perguntas, dramática nos trechos difíceis e no chefe.
* **Termômetro de tensão** (carinha antes e depois) para medir o efeito do formato.

## 6. Central de Gestão (BI)

* **Visão geral**: indicadores, distribuição de notas, níveis por habilidade, nota por turma, mapa de calor, equívocos, aplicações por dia, tensão antes × depois, qualidade dos itens.
* **Resultados**: busca, ordenação, paginação e **modal do resultado individual** (cada questão com a resposta do aluno, o gabarito, o provável equívoco e a habilidade em defasagem).
* **Modal do resultado da sala**: ranking das **habilidades em defasagem** por prioridade, onde a sala erra, quem precisa de retomada (por nome) e sugestão de atividade; imprime em PDF.
* **Relatórios**: **Excel (.xlsx)** com 5 abas (a **nota é fórmula**, editável), **PDF da turma** e **boletins individuais** (impressão → *Salvar como PDF*).
* **Nota = acertos ÷ 9 × 10**, calculada **no servidor** a partir do bloco escolhido (o navegador do aluno não consegue forjar).
* Dados **SIMULADOS** (36 alunos) podem ser carregados/apagados em *Ajuda e proteção de dados*; aparecem marcados e com aviso.

## 7. Arte e personagens

A arte atual (Blender + vetor) é provisória. A pasta **`Desktop/ARTE_PROVA_ARCADE`** reúne, por item (heróis, AURA e vilão, monstros, chefões, skins), uma subpasta com **história curta, referência artística, comando para o Blender/GIMP**, a arte atual e espaço para o seu esboço e para a entrega. Comece por `00_LEIA_PRIMEIRO.md` e `00_COMANDO_MESTRE_BLENDER_E_GIMP.md`. (O arquivo `docs/BIBLIA_DE_ARTE_PERSONAGENS_E_MONSTROS.md` tem a versão corrida.)

## 8. Estrutura

```
server.js            servidor + licenças + QR + resultados
lib_results.js       nota no servidor, planilha .xlsx, estatísticas
public/              tela de login
app/                 jogo (só com sessão); app/js = motor, arte, áudio, itens
admin/               Central de Gestão
tools/               validador de fases, teste de carga, Blender, cartaz, robô de teste
docs/                bíblia de arte e capturas
data/                banco e segredos (não publicar)
```
Para trocar a disciplina: edite `app/js/items.js` (mesmo formato).
