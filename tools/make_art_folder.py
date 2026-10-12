# Gera a pasta de arte na Área de Trabalho: uma subpasta por personagem/monstro/chefão/skin, com história curta,
# referência artística, comando para o Blender/GIMP e a arte atual (para servir de referência).  © Thiago Silva.
import os, shutil, sys, glob
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.join(os.path.expanduser('~'), 'Desktop', 'ARTE_PROVA_ARCADE')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blender', 'out')
PRN = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'prints')

MESTRE = """# COMANDO-MESTRE — cole isto primeiro (Blender 5.x)

Você é artista 3D sênior de jogos 2D modernos (plataforma). Vou te passar esboços e uma ficha por item.
Para cada item, modele no Blender e RENDERIZE como sprites 2D para um jogo de plataforma web.

ESTILO GERAL: "casual viral moderno" — formas arredondadas e grossas, silhueta legível a 30 px de altura,
cores saturadas, brilho suave de brinquedo/vinil, olhos grandes e expressivos, rim light colorido.
Referências de linguagem: Fall Guys (corpos "feijão"), Brawl Stars / Clash Royale (volumes grossos, rosto marcante),
Rayman Legends (2D vivo e luminoso), Ori and the Blind Forest (luz e brilho), Kirby (simplicidade com personalidade).
Público: 11 a 18 anos. Vilões ameaçadores e "legais", nunca infantis demais; sem sangue, sem armas reais.
PROIBIDO copiar personagens existentes; só a linguagem de forma, cor e animação.

TÉCNICA: low-poly suave (3k–12k triângulos), materiais Principled BSDF (roughness 0.2–0.45, coat 0.4–0.8), emissão só em
olhos/cristais/runas. Câmera ORTOGRÁFICA, fundo transparente, vista 3/4 com o personagem virado -50° em Z (olhando para a
DIREITA da tela). Sol 3.4 de cima-esquerda, rim azulado por trás, preenchimento suave. Cycles CPU 24–48 amostras + denoise,
PNG RGBA 8 bits, 256x256 (heróis/monstros pequenos/coletáveis) ou 384x384 (chefes), pés na mesma linha de base, margens iguais.

COR DO JOGADOR: todo HERÓI tem UM material chamado "PlayerColor". Entregar em DUAS versões: P1 = azul #2F6BFF e
P2 = laranja #FF6A2B (o corpo inteiro assume a cor; acessórios mantêm a cor própria).

ENTREGA: nome  <tipo>_<nome>_<quadro>.png  (ex.: char_nina_p1_00.png) + uma tira horizontal por animação.
Liste ao final os quadros gerados e os pivôs usados.

GIMP (para fundos e acabamento): trabalhe em camadas separadas, 16 bits, perfil sRGB, exporte PNG com transparência;
camadas de cenário devem ser REPETÍVEIS na horizontal (emenda invisível).
"""

LEIA = """# ARTE PROVA ARCADE — como usar esta pasta

Cada personagem, monstro, chefão e skin tem a PRÓPRIA pasta com:
  • HISTORIA_E_REFERENCIA.md  — história curta, referência artística e o COMANDO pronto (Blender/GIMP);
  • esboco_do_autor/          — ponha aqui o SEU esboço;
  • arte_atual/               — o que o jogo usa hoje (só referência; vai ser substituída);
  • entrega/                  — onde cai o resultado final do Blender/GIMP.

Fluxo:
 1) Cole o arquivo  00_COMANDO_MESTRE_BLENDER_E_GIMP.md  no GPT.
 2) Para cada item, cole o HISTORIA_E_REFERENCIA.md dele + anexe o seu esboço (esboco_do_autor).
 3) Guarde o que o GPT/Blender gerar em  entrega/.
 4) Me avise: eu empacoto os quadros e o jogo passa a usar a arte nova (cada item já tem tamanho e quadros definidos).

Pastas:
  01_Herois            4 jogáveis (P1 azul / P2 laranja)
  02_Aura_e_Vilao      a assistente e o vilão principal
  03_Monstros          8 monstros comuns (2 por mundo + treino)
  04_Chefoes           3 guardiões
  05_Skins             obstáculos, objetos de pergunta, cenários (fundos), coletáveis/arma, interface

REGRA DE OURO: a história é só para inspirar o desenho. É entretenimento, nunca interfere na prova.
"""

MUNDO = """HISTÓRIA DO MUNDO (resumo): o Instituto Aurora é um laboratório flutuante que guarda o Núcleo do Saber, uma esfera
de luz que mantém o conhecimento organizado. O Doutor Entropia rachou o Núcleo e espalhou os pedaços em três mundos
(Caverna dos Cristais, Ruínas dos Ossos, Floresta das Sinapses), cada um vigiado por um Guardião criado a partir de um
"defeito" que ele inventou. Os jogadores são Aprendizes do Instituto; a assistente AURA envia os "casos" por rádio."""

# nome, papel, historia, referencia, forma_cor, animacoes, uso, comando, arte_atual(lista de glob em OUT)
def chars(nome, key):
    return [f'char_{key}_p1_*.png', f'char_{key}_p2_00.png', f'char_{key}_p2_02.png']

