require('dotenv').config()
const mqtt = require('mqtt')
const mqttURI = process.env.MQTT_URI || 'mqtt://[::1]'
const cliente = mqtt.connect(mqttURI, { protocolVersion: 5 })
const topicos = process.env.MQTT_TOPIC || ['debito/+', 'estoque/+']
const { Pool } = require('pg')
const pool = new Pool()

cliente.on('connect', async () => {
  cliente.subscribe(topicos, (err) => {
    if (err) {
      console.error('Error subscribing to topic: ', err)
    } else {
      console.log('Subscribed to topic successfully')
    }
  })
})

cliente.on('message', async (topico, mensagem) => {
  const operação = topico.split('/')[0]
  const emissor = topico.split('/')[1]
  if (operação && emissor) {
    topico = emissor + '/' + operação
  } else return

  mensagem = mensagem.toString()
  if (operação === 'debito') {
    let id, senha, maquina, produto
    try {
      if (mensagem.length !== 16) throw new Error()
      id = parseInt(mensagem.substring(0, 4))
      senha = parseInt(mensagem.substring(4, 8))
      maquina = parseInt(mensagem.substring(8, 12))
      produto = parseInt(mensagem.substring(12, 16))
    } catch (error) {
      cliente.publish(topico, '400', { qos: 2 })
      return
    }

    const auth = await pool.query('SELECT id FROM jogadores WHERE id = $1 AND senha = $2', [id, senha])
    if (auth.rowCount === 0) {
      cliente.publish(topico, '401', { qos: 2 })
      return
    }

    let receitas = await pool.query('SELECT COALESCE(SUM(valor), 0) as sum FROM receitas WHERE jogador_id = $1', [id])
    receitas = parseInt(receitas.rows[0].sum)
    if (isNaN(receitas)) { receitas = 0 }

    let despesas = await pool.query('SELECT COALESCE(SUM(valor), 0) as sum FROM despesas WHERE jogador_id = $1', [id])
    despesas = parseInt(despesas.rows[0].sum)
    if (isNaN(despesas)) { despesas = 0 }

    const produtos = await pool.query('SELECT id, valor FROM produtos WHERE id = $1 AND EXISTS (SELECT 1 FROM estoque WHERE maquina_id = $2 AND produto_id = produtos.id AND quantidade > 0);', [produto, maquina])
    if (produtos.rowCount === 0) {
      cliente.publish(topico, '403', { qos: 2 })
      return
    }
    const valor = produtos.rows[0].valor

    if ((receitas - despesas) < valor) {
      cliente.publish(topico, '402', { qos: 2 })
      return
    }

    try {
      await pool.query('INSERT INTO despesas (jogador_id, produto_id, valor, data) VALUES ($1, $2, $3, NOW())', [id, produto, valor])
      await pool.query('UPDATE estoque SET quantidade = quantidade - 1 WHERE produto_id = $1;', [produto])
    } catch (error) {
      cliente.publish(topico, '500', { qos: 2 })
      return
    }
    cliente.publish(topico, '200', { qos: 2 })
  } else if (operação === 'estoque') {
    let maquina, senha, produto, quantidade
    try {
      if (mensagem.length !== 16) throw new Error()
      maquina = parseInt(mensagem.substring(0, 4))
      senha = parseInt(mensagem.substring(4, 8))
      produto = parseInt(mensagem.substring(8, 12))
      quantidade = parseInt(mensagem.substring(12, 16))
    } catch (error) {
      cliente.publish(topico, '400', { qos: 2 })
      return
    }

    const auth = await pool.query('SELECT id FROM maquinas WHERE id = $1 AND senha = $2', [maquina, senha])
    if (auth.rowCount === 0) {
      cliente.publish(topico, '401', { qos: 2 })
      return
    }

    let estoque
    const produtos = await pool.query('SELECT id FROM produtos WHERE id = $1', [produto])
    if (produtos.rowCount === 0) {
      cliente.publish(topico, '400', { qos: 2 })
      return
    }

    try {
      estoque = await pool.query('SELECT id FROM estoque WHERE maquina_id = $1 AND produto_id = $2', [maquina, produto])
      if (estoque.rowCount === 0) {
        await pool.query('INSERT INTO estoque (maquina_id, produto_id, quantidade) VALUES ($1, $2, $3)', [maquina, produto, quantidade])
      } else {
        await pool.query('UPDATE estoque SET quantidade = $1 WHERE maquina_id = $2 AND produto_id = $3', [quantidade, maquina, produto])
      }
    } catch (error) {
      cliente.publish(topico, '500', { qos: 2 })
      return
    }

    estoque = await pool.query('SELECT produtos.id, produtos.descricao, estoque.quantidade FROM estoque INNER JOIN produtos ON estoque.produto_id = produtos.id WHERE maquina_id = $1', [maquina])
    cliente.publish(topico, '200', { qos: 2 })
  }
})
