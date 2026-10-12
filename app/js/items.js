/* Banco de itens — pacote de disciplina "Ciências · 6º ano · 3º bimestre".
 * Habilidades: Currículo Paulista / Currículo em Ação (SEDUC-SP), Habilidades Essenciais, Anos Finais.
 * O motor do jogo é neutro: troque este pacote por outro (mesmo formato) para outra disciplina.
 * Formato SARESP/ENEM: situação (ctx) + pergunta (stem) + 3 alternativas. Cada alternativa errada traz uma
 * tag de equívoco (m) que alimenta o diagnóstico. ok:true = resposta esperada.
 * Cada "slot" tem Forma A (jogador 1 / 1P) e Forma B (jogador 2): mesma habilidade e nível, situação diferente. */

export const PACK = {
  id: 'ci6-b3',
  title: 'Ciências · 6º ano · 3º bimestre',
  source: 'Currículo Paulista / Currículo em Ação (SEDUC-SP) — Habilidades Essenciais, Anos Finais',
  skills: [
    { code: 'EF06CI08', short: 'Visão e lentes corretivas', stage: 1,
      text: 'Explicar a importância da visão (captação e interpretação das imagens) na interação do organismo com o meio e, com base no funcionamento do olho humano, selecionar lentes adequadas para a correção de diferentes defeitos da visão.' },
    { code: 'EF06CI09', short: 'Sistemas locomotor e nervoso', stage: 2,
      text: 'Concluir, com base na observação de situações do cotidiano ou reproduzidas em vídeos, que a estrutura, a sustentação e a movimentação dos seres vertebrados resultam da interação entre os sistemas muscular, ósseo e nervoso.' },
    { code: 'EF06CI10', short: 'Substâncias psicoativas', stage: 3,
      text: 'Explicar como o funcionamento do sistema nervoso pode ser afetado por substâncias psicoativas.' },
  ],
  misconceptions: {
    V1: 'Acredita que o olho "lança" algo até o objeto (a visão sairia do olho), e não que a luz vinda do objeto entra no olho.',
    V2: 'Atribui ao olho sozinho a interpretação da imagem, sem considerar o papel do cérebro.',
    V3: 'Trata a escuridão como algo que "cobre" os objetos, em vez de ausência de luz chegando ao olho.',
    V4: 'Acha que os objetos que vemos produzem luz própria, em vez de refletirem a luz de uma fonte.',
    L1: 'Confunde o tipo de lente: troca a lente divergente (miopia) pela convergente, ou o contrário (hipermetropia).',
    L2: 'Acha que o mesmo tipo de lente (ou só o "grau") serve para qualquer defeito da visão.',
    L3: 'Entende a correção como "aumentar" o objeto, e não como ajustar onde a luz forma a imagem no olho.',
    L4: 'Acredita que lentes não corrigem defeitos da visão.',
    L5: 'Confunde lente corretiva com filtro de proteção contra a luz.',
    E1: 'Atribui aos ossos o movimento autônomo, sem a ação dos músculos.',
    E2: 'Reduz o esqueleto a dar forma e ignora sustentação e proteção de órgãos.',
    E3: 'Associa ao esqueleto funções que ele não tem (ex.: produzir calor).',
    M1: 'Acredita que o músculo "empurra"; na verdade ele só se contrai (puxa).',
    M2: 'Acha que o osso se move sozinho e o músculo apenas acompanha.',
    M3: 'Não compreende que músculos de pares realizam ações opostas (um contrai, o outro relaxa).',
    N1: 'Coloca o osso como "comandante" do movimento no lugar do sistema nervoso.',
    N2: 'Acha que os músculos agem sem comando do sistema nervoso.',
    P1: 'Restringe "psicoativa" a drogas ilegais ou remédios fortes, ignorando café, álcool e nicotina.',
    P2: 'Pensa que substâncias psicoativas atuam só no sistema digestório.',
    P3: 'Generaliza: acha que tudo que entra no corpo é psicoativo.',
    P4: 'Acredita que o álcool aumenta a força/rapidez, em vez de tornar o sistema nervoso mais lento.',
    P5: 'Acha que o álcool não afeta atenção, reflexos e equilíbrio (efeito só local).',
    P6: 'Atribui o desequilíbrio a efeitos nos ossos, e não à comunicação do sistema nervoso com os músculos.',
    P7: 'Associa dependência a "fraqueza de caráter", e não a adaptação do sistema nervoso à substância.',
    P8: 'Acredita que o que é legal é seguro (ex.: cigarro e álcool não causariam dependência).',
    P9: 'Acredita que adolescentes são mais resistentes que adultos aos efeitos dessas substâncias.',
    IDK: 'Declarou não saber responder (marcou "Não sei"): a habilidade ainda não foi construída ou o aluno não reconheceu o conceito.',
  },
  slots: [
    /* ---------------- EF06CI08 ---------------- */
    { skill: 'EF06CI08', forms: {
      A: { ctx: 'Após um acidente, uma pessoa tem os olhos saudáveis, mas uma lesão na região do cérebro que recebe os sinais do olho. Ela diz: "Eu vejo luz e cores, mas não reconheço o que estou olhando."',
        stem: 'Qual explicação científica é a mais adequada para o que acontece com ela?', opts: [
        { t: 'A luz entra no olho e forma imagem na retina, mas o cérebro não consegue interpretar os sinais recebidos.', ok: true },
        { t: 'O olho, sozinho, interpreta as imagens; a lesão no cérebro afetou apenas a memória dela, não o reconhecimento visual.', m: 'V2' },
        { t: 'O olho deixou de emitir os raios que alcançam os objetos, por isso ela já não consegue identificá-los ao olhar.', m: 'V1' } ] },
      B: { ctx: 'Ao entrar em um cinema escuro, Léo demora a enxergar. Minutos depois, já distingue as poltronas. A única fonte de luz do ambiente é a tela do filme, e as poltronas não produzem luz própria.',
        stem: 'Como Léo consegue enxergar as poltronas?', opts: [
        { t: 'A luz da tela é refletida pelas poltronas, entra nos olhos dele e forma imagens que o cérebro interpreta.', ok: true },
        { t: 'Os olhos dele emitem um feixe que ilumina as poltronas, e esse feixe fica mais forte com o passar do tempo no escuro.', m: 'V1' },
        { t: 'As poltronas produzem uma luz fraca própria, que só se torna visível quando a luz da tela diminui no ambiente.', m: 'V4' } ] } } },
    { skill: 'EF06CI08', forms: {
      A: { ctx: 'Carlos enxerga bem o caderno de perto, mas a lousa é um borrão. O oftalmologista explica que, no olho dele, a imagem dos objetos distantes se forma antes da retina.',
        stem: 'Qual lente deve ser prescrita e por quê?', opts: [
        { t: 'Divergente: ela espalha os raios antes de entrarem no olho, empurrando a imagem para trás, até a retina.', ok: true },
        { t: 'Convergente: ela junta os raios antes de entrarem no olho e, assim, aproxima a imagem distante da retina.', m: 'L1' },
        { t: 'Nenhuma: o problema está na retina, que precisa ser aproximada do cristalino com exercícios oculares diários.', m: 'L4' } ] },
      B: { ctx: 'Ana lê o celular sem esforço, mas não reconhece o rosto de um colega do outro lado da quadra. Ela vai usar óculos para ver de longe.',
        stem: 'Qual alternativa descreve corretamente a lente indicada e o motivo?', opts: [
        { t: 'Divergente (mais fina no centro), pois espalha os raios e corrige a imagem que se formava antes da retina.', ok: true },
        { t: 'Convergente (mais grossa no centro), pois junta os raios e corrige a imagem que se formava antes da retina.', m: 'L1' },
        { t: 'Convergente, pois aumenta o tamanho aparente do rosto, e por isso ela passa a reconhecê-lo de longe sem esforço.', m: 'L3' } ] } } },
    { skill: 'EF06CI08', forms: {
      A: { ctx: 'Paulo enxerga bem de longe, mas lê com o braço esticado. Rita enxerga bem de perto, mas não reconhece letras na lousa. Os dois usam óculos.',
        stem: 'Sobre as lentes dos óculos de Paulo e de Rita, é correto afirmar que:', opts: [
        { t: 'Paulo usa lente convergente, pois tem hipermetropia, e Rita usa lente divergente, pois tem miopia.', ok: true },
        { t: 'Paulo usa lente divergente, pois tem hipermetropia, e Rita usa lente convergente, pois tem miopia.', m: 'L1' },
        { t: 'Os dois usam o mesmo tipo de lente; muda apenas o grau de cada uma, de acordo com o defeito.', m: 'L2' } ] },
      B: { ctx: 'Uma aluna precisa afastar o livro para ler e sente dor de cabeça no fim do dia. O oftalmologista diz que, no olho dela, a imagem dos objetos próximos se forma depois da retina.',
        stem: 'Qual lente e qual explicação estão corretas?', opts: [
        { t: 'Convergente: junta os raios antes de entrarem no olho, trazendo a imagem para a retina.', ok: true },
        { t: 'Divergente: espalha os raios antes de entrarem no olho, trazendo a imagem para a retina.', m: 'L1' },
        { t: 'Lente escura: reduz a luz que entra no olho e, com isso, a imagem se forma na retina.', m: 'L5' } ] } } },

    /* ---------------- EF06CI09 ---------------- */
    { skill: 'EF06CI09', forms: {
      A: { ctx: 'Em um vídeo, uma onça corre e salta sobre um tronco. Um aluno afirma: "O esqueleto é só uma estrutura rígida; quem faz o animal correr são apenas os músculos."',
        stem: 'Qual correção é a mais adequada à fala do aluno?', opts: [
        { t: 'O esqueleto também sustenta o corpo e dá apoio: sem ossos rígidos para os músculos puxarem, não haveria movimento.', ok: true },
        { t: 'A fala está certa: o esqueleto apenas protege os órgãos internos, e o movimento depende só dos músculos do animal.', m: 'E2' },
        { t: 'A fala está errada: quem move o animal são os ossos, e os músculos só dão forma e volume ao corpo dele.', m: 'E1' } ] },
      B: { ctx: 'A tartaruga tem uma carapaça rígida (parte do esqueleto) que protege o corpo. Um grupo de alunos discute qual é o papel do esqueleto nos vertebrados em geral.',
        stem: 'Qual afirmação resume melhor a função do esqueleto?', opts: [
        { t: 'Sustenta o corpo, protege órgãos importantes e fornece apoio para a ação dos músculos.', ok: true },
        { t: 'Produz calor para manter a temperatura do corpo e protege os músculos contra o atrito.', m: 'E3' },
        { t: 'Move o corpo sozinho, sem precisar de músculos ou de nervos para comandar o movimento.', m: 'E1' } ] } } },
    { skill: 'EF06CI09', forms: {
      A: { ctx: 'Ao levantar uma sacola, o bíceps do braço se contrai e o tríceps relaxa. Ao baixar a sacola devagar, o tríceps se contrai e o bíceps relaxa.',
        stem: 'O que essa observação mostra sobre o funcionamento dos músculos?', opts: [
        { t: 'Músculos só puxam (contraem); para movimentos opostos, músculos antagonistas se alternam: um contrai enquanto o outro relaxa.', ok: true },
        { t: 'Cada músculo empurra o osso para um lado, e o músculo oposto o empurra de volta, alternando a força o tempo todo.', m: 'M1' },
        { t: 'Os dois músculos se contraem juntos o tempo todo; só a intensidade da força muda conforme o movimento desejado.', m: 'M3' } ] },
      B: { ctx: 'Um estudante ficou semanas com o braço engessado, sem mexer o cotovelo. Ao tirar o gesso, os músculos do braço estavam menores e fracos, e o cotovelo mal dobrava.',
        stem: 'Qual explicação se relaciona melhor ao funcionamento do sistema locomotor?', opts: [
        { t: 'Sem uso, os músculos que movem os ossos enfraquecem; o movimento depende dessa contração, comandada pelos nervos.', ok: true },
        { t: 'Os ossos é que dobram o cotovelo sozinhos, então a fraqueza dos músculos não explicaria o problema do braço.', m: 'M2' },
        { t: 'Os músculos empurram o osso como molas; sem uso, perderam a "mola" e por isso o cotovelo não consegue dobrar.', m: 'M1' } ] } } },
    { skill: 'EF06CI09', forms: {
      A: { ctx: 'Em uma partida de vôlei, Marta vê a bola descer, decide cortar e salta para atingi-la.',
        stem: 'Qual sequência descreve melhor a interação entre os sistemas do corpo nessa jogada?', opts: [
        { t: 'Os olhos captam a cena, o cérebro decide, os nervos levam o comando e os músculos se contraem, puxando os ossos.', ok: true },
        { t: 'Os ossos recebem a ordem do cérebro e puxam os músculos, e é assim que o salto acontece no momento certo.', m: 'N1' },
        { t: 'Os músculos percebem a bola e decidem sozinhos; os nervos só avisam o cérebro depois que o movimento acontece.', m: 'N2' } ] },
      B: { ctx: 'Uma lesão na medula espinhal pode deixar uma pessoa sem mexer as pernas, mesmo que os músculos e os ossos das pernas estejam íntegros.',
        stem: 'Por que isso acontece?', opts: [
        { t: 'Porque os sinais do cérebro não chegam aos músculos pelos nervos e, sem esse comando, os músculos não se contraem.', ok: true },
        { t: 'Porque os ossos das pernas deixam de receber ordens do cérebro e, por isso, deixam de puxar os músculos.', m: 'N1' },
        { t: 'Porque os músculos agem sem comando do sistema nervoso, e a lesão apenas enfraquece os ossos das pernas dele.', m: 'N2' } ] } } },

    /* ---------------- EF06CI10 ---------------- */
    { skill: 'EF06CI10', forms: {
      A: { ctx: 'Uma lista traz as substâncias: cafeína (café e energéticos), nicotina (cigarro), álcool (bebidas), vitamina C (suco de laranja) e amoxicilina (antibiótico).',
        stem: 'Quais delas são classificadas como psicoativas?', opts: [
        { t: 'Cafeína, nicotina e álcool, pois agem no sistema nervoso e podem alterar sensações, humor ou comportamento.', ok: true },
        { t: 'Apenas as proibidas por lei; cafeína, nicotina e álcool, por serem legais, não alteram o sistema nervoso.', m: 'P1' },
        { t: 'Todas elas, pois qualquer substância ingerida chega ao cérebro e altera o comportamento de quem a consome.', m: 'P3' } ] },
      B: { ctx: 'Um energético contém cafeína. Depois de beber duas latas à noite, um adolescente sente o coração acelerado e não consegue dormir.',
        stem: 'Qual explicação científica é a mais adequada?', opts: [
        { t: 'A cafeína é psicoativa: estimula o sistema nervoso, aumenta o alerta e pode atrapalhar o sono.', ok: true },
        { t: 'A cafeína age só no estômago, e o incômodo vem da digestão do café, não do sistema nervoso da pessoa.', m: 'P2' },
        { t: 'A cafeína é natural e de venda livre, por isso não atua no sistema nervoso nem muda o comportamento.', m: 'P1' } ] } } },
    { skill: 'EF06CI10', forms: {
      A: { ctx: 'Em um teste de laboratório, voluntários devem apertar um botão assim que uma luz acende. Depois de consumir álcool, o tempo que levam para apertar o botão aumenta.',
        stem: 'O que esse resultado indica sobre o efeito do álcool no sistema nervoso?', opts: [
        { t: 'O álcool deixa a comunicação do sistema nervoso mais lenta, o que prejudica reflexos e coordenação.', ok: true },
        { t: 'O álcool acelera o sistema nervoso e torna a resposta mais forte e rápida, porém menos precisa.', m: 'P4' },
        { t: 'O álcool afeta apenas o fígado; o aumento do tempo é coincidência, sem relação com o sistema nervoso.', m: 'P5' } ] },
      B: { ctx: 'Uma campanha afirma: "Se beber, não dirija." Um estudante diz que o aviso exagera, pois o álcool só atrapalha quem bebe muito.',
        stem: 'Qual argumento científico sustenta a campanha?', opts: [
        { t: 'Mesmo em doses menores, o álcool pode reduzir a atenção e os reflexos, aumentando o risco de acidentes.', ok: true },
        { t: 'O álcool só afeta o estômago e o fígado, então o risco ao dirigir seria apenas social, não corporal.', m: 'P5' },
        { t: 'O álcool aumenta a força dos músculos, e a pessoa perde o controle da velocidade do carro por excesso de força.', m: 'P4' } ] } } },
    { skill: 'EF06CI10', forms: {
      A: { ctx: 'Uma pessoa começou a fumar "só para experimentar". Meses depois, sente irritação e ansiedade quando passa algumas horas sem cigarro.',
        stem: 'Qual explicação se relaciona melhor com o funcionamento do sistema nervoso?', opts: [
        { t: 'A nicotina é psicoativa: o sistema nervoso se adapta a ela, e a falta causa desconforto, o que caracteriza dependência.', ok: true },
        { t: 'É falta de força de vontade, pois substâncias vendidas legalmente não alteram o funcionamento do sistema nervoso de ninguém.', m: 'P7' },
        { t: 'É coincidência: o cigarro é vendido legalmente e, por isso, não causa dependência nem altera o cérebro.', m: 'P8' } ] },
      B: { ctx: 'Um vídeo viral diz: "Bebida de adulto não faz mal para adolescente: o corpo jovem é mais resistente."',
        stem: 'Do ponto de vista científico, essa afirmação:', opts: [
        { t: 'É falsa: o sistema nervoso em desenvolvimento é mais sensível, e o uso precoce aumenta os riscos, como a dependência.', ok: true },
        { t: 'É verdadeira: adolescentes são mais resistentes que adultos, então os efeitos no sistema nervoso deles são bem menores.', m: 'P9' },
        { t: 'É verdadeira apenas para bebidas vendidas legalmente, que não afetam o sistema nervoso nem causam dependência.', m: 'P8' } ] } } },
  ],
};