HEROIS = [
 ('Nina', 'nina', 'Cientista curiosa', 'Filha de dois pesquisadores do Instituto. Achou o primeiro pedaço do Núcleo brilhando num armário e decidiu que ninguém ia apagá-lo. Anota tudo e adora investigar.',
  'Corpo "feijão" de Fall Guys + acessórios de cientista fofa (Rayman/Kirby).', 'Corpo feijão na cor do jogador (material PlayerColor), óculos de proteção redondos pretos sobre os olhos, cabelo castanho curto de lado e rabo de cavalo, luvas brancas, sapatos escuros.',
  'idle 2q · correr 6q · pulo 1q (braços para cima) · queda 1q · dano 1q (braços abertos, inclinada)', '35 px de altura em jogo; caixa de colisão 10x20; lê bem pequena.',
  'Modele "Nina": corpo feijão (esfera 0.56x0.50x0.72 m, centro z=0.95) com material PlayerColor; olhos grandes brancos com pupila preta e brilho; óculos de proteção redondos (dois anéis pretos + faixa); cabelo castanho curto + rabo de cavalo; luvas brancas; sapatos escuros. Renderize 11 quadros em P1 e P2: idle×2, run×6, jump, fall, hurt.'),
 ('Teo', 'teo', 'Explorador veloz', 'Entregador de recados do Instituto. Conhece todos os atalhos e perdeu o ritmo quando o Doutor Entropia cortou a música do laboratório. Quer ouvi-la de novo.',
  'Brawl Stars (volumes grossos, boné marcante) + Fall Guys.', 'Corpo feijão PlayerColor, boné amarelo de aba larga, fones de ouvido (arco preto + conchas vermelhas), olhos grandes, luvas brancas.',
  'idem Nina; corrida com leve inclinação para a frente', '35 px; colisão 10x20.',
  'Modele "Téo": corpo feijão PlayerColor; boné amarelo (calota achatada + aba larga) ; fones: arco fino preto por cima da cabeça e duas conchas vermelhas nas laterais; olhos grandes; luvas brancas. 11 quadros × P1/P2.'),
 ('Byte', 'byte', 'Robô gentil', 'Construído por AURA para ser o "braço" dela nas fases. Tem uma única missão: proteger os aprendizes. Fala só em bipes e adora pular.',
  'WALL-E/BB-8 (simpatia) + Fall Guys (volume).', 'Corpo feijão PlayerColor com visor preto brilhante embutido na frente (dois olhos de LED ciano), antena fina com bulbo vermelho, parafusos metálicos nas laterais, faixa escura na cintura.',
  'idem; no dano o visor pode mostrar "> <"', '35 px; colisão 10x20.',
  'Modele "Byte": corpo feijão PlayerColor; visor retangular arredondado embutido (preto brilhante, quase rente ao corpo) com dois LEDs ciano emissivos; antena (cilindro fino + esfera vermelha emissiva); parafusos metálicos nas laterais; sem boca. 11 quadros × P1/P2.'),
 ('Raposa', 'fox', 'Ágil e esperta', 'Mascote do Instituto. Escapou de um experimento do Doutor Entropia e agora ajuda quem entra no laboratório. Seu rabo balança quando ela está feliz.',
  'Mascotes expressivos (Crash/Spyro) em volume Fall Guys; orelhas triangulares à Kirby.', 'Corpo na cor do jogador, orelhas pontudas com interior escuro, focinho e peito brancos, rabo grosso com ponta branca que balança.',
  'idem; rabo com movimento secundário (balanço) em todos os quadros', '35 px; colisão 10x20.',
  'Modele "Raposa": corpo feijão PlayerColor; duas orelhas cônicas com interior escuro; focinho branco com nariz preto; barriga/peito branco; rabo de 3 esferas com ponta branca animado em balanço. 11 quadros × P1/P2.'),
]
AURAVIL = [
 ('AURA', ['aura_00.png'], 'Assistente do Instituto', 'IA do laboratório que protege o Núcleo. Só consegue falar por transmissões curtas: os "casos". É a única amiga que nunca desiste dos aprendizes.',
  'EVE (WALL-E), BB-8; hologramas suaves de Ori.', 'Cabeça esférica branca cerâmica, visor escuro com olhos de LED ciano, anel de energia ciano em volta do corpo (tipo Saturno, ABAIXO do rosto), cone luminoso embaixo (flutua), mãozinhas esféricas.',
  'flutuar 24q em loop · piscar 4q · sorrir (opcional)', '26 px; aparece nas perguntas e no painel (avatar).',
  'Modele "AURA": esfera branca cerâmica 0.62 m, visor retangular escuro embutido com dois LEDs ciano, anel de energia ciano emissivo em volta do corpo (inclinação 10°), cone luminoso transparente embaixo, duas mãos esféricas. Render 256x256: quadro 0 idle, quadros 1–4 piscando.'),
 ('Doutor_Entropia', [], 'Vilão principal (só em cena)', 'Ex-pesquisador do Instituto convencido de que "saber demais cansa". Quer apagar o Núcleo para o mundo ficar em silêncio. Cada Guardião é um defeito que ele inventou. Aparece só como silhueta nas telas de transição.',
  'Vilões elegantes e teatrais (Dr. Facilier, Syndrome) em versão silhueta.', 'Silhueta alta e fina, capa longa rasgada que vira fumaça, cartola com lente quebrada, monóculo rachado magenta (#FF4FD8), roxo/preto.',
  '3 poses: observando · rindo · recuando', 'Só em telas de transição (512x768).',
  'Modele "Doutor Entropia" apenas como silhueta/estatueta alta: cartola com lente quebrada, capa longa se desfazendo em fumaça, monóculo magenta emissivo. Render 512x768 transparente, 3 poses.'),
]
MONSTROS = [
 ('Sentinela', ['en_sentinel_*.png'], 'Campo de Treino · terrestre', 'Robô de segurança do pátio de treino, programado para "afastar visitantes". Só sabe patrulhar e nunca entendeu por que ninguém gosta dele.', 'Robôs-cúpula de Clash Royale/Brawl Stars; "inimigo bobo mas sério".', 'Cúpula de metal azul-aço, faixa-visor vermelha emissiva com sobrancelhas pretas bravas, 4 perninhas esféricas, antena com bulbo vermelho.', 'andando 2q (pernas alternando)', '25 px; morre com 1 pisão.', 'Modele "Sentinela": cúpula metálica azul-aço, visor vermelho emissivo com sobrancelhas pretas, 4 pernas, antena. 2 quadros de caminhada.'),
 ('Drone', ['en_drone_*.png'], 'Campo de Treino · voador', 'Drone de vigilância que perdeu o controle remoto e agora voa em círculos, com raiva de tudo que se mexe.', 'Drones cartoon (Rayman) com olho único.', 'Esfera branca, olho vermelho único com sobrancelha, hélice no topo e dois rotores laterais.', '2q (hélice em ângulos diferentes)', '25 px; voa em vai-e-vem.', 'Modele "Drone": esfera branca, olho vermelho emissivo, hélice no topo e dois rotores. 2 quadros.'),
 ('Aranha_de_Cristal', ['en_spider_*.png'], 'Caverna dos Cristais · terrestre', 'Aranha que se alimenta de luz. Os cristais nas costas crescem a cada luz que ela rouba, por isso a caverna está tão escura.', 'Aranhas de Hollow Knight/Terraria em versão "toy", cristais ciano.', 'Corpo violeta escuro, fileira de cristais ciano emissivos nas costas, olhos rosa brilhantes, 8 pernas finas com pontas ciano.', '2q (pernas alternando)', '20 px.', 'Modele "Aranha de Cristal": corpo violeta, cristais ciano emissivos nas costas, olhos rosa emissivos, 8 pernas. 2 quadros.'),
 ('Espectro', ['en_wraith_*.png'], 'Caverna dos Cristais · voador', 'Eco de um explorador que se perdeu na caverna. Só quer companhia, mas toda vez que abraça alguém, machuca.', 'Fantasmas fofos-assustadores (Ori, Luigi’s Mansion estilizado).', 'Corpo-gota violeta com cauda pontuda, olhos ciano brilhantes, duas asas de cristal ciano translúcidas.', '2q (asas para cima/baixo)', '27 px.', 'Modele "Espectro": corpo-gota violeta, olhos ciano emissivos, duas asas de cristal ciano. 2 quadros (asas altas/baixas).'),
 ('Cranio_Rastejante', ['en_skull_*.png'], 'Ruínas dos Ossos · terrestre', 'Crânio de um explorador que "esqueceu" o corpo. Anda sobre os próprios ossos da coluna e ainda procura onde deixou o chapéu.', 'Caveiras cartoon (Day of the Dead estilizado) com acabamento de vinil.', 'Crânio marfim grande, órbitas pretas com pupilas laranja, mandíbula que abre e fecha, perninhas de osso, sobrancelha de osso.', '2q (mandíbula + passos)', '24 px.', 'Modele "Crânio Rastejante": crânio marfim com órbitas pretas e pupilas laranja emissivas, mandíbula móvel, 4 pernas de osso. 2 quadros.'),
 ('Abutre_de_Ossos', ['en_vulture_*.png'], 'Ruínas dos Ossos · voador', 'Abutre do deserto que foi "remontado" pelo Doutor Entropia com sobras de museu. Sobrevoa as ruínas procurando algo que ainda tenha vida.', 'Aves gordinhas cartoon (Angry Birds/Brawl Stars) com asas de costelas.', 'Corpo marrom escuro, cabeça de crânio com bico dourado, olhos laranja, asas com costelas de osso.', '2q (batida de asa)', '22 px.', 'Modele "Abutre de Ossos": corpo marrom, cabeça-crânio com bico dourado, asas de costelas. 2 quadros.'),
 ('Parasita_Esporo', ['en_spore_*.png'], 'Floresta das Sinapses · terrestre', 'Esporo que se agarrou a uma fibra luminosa e aprendeu a andar. Agora acha que é o dono da floresta.', 'Slimes/geleias de Brawl Stars e Kirby com brilho bioluminescente (Avatar).', 'Corpo gelatinoso magenta brilhante, um olho grande ciclope, pontos verdes luminosos nas costas, 3 tentáculos curtos.', '2q (squash/stretch)', '22 px.', 'Modele "Parasita Esporo": corpo gelatinoso magenta, olho grande único, pontos verdes emissivos, 3 tentáculos. 2 quadros com squash.'),
 ('Fogo_Fatuo', ['en_wisp_*.png'], 'Floresta das Sinapses · voador', 'Luz errante que nasceu de uma sinapse apagada. Atrai os distraídos para fora da trilha.', 'Wisps de Ori e Zelda, em versão arredondada e legível.', 'Orbe branco-esverdeado luminoso com olhos escuros grandes e cauda de bolhas verdes.', '2q (cauda ondulando)', '25 px.', 'Modele "Fogo-fátuo": orbe luminoso verde-água com olhos escuros e cauda de bolhas. 2 quadros.'),
]
CHEFOES = [
 ('Colosso_de_Cristal', ['boss_colossus_*.png'], 'Guardião do Mundo 1 — Caverna dos Cristais', 'Um golem de uma antiga mina de prismas. O Doutor Entropia lhe tirou o "foco": ele só enxerga vultos e ataca tudo o que se mexe.', 'Rock Golem (Clash Royale) + cristais de Hollow Knight (Crystal Peak), colorido e limpo.', 'Torso em bloco arredondado de rocha roxa escura (#2E2560), ombros esféricos, núcleo e rachaduras ciano brilhantes, cristais ciano/magenta nas costas, cabeça de bloco com olhos amarelos emissivos e sobrancelhas pesadas, punhos enormes.', '3 quadros: idle · tele (braços para o alto, cristais VERMELHOS) · stun (cabeça baixa, olhos apagados)', '66 px; 3 pisões (2 no modo rápido). Ataque: investida em linha reta.', 'Modele "Colosso de Cristal" (golem de rocha roxa com cristais ciano/magenta, olhos amarelos emissivos, núcleo ciano no peito com rachaduras luminosas). 3 poses: idle, tele (braços para o alto, cristais e rachaduras VERMELHOS emissivos), stun (cabeça baixa, olhos apagados cinza). Render 384x384.'),
 ('Tita_de_Ossos', ['boss_titan_*.png'], 'Guardião do Mundo 2 — Ruínas dos Ossos', 'O esqueleto de um animal gigante de um museu. Entropia soprou "vida" nele, mas sem os nervos: ele se move por impulso, em saltos.', 'Bone Dragon/Skeleton King (Clash Royale) + insetos de osso de Hollow Knight, acabamento limpo.', 'Crânio grande com chifres longos e mandíbula com presas, olhos fundos com brilho laranja, caixa torácica de costelas com núcleo laranja, braços longos com garras, osso marfim (#EADFC2).', '3 quadros: idle · tele (agachado, olhos e núcleo VERMELHOS) · stun (curvado, olhos apagados)', '66 px; 3 pisões. Ataque: salta e solta 2 ondas de choque no chão.', 'Modele "Titã de Ossos": esqueleto bípede curvado, crânio com chifres e presas, olhos laranja emissivos em órbitas fundas, caixa torácica de 5 costelas com núcleo laranja, braços longos com garras. Poses: idle, tele (agachado, olhos e núcleo VERMELHOS), stun (curvado, olhos apagados). 384x384.'),
 ('Hidra_Sinaptica', ['boss_hydra_*.png'], 'Guardião do Mundo 3 — Floresta das Sinapses', 'Nasceu de uma floresta de fibras luminosas. Cada cabeça repete uma mensagem diferente e elas brigam entre si: a hidra não sabe qual sinal seguir.', 'Hidras de Brawl Stars/Clash + neon bioluminescente de Avatar; tentáculos/dendritos.', 'Corpo gelatinoso magenta/roxo (#A82AE0) com espinhos escuros, 3 pescoços longos com cabeças grandes, olhos verdes neon com sobrancelhas furiosas, bocas com presas, pontos de luz como "sinapses".', '3 quadros: idle · tele (cabeça central de boca aberta e brilho laranja) · stun (pescoços caídos, olhos apagados)', '66 px; 3 pisões. Ataque: dispara orbes verdes (um alto, um baixo).', 'Modele "Hidra Sináptica": corpo gelatinoso roxo-magenta com espinhos, três pescoços em S e três cabeças com presas e olhos verdes emissivos, pontos de luz tipo sinapse. Poses: idle, tele (cabeça central com boca aberta e brilho laranja), stun (pescoços caídos, olhos apagados). 384x384.'),
]
# Skins: (grupo, nome, arte_atual(globs em PRN ou OUT), titulo, historia, referencia, forma_cor, animacoes, uso, comando_blender, comando_gimp)
OBST = [
 ('Espinhos', [], 'Dano por contato', 'Cristais/espinhos que o Doutor Entropia plantou nos caminhos para "desorganizar" quem passa.', 'Espinhos de Mario/Rayman, mas com brilho de cristal.', 'Trio de espinhos metálicos com ponta vermelha emissiva, base de pedra; um por tema (cristal, osso, espinho de planta, metal).', '1 quadro', '16x16 px, dano por contato.', 'Modele um trio de espinhos (3 cones metálicos, ponta vermelha emissiva) sobre base de pedra, 4 variações de tema (cristal, osso, vegetal, metal). 256x256, vista frontal.', ''),
 ('Serra_Giratoria', [], 'Dano, movimento em trilho', 'Lâmina de uma máquina de poda que ficou ligada. Corre pelo trilho sem parar.', 'Serras de Super Meat Boy/Mario, versão colorida e legível.', 'Disco serrilhado metálico com cubo central vermelho, brilho nas bordas.', '4 quadros girando', '15 px de diâmetro; passa por trilho.', 'Modele uma serra circular cartoon (disco serrilhado metálico, cubo central vermelho). 4 quadros de rotação 256x256.', ''),
 ('Mola', [], 'Lança o jogador para cima', 'Mola de laboratório criada para testar saltos. Sempre devolve quem pisa nela, mais alto.', 'Molas de Sonic/Mario em linguagem toy.', 'Bobina metálica com cabeça colorida (vermelho/rosa) e base escura.', '3 quadros: solta · comprimida · esticada', '14x6 px.', 'Modele uma mola de bobina com cabeça rosa e base escura. 3 quadros (solta, comprimida, esticada), 256x256.', ''),
 ('Plataforma_Movel', [], 'Carrega o jogador', 'Laje antigravidade do Instituto, programada para ir e voltar.', 'Plataformas de Rayman Legends com luz embaixo.', 'Laje arredondada na cor do tema, luz de energia por baixo, rebites.', '1 quadro (a luz pulsa no jogo)', 'largura 48 px.', 'Modele uma laje arredondada flutuante com luz de energia por baixo e rebites. 4 temas. 512x128.', ''),
 ('Plataforma_que_Cai', [], 'Desmorona 0,4 s depois do pisão', 'Laje velha e rachada. Quem pisa ouve o estalo e corre.', 'Plataformas frágeis de Mario/Rayman.', 'Laje com rachaduras e poeira, mesma cor do tema porém desgastada.', '3 estados: inteira · tremendo · caindo', 'largura 32 px.', 'Modele laje rachada em 3 estados (inteira, tremendo, caindo em pedaços). 512x128.', ''),
 ('Plataforma_que_Pisca', [], 'Aparece e some em ciclo', 'Laje de energia instável: o Instituto a liga e desliga para economizar luz.', 'Plataformas fantasma de Celeste/Mario.', 'Laje translúcida com contorno brilhante; no aviso, pisca mais rápido.', '3 estados: sólida · aviso · fantasma', 'largura 32 px.', 'Modele laje de energia em 3 estados (sólida, piscando, quase invisível com contorno). 512x128.', ''),
 ('Portao_de_Energia', [], 'Trava a saída até o caso ser respondido', 'Barreira de energia da AURA: só abre depois que o aprendiz resolve o caso.', 'Barreiras de laser de jogos de plataforma, em ciano suave.', 'Dois pilares escuros com campo ciano translúcido e partículas.', '2 estados: fechado · aberto', '16x96 px.', 'Modele um portão de energia: dois pilares escuros e campo ciano translúcido; estados fechado e aberto (partículas). 256x768.', ''),
 ('Checkpoint', [], 'Salva o ponto de retorno', 'Bandeira de luz do Instituto: onde ela acende, o aprendiz volta.', 'Bandeiras de checkpoint de Mario/Rayman.', 'Mastro de luz com bandeira que fica verde ao ativar.', '2 estados: apagada · acesa (ondula)', '14x30 px.', 'Modele um mastro com bandeira (cinza apagada e verde acesa, ondulando). 256x512.', ''),
 ('Portal_Secreto', [], 'Leva à fase secreta', 'Porta dourada que o Instituto esconde nas plataformas mais altas. Quem acha ganha bônus.', 'Portais de Mario (canos secretos) e de Ori.', 'Arco/porta dourada com estrela e partículas.', '2 estados: ativa · usada', '16x26 px.', 'Modele uma porta dourada em arco com estrela brilhante e partículas; estados ativa e usada (cinza). 256x384.', ''),
 ('Portal_de_Saida', [], 'Fim da fase', 'Saída luminosa do mundo. Só se abre depois que o Guardião cai.', 'Portais de fim de fase de Mario/Rayman.', 'Elipse luminosa dourada com partículas orbitando; apagada enquanto o chefe vive.', '2 estados: selado · aberto', '32x48 px.', 'Modele um portal em elipse dourada com partículas; estados selado (cinza) e aberto. 256x384.', ''),
]
PERG = [
 ('Pedestal_de_Cristal', ['03-pergunta-na-arena-desktop.jpg'], 'Resposta: ficar parado em cima', 'Pedestal de pedra com gema, onde o aprendiz "firma" a resposta. A gema acende quando ele tem certeza.', 'Pedestais de puzzle de Zelda/Ori.', 'Bloco de pedra arredondado com placa de gema colorida (amarelo ●, verde ■, roxo ▲) e a letra A/B/C gravada.', '2 estados: normal · aceso', '32x32 px.', 'Modele pedestal de pedra com placa de gema e letra gravada (A/B/C); cores amarelo/verde/roxo; estados normal e aceso (emissivo). 256x256, câmera 18° de elevação.', ''),
 ('Porta_de_Resposta', ['12-caso-porta.jpg'], 'Resposta: ficar parado dentro', 'Portais curtos que o Instituto abre dentro do mundo. A porta acende quando o aprendiz fica diante dela.', 'Portais de Ori/Rayman.', 'Arco alto arredondado com interior de energia na cor da resposta e a letra no topo.', '2 estados: normal · aceso', '28x44 px.', 'Modele portal em arco (3 cores) com interior de energia e letra no topo; estados normal e aceso. 256x384.', ''),
 ('Bloco_de_Interrogacao', ['13-caso-bloco-interrogacao.jpg'], 'Resposta: bater com a cabeça por baixo', 'Blocos-mensagem flutuantes da AURA. Um soco por baixo e a resposta fica marcada.', 'Blocos "?" de Mario, em versão original.', 'Placa metálica arredondada colorida com parafusos e a letra; seta embaixo.', '2 estados + animação de batida', '32x16 px.', 'Modele placa/bloco flutuante arredondado (3 cores) com parafusos e letra; estados normal e aceso. 256x128.', ''),
 ('Monstrinho_de_Resposta', ['14-caso-monstrinho.jpg'], 'Resposta: pisar em cima (inofensivo)', 'Criaturinhas-mensagem que a AURA solta no mundo. Gostam de ser pisadas (fazem cócegas).', 'Slimes fofos de Kirby/Brawl Stars.', 'Geleia redonda na cor da resposta, olhos grandes, sorriso e a letra na barriga.', '3 quadros: parado · squash · aceso', '20x20 px.', 'Modele geleia fofa (3 cores), olhos grandes, sorriso, letra na barriga; 3 quadros (parado, achatado, aceso). 256x256.', ''),
 ('Barril_de_Resposta', ['23-caso-barril-caverna.jpg'], 'Resposta: pisar no barril que cai do alto (NOVO)', 'Barris que o Instituto usa para mandar suprimentos. Caem do alto quando o caso começa, quicam e rolam um pouquinho: o aprendiz escolhe o barril certo. (Inspirado nos barris de Donkey Kong, mas inofensivos e dentro do tema.)', 'Barris de Donkey Kong Country (volume e rolagem), em linguagem toy e tematizada por mundo.', 'Barril arredondado com aros e a letra A/B/C na tampa. Por mundo: Campo = madeira com aro metálico; Caverna = barril de cristal translúcido; Ruínas = pedra/osso com cintas de couro; Floresta = vagem orgânica bioluminescente.', 'queda 3q · quique 2q · rolando 4q · achatado 1q · aceso 1q', '24x24 px; inofensivo.', 'Modele um barril cartoon com aros e letra na tampa (A amarelo, B verde, C roxo). 4 variantes de tema (madeira, cristal, pedra/osso, vagem bioluminescente). Quadros: queda, quique, rolando×4, achatado, aceso. 256x256.', ''),
 ('Balao_de_Resposta', ['24-caso-balao-ruinas.jpg'], 'Resposta: tocar o balão (NOVO)', 'Balões-lanterna que sobem do chão do Instituto quando um caso chega. O aprendiz pula e encosta no da sua resposta; ele estoura em confete e volta.', 'Balões de Rayman/Kirby, lanternas flutuantes de Ori.', 'Balão arredondado brilhante com a letra e uma pequena cesta/gema embaixo. Por mundo: Campo = balão de festa; Caverna = lanterna de cristal; Ruínas = balão de pergaminho/areia; Floresta = esporo flutuante bioluminescente.', 'flutuar 4q · estourar 4q (confete)', '20x26 px; sobe e desce suave.', 'Modele balão/lanterna flutuante (3 cores) com letra, cestinha embaixo, 4 variantes de tema; quadros: flutuando×4, estourando×4 com confete. 256x320.', ''),
]
CENARIOS = [
 ('Campo_de_Treino', ['19-cenario-campo-de-treino.jpg'], 'Mundo 0 — dia ensolarado (tutorial)', 'O pátio de treino do Instituto, aberto e claro. Aqui ninguém corre perigo de verdade.', 'Rayman Legends (campos vivos), Super Mario World (colinas), Ori (luz suave).', 'Céu azul → pêssego; sol grande com halo; colinas verdes em camadas; árvores redondas; nuvens fofas; pássaros ao longe; flores.', 'Camadas: céu · montanhas distantes com neve · colinas médias com árvores · mata próxima escura · névoa clara.', 'Papel de parede a lapidar: 4 camadas repetíveis 1280x540 (@2x), sem emenda; acabamento pintado (gradiente + textura suave).', 'Crie 4 camadas PNG 1280x540 repetíveis: far (montanhas azuladas com neve, névoa), mid (colinas verdes + árvores), near (silhuetas de arbustos e capim escuro, com luz de contorno), mist (faixas de névoa translúcidas). Paleta: céu #2F9BFF→#FFF0C8; colinas #8FD0EE, #62C58F, #3AA46B.', 'GIMP: camadas separadas (far/mid/near/mist), filtro Tornar Repetível (Make Seamless) em cada uma, curvas de cor por camada, exportar bg_train_far.png / _mid / _near / _mist.'),
 ('Caverna_dos_Cristais', ['20-cenario-caverna-dos-cristais.jpg'], 'Mundo 1 — noite roxa e cristais', 'Mina antiga cheia de prismas que cantam quando há luz. O Colosso a vigia.', 'Hollow Knight (Crystal Peak) limpo e colorido, Ori (brilho), Rayman (cavernas luminosas).', 'Céu índigo→violeta, nebulosas magenta/ciano, cristais gigantes translúcidos com brilho interno, estalactites, raios de luz, partículas flutuantes.', 'Camadas: céu com nebulosa · cristais gigantes distantes (brilho) · rocha média com estalactites · cristais pequenos em primeiro plano · feixes de luz.', 'Papel de parede a lapidar: 4 camadas 1280x540 repetíveis; brilhos em emissão suave.', 'Crie 4 camadas PNG 1280x540 repetíveis: far (cristais gigantes translúcidos magenta/ciano/violeta com glow), mid (paredes de rocha roxa + estalactites), near (cristais pequenos escuros com luz de contorno ciano), rays (feixes de luz diagonais translúcidos). Paleta: #07052A, #1B1262, #4A2A9E; cristais #5FE8FF, #FF6BE0, #9A8CFF.', 'GIMP: camadas far/mid/near/rays; Brilho de Gauss + modo Adicionar para os glows; Tornar Repetível; exportar bg_s1_far.png / _mid / _near / _rays.'),
 ('Ruinas_dos_Ossos', ['21-cenario-ruinas-dos-ossos.jpg','15-serras-ruinas.jpg'], 'Mundo 2 — pôr do sol no deserto', 'Ruínas de um museu antigo no meio do deserto. Costelas gigantes saem da areia.', 'Journey (deserto dourado), Rayman Legends (ruínas), Hollow Knight (ossos) em tom caloroso.', 'Céu roxo→laranja→pêssego, sol enorme com halo, mesas e arcos de pedra, costelas/ossos gigantes ao longe, poeira no ar, abutres distantes.', 'Camadas: céu com sol · mesas rosadas distantes · ruínas e costelas médias · colunas quebradas e cactos próximos · poeira.', 'Papel de parede a lapidar: 4 camadas 1280x540 repetíveis; textura de rocha/areia suave.', 'Crie 4 camadas PNG 1280x540 repetíveis: far (mesas e arcos rosados, costelas gigantes em silhueta), mid (ruínas com colunas e arcos, textura de pedra), near (colunas quebradas e cactos escuros com luz de contorno laranja), dust (poeira dourada translúcida). Paleta: #4B2A8C, #FF6E5C, #FFC880.', 'GIMP: camadas far/mid/near/dust; Ruído de textura leve; Tornar Repetível; exportar bg_s2_far.png / _mid / _near / _dust.'),
 ('Floresta_das_Sinapses', ['22-cenario-floresta-das-sinapses.jpg','16-fase-secreta.jpg'], 'Mundo 3 — floresta noturna bioluminescente', 'Floresta de fibras luminosas onde cada árvore é um "neurônio". A Hidra vive no coração dela.', 'Avatar (Pandora), Ori and the Blind Forest, Rayman (florestas), neon suave.', 'Céu azul-petróleo→verde, lua grande, troncos altos escuros com halo verde, copas luminosas, cogumelos gigantes, vaga-lumes, névoa verde.', 'Camadas: céu com lua · troncos gigantes distantes · copas e cogumelos médios (glow) · troncos escuros em primeiro plano · névoa.', 'Papel de parede a lapidar: 4 camadas 1280x540 repetíveis; glows verdes/magenta.', 'Crie 4 camadas PNG 1280x540 repetíveis: far (troncos gigantes com copas), mid (copas e cogumelos gigantes com glow verde/magenta), near (troncos escuros com luz de contorno verde), fog (névoa verde translúcida). Paleta: #030A1E, #0A3449, #16866A; neon #7DFFA3, #FF4FD8.', 'GIMP: camadas far/mid/near/fog; Brilho de Gauss + modo Adicionar nos glows; Tornar Repetível; exportar bg_s3_far.png / _mid / _near / _fog.'),
]
COLET = [
 ('Moeda', ['coin_*.png'], 'Moeda: 10 pontos; 25 = +1 coração', 'Moedas de luz que sobraram do Núcleo rachado. Juntar 25 faz um coração brilhar.', 'Moedas de Mario/Sonic, 3D vinil dourado.', 'Disco dourado metálico com anel e símbolo central.', '8 quadros girando', '14 px.', 'Modele moeda dourada (disco 0.92 m, anel, símbolo central) girando 360° em 8 quadros, 128x128.', ''),
 ('Estrela_do_Saber', ['star_*.png'], 'Estrela escondida: 100 pontos + 1 escudo', 'Fragmento do Núcleo escondido nas plataformas mais difíceis. Quem acha ganha um escudo dourado.', 'Estrelas de Mario/Kirby, vinil dourado com glow.', 'Estrela de 5 pontas arredondada, amarelo vivo, brilho emissivo suave.', '8 quadros girando', '22 px.', 'Modele estrela de 5 pontas com bordas arredondadas, dourada com emissão suave, girando em 8 quadros, 128x128.', ''),
 ('Coracao', [], 'Vida: +1 coração (máx. 5)', 'Coração de luz que a AURA solta como recompensa.', 'Corações de Zelda/Kirby, brilho rosa.', 'Coração 3D rosa-vermelho brilhante com reflexo.', 'pulsar 4q', '14 px.', 'Modele coração 3D arredondado rosa-vermelho com reflexo; pulsando em 4 quadros, 128x128.', ''),
 ('Escudo', [], 'Segura 1 dano (máx. 2)', 'Bolha dourada que protege o aprendiz por um instante.', 'Escudos-bolha de Kirby/Rayman.', 'Elipse dourada translúcida com anel brilhante em volta do herói.', '2 quadros (pulsar)', 'envolve o herói.', 'Modele bolha dourada translúcida com anel brilhante; 2 quadros de pulsar; 256x256.', ''),
 ('Orbe_de_Luz_(arma)', [], 'Arma limitada: sem recarga', 'Ao derrotar um Guardião, o aprendiz recolhe um fragmento de energia que dispara orbes de luz. São poucos tiros e não dá para recarregar: cada um conta.', 'Projéteis de Mega Man (buster) e Kirby, em esfera de luz.', 'Esfera de luz branco-dourada com rastro, núcleo brilhante; ícone de munição ✦.', 'voo 3q · impacto 4q', '8 px; 3 tiros por chefe, máx. 6.', 'Modele esfera de luz (0.3 m) branco-dourada com rastro e núcleo brilhante: 3 quadros de voo + 4 de impacto, 128x128; e um ícone de munição (✦) 64x64.', ''),
]
INTERF = [
 ('HUD_e_Botoes', ['11-hud-coracoes-e-moedas.jpg'], 'Barra de vida, moedas, munição, botões de toque', 'A interface do Instituto: tudo arredondado e brilhante, como os botões de um console antigo ligado ao futuro.', 'HUDs de Fall Guys/Brawl Stars; corações de Zelda.', 'Corações vermelhos arredondados, barra de moedas laranja, ícone de munição ✦, botões redondos com a cor do jogador (P1 azul, P2 laranja).', 'estáticos + brilho ao ganhar', 'fonte de títulos Lilita One; texto Nunito.', 'Desenhe o HUD (3 a 5 corações, barra 25 moedas, ícone ✦ de munição, botões ◀ ▶ PULAR e ATIRAR) em painel PNG 2048x512 com cores P1/P2.', 'GIMP: um arquivo com camadas por elemento; exportar cada elemento em PNG transparente.'),
]

