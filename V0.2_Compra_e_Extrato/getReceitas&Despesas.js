const express = require('express');
const moment = require('moment');
const path = require('path');
const promiseRouter = require('express-promise-router');
const { Pool } = require('pg');

const app = express();
const router = promiseRouter();

// Configuração da conexão c  om o banco de dados
const pool = new Pool({
  user: "postgres",
  password: "1308",
  host: "127.0.0.1",
  port: 5433,
  database: "feira"
});
var email = "leojn132013@gmail.com";
var senha = "senhaadm";
var receitas;
var despesas;


// Estilos CSS para a página de receitas
const receitasStyle = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
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
  .nav-bar {
    background-color: #fff;
    border-bottom: 1px solid #ddd;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
  }
  .nav-links {
    list-style: none;
    margin: 10px 0; /* Adiciona um espaço entre os links e os elementos vizinhos */
    display: flex;
    flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
  }
  .nav-links li {
    margin: 0 20px;
  }
  .nav-links a {
    text-decoration: none;
    color: #333;
    font-size: 18px;
    font-weight: bold;
  }
  .nav-links a:hover {
    color: #3483fa;
  }
  .user-actions {
    display: flex;
    align-items: center;
    margin-top: 10px; /* Adiciona um espaço entre a barra de navegação e as ações do usuário */
  }
  .user-actions a {
    text-decoration: none;
    color: #333;
    font-size: 18px;
    font-weight: bold;
    margin-left: 20px;
  }
  .user-actions a:hover {
    color: #3483fa;
  }
  
  .saldo {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  }
  .result {
    background-color: #ffffff;
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #eaeaea;
    border-left: 5px solid #00a400; /* Adiciona a borda esquerda verde */
  }
  
 
`;

// Estilos CSS para a página de despesas
const despesasStyle = `
  * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
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
  .nav-bar {
    background-color: #fff;
    border-bottom: 1px solid #ddd;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
}
.nav-links {
    list-style: none;
    margin: 10px 0; /* Adiciona um espaço entre os links e os elementos vizinhos */
    display: flex;
    flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
}
.nav-links li {
    margin: 0 20px;
}
.nav-links a {
    text-decoration: none;
    color: #333;
    font-size: 18px;
    font-weight: bold;
}
.nav-links a:hover {
    color: #3483fa;
}
.user-actions {
    display: flex;
    align-items: center;
    margin-top: 10px; /* Adiciona um espaço entre a barra de navegação e as ações do usuário */
}
.user-actions a {
    text-decoration: none;
    color: #333;
    font-size: 18px;
    font-weight: bold;
    margin-left: 20px;
}
.user-actions a:hover {
    color: #3483fa;
}
.saldo {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  }
  .despesas-container {
    background-color: #ffffff;
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #eaeaea;
    border-left: 5px solid #e84855; /* Adiciona a borda esquerda vermelha */
  }
  



