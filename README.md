# Prova Arcade

**Avaliação diagnóstica gamificada, aplicada por QR Code, em que as perguntas fazem parte do jogo.**
*Gamified diagnostic assessment delivered by QR code, where the test items are part of the gameplay.*

> © Thiago Silva · proprietário (ver `LICENSE`). Conteúdo atual: Ciências · 6º ano · 3º bimestre (Currículo Paulista / SEDUC-SP).

## O que é
Um jogo de plataforma no navegador (celular em pé ou deitado, sem instalar nada) em que cada "caso" da guia **AURA** é uma pergunta de habilidade essencial. O aluno joga, ouve três "versões" (as alternativas), e responde interagindo com o cenário (barril, balão, porta, bloco…). O professor recebe, em tempo real, um painel de BI com o diagnóstico por habilidade, por aluno e por sala.

## Destaques de engenharia
| Área | O que foi feito |
|---|---|
| **Motor** | Plataforma 2D em *canvas* HD, sem bibliotecas de jogo. Física própria, 4 camadas de *parallax*, modo vertical/horizontal. |
| **Fases procedurais** | Gerador por trechos com *seed* fixa (equidade entre alunos) + **validador de alcance** (800 fases e 300 salas secretas testadas em CI). |
| **Banco de questões** | 63 itens (21 por habilidade) com equívocos mapeados; a demo sorteia a cada partida, a pesquisa usa formas fixas A/B. |
| **Pergunta como mecânica** | Alternativas "trancadas" que só se leem chegando perto de cada objeto; responder só depois de ouvir as 3 versões; leitura em voz alta. Registro de tempo de atenção por alternativa. |
| **Servidor** | Node 24 **sem dependências** (SQLite nativo), licenças, QR por aplicação, limite de aparelhos, sessões revogáveis, CSP restritiva, rate limit. |
| **Nota confiável** | A nota é **calculada no servidor**, não no navegador do aluno. |
| **Painel (BI)** | Gráficos, mapa de calor por habilidade, modal individual e da sala com **defasagens por prioridade e sugestão de retomada**, Excel (.xlsx escrito à mão, nota como fórmula) e PDF. |
| **Duas edições** | *Pesquisa* (coleta de dados) e *Vitrine* (demo comercial, link rastreado por destinatário, marca d'água, limite de aparelhos). Instâncias independentes. |
| **Arte** | Cenário e fases ilustrados por código; personagens e vilões animados por um *rig* 2D em Python (cinemática inversa) e convertidos para **pixel art de 16 bits** (`tools/art2d`); Raposa a partir de folha do autor. |
| **Acessibilidade** | Leitura em voz alta pt-BR, cor + forma + letra em todas as respostas, sem relógio. |

## Rodar localmente
```bash
node server.js          # Node 22+; abre em http://localhost:8899
node tools/check.mjs    # sintaxe + validação de fases (também roda no GitHub Actions)
```
Na primeira execução o servidor imprime os códigos de licença e a senha do painel (`/admin`).
Publicar na internet: **`PUBLICAR_NA_NUVEM.md`**.

## Estrutura
```
server.js · lib_results.js   servidor, licenças, QR, resultados, planilha .xlsx
app/                         jogo (canvas): game.js (motor), levels.js (gerador+validador), art.js (cenário), ui.js, cosmetics.js, items.js (banco de itens)
admin/                       Central de Gestão (BI)
tools/art2d/                 fábrica de sprites 2D (heroes, creatures, bosses, build)
tools/                       validador, testes de carga, empacotadores de arte, robô de QA
docs/                        estratégia pedagógica, prompts de arte, capturas
```

## Status honesto
* Testado por **robô** (partidas completas, 1P e 2P), validador de fases e teste de carga local (40 clientes). **Ainda não** foi testado com alunos nem em celulares reais; a dificuldade precisa de piloto.
* Que o formato (chefe, música, versões trancadas) melhora o engajamento ou reduz a tensão é uma **hipótese**; o jogo registra os dados para testá-la.
* O banco de itens real é **privado**. Este repositório (vitrine) traz itens de exemplo (`tools/make_public_showcase.mjs`).

Documentos: `docs/ESTRATEGIA_PERGUNTA_NO_JOGO.md` · `TESTES.md` · `LEIA-ME.md`.