def w(path, text): os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w', encoding='utf-8').write(text)
def mk(base, name, md, art_globs, srcdir, entrega_hint):
    d = os.path.join(base, name)
    for sub in ('esboco_do_autor', 'arte_atual', 'entrega'): os.makedirs(os.path.join(d, sub), exist_ok=True)
    w(os.path.join(d, 'HISTORIA_E_REFERENCIA.md'), md)
    w(os.path.join(d, 'esboco_do_autor', 'COLOQUE_SEU_ESBOCO_AQUI.txt'), 'Coloque aqui o seu esboço (JPG/PNG/PDF) deste item.\n')
    w(os.path.join(d, 'entrega', 'RESULTADO_FINAL.txt'), entrega_hint + '\nColoque aqui os PNGs finais do Blender/GIMP.\n')
    n = 0
    for g in art_globs:
        for f in sorted(glob.glob(os.path.join(srcdir, g))): shutil.copy(f, os.path.join(d, 'arte_atual', os.path.basename(f))); n += 1
    return n
def ficha(nome, titulo, historia, ref, forma, anim, uso, cmd, gimp=''):
    s = f"# {nome.replace('_', ' ')}\n**{titulo}**\n\n## História (curta)\n{historia}\n\n## Referência artística\n{ref}\n\n## Forma e cor\n{forma}\n\n## Animações / quadros\n{anim}\n\n## Uso no jogo\n{uso}\n\n## COMANDO PARA O BLENDER (cole no GPT, depois do comando-mestre)\n{cmd}\n"
    if gimp: s += f"\n## COMANDO PARA O GIMP\n{gimp}\n"
    s += "\n## Onde colocar\n- `esboco_do_autor/` ← seu esboço\n- `arte_atual/` ← o que o jogo usa hoje (referência)\n- `entrega/` ← resultado final\n"
    return s