/* Item de treino (tutorial) — método científico; não pertence às 3 habilidades e não entra no diagnóstico. */
export const PRACTICE = {
  ctx: 'Um grupo de estudantes quer descobrir se a luz influencia o crescimento de uma planta.',
  stem: 'Qual montagem permite uma comparação justa?',
  opts: [
    { t: 'Duas plantas iguais, uma no claro e outra no escuro, mantendo água e solo iguais.', ok: true },
    { t: 'Uma planta no claro e outra de espécie diferente no escuro, com quantidades de água diferentes.', ok: false },
    { t: 'Observar uma única planta no claro, sem comparar com nenhuma outra.', ok: false },
  ],
};

/* banco ampliado da demo (formas C–G) */
import { EXTRA, EXTRA_MISC } from './bank_extra.js';
PACK.slots.forEach((sl, i) => Object.assign(sl.forms, EXTRA[i] || {}));
Object.assign(PACK.misconceptions, EXTRA_MISC);

/* ---- REBASE NO GUIA DO CURRÍCULO PRIORIZADO 2026: 5 habilidades × 3 componentes (slots) ----
 * Ordem dos slots: EF06CI06 (0-2) · EF06CI07 (3-5) · EF06CI08 (6-8) · EF06CI09 (9-11) · EF06CI10 (12-14).
 * Os slots de visão/captação, locomotor e psicoativas vêm do banco anterior; os demais são novos (bank_guia.js). */
