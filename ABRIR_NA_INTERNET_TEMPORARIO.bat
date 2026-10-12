@echo off
rem Tunel TEMPORARIO: da ao seu computador um endereco publico https por algumas horas (plano B). (c) Thiago Silva
rem O servidor precisa estar rodando em outra janela (node server.js) e ESTA janela precisa ficar aberta.
rem O trafego passa por um servico de terceiros (localhost.run). Para dados de alunos, prefira publicar na nuvem (PUBLICAR_NA_NUVEM.md).
echo.
echo  Procure abaixo o endereco https://....lhr.life  e use-o no campo "Endereco publico do site" da Central.
echo  Depois GERE O QR DE NOVO. Para encerrar, feche esta janela.
echo.
ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -R 80:localhost:8899 nokey@localhost.run
pause