if os.path.exists(ROOT): shutil.rmtree(ROOT)
os.makedirs(ROOT)
w(os.path.join(ROOT, '00_COMANDO_MESTRE_BLENDER_E_GIMP.md'), MESTRE)
w(os.path.join(ROOT, '00_LEIA_PRIMEIRO.md'), LEIA + '\n' + MUNDO + '\n')
tot = 0
for (nome, key, titulo, hist, ref, forma, anim, uso, cmd) in HEROIS:
    tot += mk(os.path.join(ROOT, '01_Herois'), nome, ficha(nome, titulo, hist, ref, forma, anim, uso, cmd), chars(nome, key), OUT, 'Entregar 11 quadros × 2 cores (P1 azul, P2 laranja).')
for (nome, art, titulo, hist, ref, forma, anim, uso, cmd) in AURAVIL:
    tot += mk(os.path.join(ROOT, '02_Aura_e_Vilao'), nome, ficha(nome, titulo, hist, ref, forma, anim, uso, cmd), art, OUT, 'Entregar conforme a ficha.')
for (nome, art, titulo, hist, ref, forma, anim, uso, cmd) in MONSTROS:
    tot += mk(os.path.join(ROOT, '03_Monstros'), nome, ficha(nome, titulo, hist, ref, forma, anim, uso, cmd), art, OUT, 'Entregar 2 quadros 256x256.')
