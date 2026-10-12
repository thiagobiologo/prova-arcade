# Relatório de testes — Prova Arcade (demo)

Data: 11/10/2026 · Ambiente: Windows 11, navegador embutido (Chromium), servidor local Node 24.

## O que foi testado e o resultado

| # | Teste | Como | Resultado |
|---|---|---|---|
| 1 | Todas as fases são completáveis | validador por alcance de pulo em **800 fases** (completas e rápidas, 4 temas) + **300 salas secretas** | **0 inválidas**; 0 salas com saída inalcançável |
| 2 | Partida completa, 1 jogador | robô joga treino + 3 fases + 3 chefes + diagnóstico | concluiu, sem erro de console |
| 3 | Partida completa, 2 jogadores | formas A/B, telas de troca de vez, termômetro por jogador, dois resultados gravados | concluiu; os dois resultados chegaram ao servidor |
| 4 | Diagnóstico reflete as respostas | robô errando de propósito a habilidade EF06CI09 | 3/3, 0/3, 3/3, equívocos E2/M3/N2, **nota 6,7 calculada no servidor** |
| 5 | 4 formas de responder os "casos" | teste direto no motor, simulando o aluno em cada tipo | **porta, bloco parado, bloco de interrogação e monstrinho selecionam a resposta certa** |
| 6 | Passar por cima não escolhe resposta | caminhar/pular sobre blocos e portas | **nenhuma seleção acidental** |
| 7 | Entrada por QR Code | `/q/<token>` → sessão → jogo | 302 → jogo; sem sessão = bloqueado; QR decodifica para o link certo |
| 8 | Carga: 40 alunos juntos | 40 clientes entram pelo QR e baixam o jogo | **40/40 ok, 0 falhas** (local) |
| 9 | Planilha Excel | gerada pelo painel e aberta com biblioteca de planilhas | abre; 5 abas; nota como **fórmula editável** |
| 10 | Central de Gestão | login, indicadores, 6 gráficos, filtros, detalhe por aluno, QR, licenças | ok |
| 11 | Celular em paisagem (812×375) e em pé | pergunta cabe; aviso "gire o aparelho" | ok (tamanho simulado) |
| 12 | Barris, balões e arma limitada | teste direto no motor | barris pousam e selecionam ao pisar; balões selecionam ao encostar; só andar não escolhe; arma: 3 tiros, sem recarga, desbloqueia no chefão |
| 13 | Modais do painel | resultado individual e resultado da sala (defasagem) | ok |
| 14 | Partida completa após as mudanças | robô, 1 jogador | concluiu, 9/9, sem erro de console |
| 15 | Edição PESQUISA completa | robô, 1 jogador, 4 fases | concluiu, sem erro de console |
| 16 | Edição PREMIUM completa | robô, 2 jogadores, só Raposa, treino + 2 fases | concluiu (6 turnos), sem erro de console |
| 17 | Chefão com janela de dano | teste direto no motor | pisar com ele blindado só quica (sem dano a ninguém); exausto = -1; metade da vida = FÚRIA e pedras |
| 18 | Tela em pé (390×844) | viewport simulado | pergunta, AURA, botões e chão cabem; fundo cobre a tela |
| 19 | Itens flutuando | verificação automática em 160 fases | inimigos, molas, portas secretas, decoração: todos apoiados; saída corrigida (estava enterrada) |
| 20 | Fases com torre-muro, esmagador e canhão | validador por alcance, 800 fases + 300 salas secretas | **0 inválidas** |
| 21 | Pergunta com versões trancadas | teste direto no motor | responder antes de ouvir as 3 = bloqueado + aviso; ouvir as 3 = +6 moedas e libera; porta/barril/balão/bloco/monstrinho/pedestal |
| 22 | Partida completa pesquisa (4 fases) após as mudanças | robô | concluiu em ~100 s, sem erro de console |
| 23 | Link de demonstração rastreado | API real | 2º aparelho bloqueado quando o limite é 1; reabrir no mesmo aparelho funciona; "Quem abriu" lista IP/aparelho/hora; marca d'água carrega o destinatário |
| 24 | Monstros agressivos / espinhosos / atiradores / fantasma | teste direto no motor | investida com alerta; pisar em espinhoso machuca; atirador acerta; fantasma persegue; morcego mergulha |
| 25 | Apoio adaptativo local | motor | 4 golpes ligam a ajuda; 27 blocos adiante ela desliga |
| 26 | Loja do final + presente entre jogadores | motor + interface | compra de skin/acessório, presente ao outro jogador, carteira correta |
| 27 | Partida completa 2P (4 fases + loja) | robô | concluiu em ~230 s, sem erro de console |
| 28 | Instância independente (arquivos do Dockerfile) | servidor em pasta limpa com PA_DATA/PA_EDITION | primeira execução ok; /health ok; app sem sessão = 302. **Build Docker real não testado** (imagem base não estava local) |

