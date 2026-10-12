# Estratégia: pergunta e jogo numa coisa só

© Thiago Silva · Prova Arcade

## O problema observado
O aluno joga, chega no ponto da pergunta, **não lê e nem ouve**, escolhe qualquer bloco e segue. A pergunta era um painel de texto por cima do jogo: o cérebro do jogador a trata como "propaganda" e a ignora. Isso estraga a avaliação (acerto vira sorte) e o engajamento.

## O que a literatura e os projetos parecidos mostram
* **Avaliação "furtiva" (stealth assessment)**, de Valerie Shute: a medição fica *dentro* da mecânica do jogo, sem interromper o fluxo, e o modelo de competências guia o que se mede (ex.: *Newton's Playground*).
* **Integração intrínseca**: quando o conteúdo é a própria mecânica (e não um quiz colado por cima), há mais engajamento e mais aprendizagem. Avaliação explícita "interrompe" o jogador.
* **Motor neutro de conteúdo (CAGE)**: separar o motor do conteúdo permite trocar a disciplina sem refazer o jogo. É o que o Prova Arcade já faz (pacote de itens em JSON).
* **Repositórios no GitHub** (plataformas em Phaser com "quiz") quase sempre **pausam a fase e abrem um painel de perguntas**. É exatamente o padrão que *não* queremos.
* **Zelda / Mario / Mega Man**: o jogador aprende lendo o mundo (placas, NPCs, salas-enigma) e é **bloqueado por um obstáculo** até entender. A informação está *no cenário*, não numa tela à parte.

## A estratégia aplicada (o que mudou no jogo)
1. **A AURA fala dentro do mundo.** O caso aparece num painel holográfico ligado à AURA por um feixe de luz, **digitado aos poucos** (como diálogo de Zelda). Não dá para pular.
2. **As 3 alternativas ficam trancadas (🔒).** Cada uma é a "versão" de um objeto do cenário (barril, balão, porta, bloco, monstrinho, pedestal). O aluno só lê a versão **chegando perto do objeto** (~0,6 s). É como conversar com 3 testemunhas.
3. **Só dá para responder depois de ouvir as 3 versões.** Tentar responder antes faz o painel tremer e avisar. Isso garante exposição ao texto de todas as alternativas.
4. **Recompensa por ler** (não afeta a nota): "OUVIU TUDO! +6 moedas" para o cofre de corações.
5. **Leitura em voz alta** (aluno não alfabetizado): ao ouvir o caso, cada alternativa falada é destrancada.
6. **Cada pergunta usa um objeto diferente** (6 tipos), então o aluno não cai em automatismo.
7. **O que fica registrado** (para o professor e para o artigo): tempo até a 1ª escolha, trocas de resposta, quanto tempo ficou perto de cada alternativa (`rd`), visitas, uso da leitura em voz alta.

## O que NÃO está provado
* Que isso **aumenta** o acerto ou o engajamento: é uma hipótese de projeto. O jogo registra os dados para testar (grupo de comparação com a versão antiga).
* A "leitura obrigatória" garante que o aluno **passou** pelo texto, não que **compreendeu**. O tempo perto de cada alternativa ajuda a identificar quem só passou correndo.

## Próximos passos possíveis
* Rótulo curto (2–3 palavras) em cada objeto, para o aluno lembrar de qual "testemunha" é cada versão.
* Pistas do mundo (como placas de Zelda) conectando o caso à fase (ex.: o caso da lente aparece com um cristal quebrado).
* Piloto com 1–2 turmas comparando: versão painel × versão "testemunhas".

## Fontes consultadas
* Shute, V. *Stealth assessment* (EDM 2013, "rn_paper_01") e trabalhos sobre *Newton's Playground* — https://www.educationaldatamining.org/EDM2013/papers/rn_paper_01.pdf
* Verma, *Content Agnostic Game Engineering (CAGE)* e avaliação em jogos educacionais (ASU) — https://keep.lib.asu.edu/system/files/c7/Verma_asu_0010E_20779.pdf
* Revisão narrativa sobre avaliação furtiva em jogos educacionais — https://publish.kne-publishing.com/index.php/JMED/article/view/18988
* Exemplos de plataformas em Phaser no GitHub (nenhum integra a pergunta ao mundo; usam painel): https://github.com/diazgio/JS-Capstone · https://github.com/jamisoncozart/Java-and-the-Quest-for-the-Scripts

> Conferir referências (autores/ano/DOI) antes de citar em publicação.
