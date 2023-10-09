const express = require('express');
const moment = require('moment');
const path = require('path');
const promiseRouter = require('express-promise-router');
const { Pool } = require('pg');

const app = express();
const router = promiseRouter();

// Configuração da conexão com o banco de dados
const pool = new Pool({
  user: "postgres",
  password: "1308",
  host: "127.0.0.1",
  port: 5433,
  database: "feira"
});

var email = "leojn132013@gmail.com";
var senha = "senhaadm";

// Estilos CSS para a página de receitas
const receitasStyle = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
  }
  .container {
    align-items: center;
    background-color: #ffffff;
    margin: 20px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    width: 100%;
    margin-top: 50px; /* Adiciona margem no topo */
    margin-left: auto;
    margin-right: auto;
  }
  .result {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #dddddd;
  }
  .result p {
    margin: 5px 0;
  }
  h1 {
    text-align: center;
    padding-bottom: 10px;
  }
`;

// Estilos CSS para a página de despesas
const despesasStyle = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
  }
  .container {
    background-color: #ffffff;
    margin: 20px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    width: 100%;
    margin-top: 50px; /* Adiciona margem no topo */
    margin-left: auto;
    margin-right: auto;
  }
  .despesas-container {
    background-color: #ffffff;
    margin-bottom: 20px; /* Adiciona margem no fundo da div */
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #dddddd;
  }
  .despesas-container p {
    margin: 5px 0;
  }
  h1 {
    text-align: center;
    padding-bottom: 10px;
  }
`;
const extratoStyle = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
  }
  .container {
    align-items: center;
    background-color: #ffffff;
    margin: 20px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    width: 100%;
    margin-top: 50px; /* Adiciona margem no topo */
    margin-left: auto;
    margin-right: auto;
  }
  .receita-container, .despesa-container {
    background-color: #ffffff;
    margin-bottom: 20px; /* Adiciona margem no fundo da div */
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #dddddd;
  }
  .receita-container p, .despesa-container p {
    margin: 5px 0;
  }
  h1 {
    text-align: center;
    padding-bottom: 10px;
  }
`;


// Rota para obter todas as receitas
router.get('/receitas', async (req, res) => {
  try {
    const result = await pool.query("SELECT jogador.apelido AS usuario, jogo.nome as Nome_do_jogo, receitas.valor, to_char(receitas.data, 'DD/MM/YYYY HH24:MI:SS') as data FROM receitas INNER JOIN jogador ON jogador.id = receitas.jogador_id INNER JOIN jogo ON jogo.id = receitas.jogo_id where receitas.jogador_id = (select id from jogador where email = '"+email+"'and senha = '"+senha+"');");
    let pagehtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${receitasStyle}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Minhas Receitas</h1>
    `;

    result.rows.forEach(row => {
      pagehtml += `
        <div class="result">
          <p><strong>Usuário:</strong> ${row.usuario}</p>
          <p><strong>Nome do Jogo:</strong> ${row.nome_do_jogo}</p>
          <p><strong>Valor:</strong> ${row.valor} Tijolinhos</p>
          <p><strong>Data:</strong> ${row.data}</p>
        </div>
      `;
    });

    pagehtml += `
        </div>
      </body>
      </html>
    `;

    res.send(pagehtml);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter todas as despesas
router.get('/despesas', async (req, res) => {
  try {
    const result = await pool.query("SELECT jogador.apelido AS usuario, produto.descricao as produto, despesas.valor, to_char(despesas.data, 'DD/MM/YYYY HH24:MI:SS') as data FROM despesas INNER JOIN jogador ON jogador.id = despesas.jogador_id INNER JOIN produto ON produto.id = despesas.produto_id where despesas.jogador_id = (select id from jogador where email = '"+email+"'and senha = '"+senha+"');");
    let pagehtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${despesasStyle}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Minhas Despesas</h1>
    `;

    result.rows.forEach(row => {
      pagehtml += `
        <div class="despesas-container">
          <p><strong>Usuário:</strong> ${row.usuario}</p>
          <p><strong>Produto Adquirido:</strong> ${row.produto}</p>
          <p><strong>Valor:</strong> ${row.valor} Tijolinhos</p>
          <p><strong>Data:</strong> ${row.data}</p>
        </div>
      `;
    });

    pagehtml += `
        </div>
      </body>
      </html>
    `;

    res.send(pagehtml);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
router.get('/extrato', async (req, res) => {
  try {
    const extratoQuery = `
      SELECT
        'Receita' AS tipo,
        jogo.nome AS transacao,
        receitas.valor AS valor,
        receitas.data AS data
      FROM
        receitas
      INNER JOIN
        jogo ON jogo.id = receitas.jogo_id
      WHERE
        receitas.jogador_id = (SELECT id FROM jogador WHERE email = '${email}' AND senha = '${senha}')

      UNION ALL

      SELECT
        'Despesa' AS tipo,
        produto.descricao AS transacao,
        despesas.valor AS valor,
        despesas.data AS data
      FROM
        despesas
      INNER JOIN
        produto ON produto.id = despesas.produto_id
      WHERE
        despesas.jogador_id = (SELECT id FROM jogador WHERE email = '${email}' AND senha = '${senha}')
      
      ORDER BY
        data DESC;`;

    const result = await pool.query(extratoQuery);

    let pagehtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${extratoStyle}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Extrato</h1>
    `;

    result.rows.forEach(row => {
      const tipoLower = row.tipo.toLowerCase();
      const tipoExibicao = tipoLower === 'receita' ? 'Valor ganho' : 'Valor gasto';
      const dataFormatada = moment(row.data).format('DD/MM/YYYY HH:mm:ss'); // Formata a data

      pagehtml += `
        <div class="${tipoLower}-container">
          <p><strong>Tipo:</strong> ${row.tipo}</p>
          <p><strong>Transação:</strong> ${row.transacao}</p>
          <p><strong>${tipoExibicao}:</strong> ${row.valor} Tijolinhos</p>
          <p><strong>Data:</strong> ${dataFormatada} </p>
        </div>
      `;
    });

    pagehtml += `
        </div>
      </body>
      </html>
    `;

    res.send(pagehtml);
  } catch (error) {
    console.error('Erro ao buscar o extrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
router.get('/home', (req, res) => {
  const indexPath = path.join(__dirname,'home.html');
  res.sendFile(indexPath);
});
app.use('/', router);

app.listen(3000, () => {
  console.log('Servidor está executando na porta 3000');
});
