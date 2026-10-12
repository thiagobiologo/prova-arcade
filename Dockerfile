# Prova Arcade — imagem de publicação (Node 24, sem dependências externas)
FROM node:24-slim
WORKDIR /srv
COPY server.js lib_results.js package.json ./
COPY public ./public
COPY app ./app
COPY admin ./admin
ENV NODE_ENV=production TRUST_PROXY=1 PORT=8899
# Banco de licenças e segredos ficam em /srv/data: MONTE UM VOLUME PERSISTENTE AQUI
VOLUME ["/srv/data"]
EXPOSE 8899
HEALTHCHECK CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