import { LABELS as OLDL } from './labels.js';
import { GUIA_SLOTS as G, GUIA_MISC, GUIA_SKILLS } from './bank_guia.js';
Object.assign(PACK.misconceptions, GUIA_MISC);
const OLD = PACK.slots;
OLD.forEach((sl, i) => Object.entries(sl.forms).forEach(([f, it]) => it.opts.forEach((o, j) => { if (!o.l) o.l = (OLDL[i + f] || [])[j]; })));
PACK.slots = [G.n0, G.n1, G.n2, G.s0, G.s1, G.s2, OLD[0], G.o1, G.o2, OLD[3], OLD[4], OLD[5], OLD[6], OLD[7], OLD[8]];
const [s8, s9, s10] = PACK.skills;
Object.assign(s8, { short: 'Visão: olho, luz e imagem', ae: 'AE7', priorizada: false });
Object.assign(s9, { ae: 'AE8', priorizada: true });
Object.assign(s10, { ae: 'AE7', priorizada: false });
PACK.skills = [GUIA_SKILLS.EF06CI06, GUIA_SKILLS.EF06CI07, s8, s9, s10];
PACK.id = 'ci6-guia2026';
PACK.title = 'Ciências · 6º ano · Corpo humano (Currículo Priorizado 2026)';
PACK.source = 'Guia do Currículo Priorizado 2026 (SEDUC-SP) — Ciências, Anos Finais, 6º ano: AE6, AE7, AE8';