for (nome, art, titulo, hist, ref, forma, anim, uso, cmd) in CHEFOES:
    tot += mk(os.path.join(ROOT, '04_Chefoes'), nome, ficha(nome, titulo, hist, ref, forma, anim, uso, cmd), art, OUT, 'Entregar 3 quadros 384x384 (idle, tele, stun).')
for grupo, lista, src in (('Obstaculos', OBST, PRN), ('Objetos_de_Pergunta', PERG, PRN), ('Coletaveis_e_Arma', COLET, OUT), ('Interface_HUD', INTERF, PRN)):
    for (nome, art, titulo, hist, ref, forma, anim, uso, cmd, gimp) in [(x + ('',))[:10] if len(x) == 9 else x for x in lista]:
        tot += mk(os.path.join(ROOT, '05_Skins', grupo), nome, ficha(nome, titulo, hist, ref, forma, anim, uso, cmd, gimp), art, src, 'Entregar conforme a ficha.')
for (nome, art, titulo, hist, ref, forma, camadas, anim, cmd, gimp) in CENARIOS:
    tot += mk(os.path.join(ROOT, '05_Skins', 'Cenarios_Fundo'), nome, ficha(nome, titulo, hist, ref, forma, camadas + ' ' + anim, 'Quatro camadas com parallax (velocidades 0.10, 0.25, 0.45 e a névoa por cima).', cmd, gimp), art, PRN, 'Entregar 4 camadas PNG 1280x540 repetíveis (far, mid, near, névoa/raios/poeira).')
