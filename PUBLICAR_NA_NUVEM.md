# Publicar o Prova Arcade na internet (demo 24 h + aplicação em sala)

© Thiago Silva · leia primeiro a seção 0.

## 0. Por que o QR não abriu no seu celular
O QR da Central apontava para `http://localhost:8899` (ou para o IP do seu computador, ex.: `192.168.0.52`).
Esses endereços **só existem dentro do seu computador / do seu Wi-Fi**. Com **internet móvel (4G/5G)** o celular não enxerga o PC, então a página nunca abre.
**Solução definitiva:** o jogo precisa estar num servidor na internet com endereço público `https://…`. Depois disso o QR funciona em qualquer celular, em qualquer rede.

A Central agora avisa em vermelho quando o QR aponta para um endereço local.

## 1. O que você precisa decidir
| | Vitrine (demo) | Pesquisa (alunos) |
|---|---|---|
| Para quê | LinkedIn, WhatsApp, diretoria | coleta de dados em sala |
| Instância | **separada**, `PA_EDITION=premium` | **separada**, edição pesquisa |
| Dados | licenças e acessos da demo | respostas dos alunos (LGPD!) |
| Endereço | ex.: `demo.seudominio.com.br` | ex.: `prova.seudominio.com.br` |

Duas instâncias = **dois serviços** na nuvem, cada um com o **seu disco**. Assim os dados nunca se misturam e a demo pode ficar pública sem risco para a pesquisa.

## 2. Caminho mais simples: Render.com (sem mexer em servidor)
Custo aproximado (confira no site): plano pago pequeno + disco persistente por GB. **O plano grátis "dorme" e não serve para sala de aula** (primeiro acesso demora e some o disco).

1. Crie uma conta no GitHub e um repositório **privado** com este projeto (veja a seção 5).
2. Crie conta em render.com → **New → Blueprint** → escolha o repositório.
   * Para a **pesquisa**: arquivo `render.yaml`.
   * Para a **vitrine**: arquivo `render-demo.yaml` (já traz `PA_EDITION=premium`).
3. Em **Environment**, crie `ADMIN_PASSWORD` com uma **senha forte** (é a senha da Central de Gestão).
4. Aguarde o deploy. O endereço sai como `https://prova-arcade.onrender.com` (ou o nome que você deu).
5. Abra o serviço → **Logs**. Na **primeira execução** aparecem os **códigos de licença** (anote!). Eles só aparecem uma vez.
6. Abra `https://SEU-ENDERECO/admin`, entre com `ADMIN_PASSWORD`.
7. **Aplicações e QR Code** → digite em *Endereço público do site* o `https://SEU-ENDERECO` → gere o QR. **Teste no seu celular com o Wi-Fi desligado.**
8. (Opcional, recomendado) **Domínio próprio**: registre um `.com.br`, aponte um subdomínio (CNAME) para o Render e ative HTTPS lá. Domínio próprio ajuda a rede do estado a liberar.

## 3. Alternativa barata e 24 h: um servidor (VPS) com Docker + Caddy
Serve para Oracle Cloud "Always Free", Hetzner, DigitalOcean etc. Exemplo (Ubuntu):

```bash
sudo apt update && sudo apt install -y docker.io git
git clone https://github.com/SEU-USUARIO/prova-arcade.git && cd prova-arcade
sudo docker build -t prova-arcade .
# PESQUISA (porta 8899) e VITRINE (porta 8900), cada uma com seu volume:
sudo docker run -d --restart=always --name pa-pesquisa -p 127.0.0.1:8899:8899 \
  -e ADMIN_PASSWORD='TROQUE-ESTA-SENHA' -v pa_pesquisa:/srv/data prova-arcade
sudo docker run -d --restart=always --name pa-demo -p 127.0.0.1:8900:8899 \
  -e ADMIN_PASSWORD='OUTRA-SENHA-FORTE' -e PA_EDITION=premium -v pa_demo:/srv/data prova-arcade
# HTTPS automático com Caddy:
sudo apt install -y caddy
printf 'prova.seudominio.com.br { reverse_proxy 127.0.0.1:8899 }\ndemo.seudominio.com.br { reverse_proxy 127.0.0.1:8900 }\n' | sudo tee /etc/caddy/Caddyfile
sudo systemctl reload caddy
```
Os códigos de licença da 1ª execução: `sudo docker logs pa-pesquisa | head -20`.

## 4. Plano B para **terça-feira** (se não der tempo de publicar)
**Túnel temporário** — o seu computador continua sendo o servidor, mas ganha um endereço público por algumas horas:
1. Deixe o servidor rodando (`node server.js`).
2. Dê dois cliques em `ABRIR_NA_INTERNET_TEMPORARIO.bat` e deixe a janela aberta.
3. Ele mostra um endereço `https://….lhr.life`. Use **esse** endereço no campo *Endereço público do site* da Central e **gere o QR de novo**.

Riscos (decida com consciência):
* O computador precisa ficar **ligado, com internet e com a janela aberta** durante toda a aplicação.
* O tráfego passa por um serviço **de terceiros** (localhost.run). Para dados de menores, **prefira a nuvem** (seções 2 ou 3).
* O endereço **muda** a cada vez; gere um QR novo.
* A rede do estado pode bloquear o domínio do túnel. **Teste antes, na escola, com um celular de aluno.**

## 5. GitHub (portfólio e currículo)
* **Repositório privado** para a versão completa (tem o banco de itens da prova: **não publique**; exposto, o instrumento perde a validade).
* **Repositório público de vitrine** (sem o banco de itens e sem dados): rode `node tools/make_public_showcase.mjs` e publique a pasta `../prova-arcade-showcase`.
* Comandos básicos:
```bash
git init && git add . && git commit -m "Prova Arcade"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/prova-arcade.git
git push -u origin main
```
* `.gitignore` já impede subir `data/` (licenças, senhas e resultados).

## 6. Rede do estado
Filtros olham o **domínio**. Use domínio próprio com HTTPS, evite subdomínios gratuitos de túnel, e peça à TI da Diretoria para **liberar o endereço**. Teste com um aparelho de aluno antes do dia.

## 7. Antes de usar com alunos (checklist)
- [ ] Abrir o QR no celular **com Wi-Fi desligado** (4G).
- [ ] Jogar até o fim (1 jogador) e ver o resultado na Central.
- [ ] Senha do admin forte e guardada. Códigos de licença anotados.
- [ ] Aviso/consentimento da escola sobre dados dos alunos (LGPD).
- [ ] Backup: baixe o arquivo `licencas.db` (volume `/srv/data`) depois de cada aplicação.
- [ ] Teste de carga com a turma real (30–40 celulares): o servidor aguentou 40 clientes simultâneos no teste local.