## Defeitos encontrados e corrigidos nesta rodada
* `Dockerfile` não copiava `lib_results.js` (o container não subiria) → corrigido.
* `rng/shade` sem importar em `game.js` (quebrava o desenho do primeiro plano) → corrigido antes da entrega.
* O limite de aparelhos por link foi aplicado primeiro no *login* (erro) e não no link por QR → corrigido e retestado (login por código segue funcionando).
* Coluna do aparelho no banco chama `device_id` (consulta usava `device`) → corrigido.
* **Saída da fase enterrada no chão** e com desenho confuso (elipse de energia) → arco de pedra apoiado no piso.
* Quicar no chefão fazia o jogador tomar dano ao subir pela hitbox → imunidade curta pós-quique.
* Robô de teste ficava preso à direita da saída depois do chefão → agora vai até a saída.
* Balões tentavam desenhar antes de a pergunta começar (coordenadas não calculadas) e derrubavam o quadro → corrigido.
* **Faltava checkpoint**: quem caía num buraco no meio da fase voltava ao início inteiro (frustrante) → checkpoint a cada ~40 blocos e ponto de retorno novo após cada portão.
* Duas serras seguidas deixavam só 2 blocos para pousar → folga aumentada.
* Pontes de apoio eram criadas perto do último checkpoint, não do jogador → agora seguem o jogador.
* (rodadas anteriores) buracos não matavam; preso atrás de portão trancado; seleção acidental ao passar por cima dos blocos; chefe atacando fora da tela.

## O que NÃO foi testado (precisa antes de liberar o link)
1. **Aparelhos reais**: toque (D-pad/pulo), desempenho em celular simples, iPhone (não trava a orientação), Android de entrada. Só foi simulado o tamanho de tela.
2. **Jogabilidade por humano nos novos obstáculos** (serras, plataformas que piscam/caem, molas, fase secreta): validados por regra e por robô, **não por pessoas**; a dificuldade precisa ser calibrada em piloto com adolescentes.
3. **Voz em português** (leitura em voz alta) nos aparelhos dos alunos.
4. **Rede do estado**: acesso ao domínio publicado, filtro de "página maliciosa", bloqueio de IA.
5. **Publicação na web** (HTTPS, disco persistente, backup do banco).
6. **PDF**: é gerado pela impressão do navegador (*Salvar como PDF*); não há geração de PDF no servidor.
7. **Validade do instrumento**: os 18 itens precisam de revisão por professor da área e piloto; 3 itens por habilidade é leitura **indicativa**.
8. **Efeito do formato/chefe/música sobre a tensão de prova**: não está provado; o demo só **mede** (termômetro antes/depois). Para publicar, usar escala validada e grupo de comparação.
9. **LGPD**: o sistema agora **grava nome, turma e respostas de menores**. Antes de usar com alunos reais é preciso aviso/consentimento da escola e política de retenção.
10. Referências acadêmicas listadas no diagnóstico precisam de conferência de DOI/paginação.
11. A **arte é provisória** (será redefinida no Blender a partir da bíblia de arte).