print('pasta criada em:', ROOT, '| arquivos de arte copiados:', tot)

# ---- notas extras nas pastas de skins ----
w(os.path.join(ROOT, '05_Skins', 'Objetos_de_Pergunta', '00_COMO_AS_PERGUNTAS_VARIAM.md'), """# Como as perguntas variam dentro do jogo

Regra: **cada pergunta usa um objeto diferente e uma ação diferente**, sempre dentro do tema do mundo (nada fora do universo do jogo).
O objeto nunca diz se a resposta está certa; só marca a escolha (acende/estoura/aperta).

| Fase | Pergunta 1 | Pergunta 2 | Pergunta 3 |
|---|---|---|---|
| Caverna dos Cristais | Barril (cai do alto, pisar) | Porta (ficar parado dentro) | Bloco de interrogação (bater com a cabeça) |
| Ruínas dos Ossos | Balão (pular e encostar) | Monstrinho (pisar) | Pedestal (ficar parado em cima) |
| Floresta das Sinapses | Bloco de interrogação | Barril (cai do alto, pisar) | Balão |

Toda opção tem: **cor + forma + letra** (A amarelo ●, B verde ■, C roxo ▲), para quem não lê bem e para daltonismo.
Cada objeto tem uma versão por mundo (ex.: barril de madeira no Campo, de cristal na Caverna, de pedra/osso nas Ruínas, vagem na Floresta).
Ideias para novos objetos (mesma regra): caixote que se abre, lanterna que acende, ovo que choca, sino que toca, placa giratória.
""")
w(os.path.join(ROOT, '05_Skins', 'Cenarios_Fundo', '00_COMO_ENTREGAR_OS_FUNDOS.md'), """# Como entregar os fundos (papel de parede) para o jogo usar

Cada mundo tem **4 camadas** PNG, 1280x540, **repetíveis na horizontal** (a emenda esquerda/direita não pode aparecer):
  far  (mais distante, anda devagar)  ·  mid  (meio)  ·  near (perto)  ·  mist/rays/dust/fog (névoa por cima)

Nomes (a quarta camada sempre se chama `mist` para o jogo):
  bg/train_far.png  train_mid.png  train_near.png  train_mist.png
  bg/s1_far.png     s1_mid.png     s1_near.png     s1_mist.png      (Caverna dos Cristais)
  bg/s2_far.png     s2_mid.png     s2_near.png     s2_mist.png      (Ruínas dos Ossos)
  bg/s3_far.png     s3_mid.png     s3_near.png     s3_mist.png      (Floresta das Sinapses)

Como ligar: coloque os PNGs em  prova-arcade-DEMO/app/gfx/bg/  e liste em  app/gfx/bg/manifest.json, por exemplo:
  { "s1": ["far", "mid", "near", "mist"] }
O jogo passa a usar a sua arte no lugar da gerada por código (as camadas que faltarem continuam as atuais).
Dica de GIMP: Filtros > Mapa > Tornar Repetível (Make Seamless); Camada > Transparência; exporte PNG.
""")
print('notas extras criadas')