`;
const extratoStyle = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
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
  margin-top: 50px;
  margin-left: auto;
  margin-right: auto;
}
.receita-container, .despesa-container {
  background-color: #ffffff;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eaeaea;
}
.receita-container p, .despesa-container p {
  margin: 5px 0;
  color: #333;
}
h1 {
  text-align: center;
  padding-bottom: 20px;
  color: #333;
}
.receita-container {
  border-left: 5px solid #00a400;
}
.despesa-container {
  border-left: 5px solid #e84855;
}
.nav-bar {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
}
.nav-links {
  list-style: none;
  margin: 10px 0; /* Adiciona um espaço entre os links e os elementos vizinhos */
  display: flex;
  flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
}
.nav-links li {
  margin: 0 20px;
}
.nav-links a {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}
.nav-links a:hover {
  color: #3483fa;
}
.user-actions {
  display: flex;
  align-items: center;
  margin-top: 10px; /* Adiciona um espaço entre a barra de navegação e as ações do usuário */
}
.user-actions a {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  margin-left: 20px;
}
.user-actions a:hover {
  color: #3483fa;
}

.saldo {
text-decoration: none;
color: #333;
font-size: 18px;
font-weight: bold;
}
`;
async function obterReceitas() {
  try {
      var resultado = await pool.query("SELECT SUM(valor) FROM receitas WHERE jogador_id = (SELECT id FROM jogador WHERE email = $1 AND senha = $2)", [email, senha]);
      receitas = parseInt(resultado.rows[0].sum)
  } catch (ex) {
      console.log("Ocorreu um erro ao obter as receitas, o erro é: " + ex);
      return 0;
  }
}
async function obterDespesas() {
  try {
      var resultado = await pool.query("SELECT SUM(valor) FROM despesas WHERE jogador_id = (SELECT id FROM jogador WHERE email = $1 AND senha = $2)", [email, senha]);
        despesas =  parseInt(resultado.rows[0].sum)
  } catch (ex) {
      console.log("Ocorreu um erro ao obter as despesas, o erro é: " + ex);
      return 0;
  }
}

// Rota para obter todas as receitas
router.get('/receitas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        jogador.apelido AS usuario,
        jogo.nome AS nome_do_jogo,
        receitas.valor,
        to_char(receitas.data, 'DD/MM/YYYY HH24:MI:SS') as data
      FROM
        receitas
        INNER JOIN jogador ON jogador.id = receitas.jogador_id
        INNER JOIN jogo ON jogo.id = receitas.jogo_id
      WHERE
        receitas.jogador_id = (
          SELECT id FROM jogador WHERE email = '${email}' AND senha = '${senha}'
        )
      ORDER BY receitas.data DESC;  -- Ordena por data em ordem decrescente
    `);
  
    let pagehtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${receitasStyle}
        </style>
      </head>
      <body>
        <div class="nav-bar">
          <ul class="nav-links">
            <li><a href="/receitas">Receitas</a></li>
            <li><a href="/despesas">Despesas</a></li>
            <li><a href="/extrato">Extrato</a></li>
            <li><a href="/produtos">Produtos</a></li>
          </ul>
          <div class="user-actions">
            <p class="saldo">Saldo: TJ$ ${receitas - despesas}</p>
          </div>
        </div>
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
    const result = await pool.query(`
      SELECT
        jogador.apelido AS usuario,
        produto.descricao AS produto,
        despesas.valor,
        to_char(despesas.data, 'DD/MM/YYYY HH24:MI:SS') as data
      FROM
        despesas
        INNER JOIN jogador ON jogador.id = despesas.jogador_id
        INNER JOIN produto ON produto.id = despesas.produto_id
      WHERE
        despesas.jogador_id = (
          SELECT id FROM jogador WHERE email = '${email}' AND senha = '${senha}'
        )
      ORDER BY despesas.data DESC;  -- Ordena por data em ordem decrescente
    `);
  
    let pagehtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          ${despesasStyle}
        </style>
      </head>
      <body>
        <div class="nav-bar">
          <ul class="nav-links">
            <li><a href="/receitas">Receitas</a></li>
            <li><a href="/despesas">Despesas</a></li>
            <li><a href="/extrato">Extrato</a></li>
            <li><a href="/produtos">Produtos</a></li>
          </ul>
          <div class="user-actions">
            <p class="saldo">Saldo: TJ$ ${receitas - despesas}</p>
          </div>
        </div>
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
      <div class="nav-bar">
        <ul class="nav-links">
            <li><a href="/receitas">Receitas</a></li>
            <li><a href="/despesas">Despesas</a></li>
            <li><a href="/extrato">Extrato</a></li>
            <li><a href="/produtos">Produtos</a></li>
        </ul>
        <div class="user-actions">
           <p class="saldo">Saldo: TJ$ ${receitas-despesas}</p>
        </div>
    </div>
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
router.get('/produtos', async (req,res) => {
  try {
    const result =  await pool.query("SELECT * FROM produto WHERE id IN (SELECT produto_id FROM estoque WHERE quantidade > 0);");
    obterDespesas();
    obterReceitas();
   
    let produtosQuery = `
    <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Produtos - Mercado Livre</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .title {
            text-align: center;
            margin-bottom: 20px;
            font-size: 36px;
            color: #333;
        }
        .produtos {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .produto {
            width: 300px;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .produto img {
            width: 100%;
            border-radius: 10px;
            margin-bottom: 10px;
        }
        .produto h3 {
            font-size: 24px;
            margin-bottom: 5px;
            color: #333;
        }
        .produto p {
            font-size: 18px;
            color: #555;
            margin-bottom: 10px;
        }
        .produto .preco {
            font-size: 20px;
            color: #27ae60;
            margin-bottom: 10px;
        }
        .produto button {
            padding: 10px 20px;
            font-size: 18px;
            background-color: #3483fa;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .produto button:hover {
            background-color: #1e70e8;
        }
        .nav-bar {
            background-color: #fff;
            border-bottom: 1px solid #ddd;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
        }
        .nav-links {
            list-style: none;
            margin: 10px 0; /* Adiciona um espaço entre os links e os elementos vizinhos */
            display: flex;
            flex-wrap: wrap; /* Permite que os elementos quebrem a linha quando não houver espaço suficiente */
        }
        .nav-links li {
            margin: 0 20px;
        }
        .nav-links a {
            text-decoration: none;
            color: #333;
            font-size: 18px;
            font-weight: bold;
        }
        .nav-links a:hover {
            color: #3483fa;
        }
        .user-actions {
            display: flex;
            align-items: center;
            margin-top: 10px; /* Adiciona um espaço entre a barra de navegação e as ações do usuário */
        }
        .user-actions a {
            text-decoration: none;
            color: #333;
            font-size: 18px;
            font-weight: bold;
            margin-left: 20px;
        }
        .user-actions a:hover {
            color: #3483fa;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .title {
            text-align: center;
            margin-bottom: 20px;
            font-size: 36px;
            color: #333;
        }
        .produtos {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
        }
        .saldo {
          text-decoration: none;
          color: #333;
          font-size: 18px;
          font-weight: bold;
      }
    </style>    
</head>
<body>
    <div class="nav-bar">
        <ul class="nav-links">
            <li><a href="/receitas">Receitas</a></li>
            <li><a href="/despesas">Despesas</a></li>
            <li><a href="/extrato">Extrato</a></li>
            <li><a href="#">Produtos</a></li>
        </ul>
        <div class="user-actions">
           <p class="saldo">Saldo: TJ$ ${receitas-despesas}</p>
        </div>
    </div>

    <div class="container">
        <h1 class="title">Produtos em Destaque</h1>
        <div class="produtos">
            
            
            
         `;result.rows.forEach(row => {
          const descricaoCapitalizada = capitalizeFirstLetter(row.descricao);
      
          produtosQuery += `
              <div class="produto">
              <script>
              async function comprarProduto(idDoProduto) {
                console.log('ID do produto:', idDoProduto);
            
                try {
                  const response = await fetch(\`/comprar/\${idDoProduto}\`, {
                    method: 'POST'
                  });
            
                  if (response.ok) {
                    console.log('Compra realizada com sucesso!');
                    // Redireciona para a página de produtos após a compra
                    window.location.href = '/compra-concluida';
                  } else {
                    console.error('Erro ao efetuar a compra:', response.statusText);
                    window.location.href = '/compra-negada';
                  }
                } catch (error) {
                  console.error('Erro:', error);
                }
              }
              </script>
                  <img src="download.jpeg" alt="${descricaoCapitalizada}">
                  <h3>${descricaoCapitalizada}</h3>
                  <p class="preco">TJ$ ${row.valor}</p>
                  <button onclick="comprarProduto(${row.id})">Comprar</button>
              </div>
          `;
      });
      

         produtosQuery += `
        </div>
    </div>
</body>
</html>

    `;
    

    res.send(produtosQuery);
  } catch (error) {
    console.error('Erro ao buscar o extrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/comprar/:idDoProduto', async (req, res) => {
  const idDoProduto = req.params.idDoProduto;

  let valor_produto_bruto = await pool.query("select valor from produto where id =" + idDoProduto);
  valor_produto = parseInt(valor_produto_bruto.rows[0].valor);
  obterDespesas();
  obterReceitas();

  if ((receitas - despesas) > valor_produto) {
    const dataAtual = moment().format('DD/MM/YYYY HH:mm:ss');
    await pool.query("insert into despesas(jogador_id,produto_id,valor,data) values((select id from jogador where email = '"+email+"'and senha = '"+senha+"'),"+idDoProduto+","+valor_produto+",'"+dataAtual+"');");
    await pool.query(`update estoque set quantidade = quantidade - 1 where produto_id = ${idDoProduto} ;`)
    obterDespesas();
    obterReceitas();
    console.log("Compra Finalizada")
    
    res.redirect('/compra-concluida')  // Redireciona para a página de compra concluída
  } else {
    console.log("Você não tem dinheiro suficiente");
    //res.redirect('/compra-negada')
    res.status(400).send('Você não tem dinheiro suficiente para comprar este produto.');
  }
});

router.get('/compra-concluida', async (req, res) => {
  let html = `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compra Concluída</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            text-align: center;
            padding: 50px;
        }

        img {
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
        }

        h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
        }

        button {
            padding: 10px 20px;
            font-size: 18px;
            background-color: #3498db;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <img src="check.png" alt="Compra Concluída">
    <h1>Compra Concluída com Sucesso!</h1>
    <button onclick="redirectToProducts()">Voltar às compras!</button>
    <script>
        function redirectToProducts() {
            window.location.href = '/produtos';  // Redireciona para a página de produtos
        }
    </script>
</body>
</html>

  `;

  res.send(html);
});
router.get('/compra-negada', async (req, res) => {
  let html = `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compra Negada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            text-align: center;
            padding: 20px;
        }

        img {
            width: 10%; /* A imagem terá 100% da largura do contêiner */
            height: auto; /* A altura será ajustada automaticamente para manter a proporção */
            margin-bottom: 20px;
            display: block; /* Remove espaço extra abaixo da imagem */
            margin: 0 auto; /* Centraliza a imagem no contêiner */
            min-width: 100px; /* Tamanho mínimo da imagem */
            min-height: 100px; /* Tamanho mínimo da imagem */
        }

        h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
        }

        button {
            padding: 10px 20px;
            font-size: 18px;
            background-color: #3498db;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        button:hover {
            background-color: #2980b9;
        }

        @media (min-width: 768px) {
            /* Estilos para telas maiores (tablets e desktops) */
            img {
                max-width: 200%; /* A imagem não ultrapassará 80% da largura da tela */
            }
        }
    </style>
</head>
<body>
    <img src="X.png" alt="Compra Negada">
    <h1>Compra Concluída Negada - Saldo Insuficiente</h1>
    <button onclick="redirectToProducts()">Voltar às compras!</button>
    <script>
        function redirectToProducts() {
            window.location.href = '/produtos';  // Redireciona para a página de produtos
        }
    </script>
</body>
</html>


  `;

  res.send(html);
});





router.get('/home', (req, res) => {
  const indexPath = path.join(__dirname,'home.html');
  res.sendFile(indexPath);
});

app.use('/', router);
app.use(express.static('images'));

app.listen(3000, () => {
  console.log('Servidor está executando na porta 3000');
});


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

    obterDespesas();
    obterReceitas();

    