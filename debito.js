const mqtt = require('mqtt')
const mqttURI = process.env.MQTT_URI || 'mqtt://localhost'
const client = mqtt.connect(mqttURI, { protocolVersion: 5 })
const topic = process.env.MQTT_TOPIC || '0000/+'
const { Pool } = require('pg')
const pool = new Pool()

client.on('connect', async () => {
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Error subscribing to topic: ', err)
    } else {
      console.log('Subscribed to topic successfully')
    }
  })
})

client.on('message', async (topic, message) => {
  const sender = topic.split('/')[1]
  const receiver = topic.split('/')[0]
  if (sender && receiver) {
    topic = sender + '/' + receiver
  } else {
    return
  }

  const req = message.toString()
  let id, senha, maquina, produto, valor
  try {
    if (req.length !== 20) throw new Error()
    id = parseInt(req.substring(0, 4))
    senha = parseInt(req.substring(4, 8))
    maquina = parseInt(req.substring(8, 12))
    produto = parseInt(req.substring(12, 16))
    valor = parseInt(req.substring(16, 20))
  } catch (error) {
    client.publish(topic, '400', { qos: 2 })
    return
  }

  const auth = await pool.query('SELECT id FROM jogadores WHERE id = $1 AND senha = $2', [id, senha])
  if (auth.rowCount === 0) {
    client.publish(topic, '401', { qos: 2 })
    return
  }

  let receitas = await pool.query('SELECT COALESCE(SUM(valor), 0) FROM receitas WHERE jogador_id = $1', [id])
  receitas = parseInt(receitas.rows[0].sum)

  let despesas = await pool.query('SELECT COALESCE(SUM(valor), 0) FROM despesas WHERE jogador_id = $1', [id])
  despesas = parseInt(despesas.rows[0].sum)

  const qtdeProduto = await pool.query('SELECT id FROM produtos WHERE id = $1 AND EXISTS (SELECT 1 FROM estoque WHERE maquina_id = $2 AND produto_id = produtos.id AND quantidade > 0);', [produto, maquina])
  if (qtdeProduto.rowCount === 0) {
    client.publish(topic, '403', { qos: 2 })
    return
  }

  if ((receitas - despesas) < valor) {
    client.publish(topic, '403', { qos: 2 })
    return
  }

  await pool.query('INSERT INTO despesas (jogador_id, produto_id, valor, data) VALUES ($1, $2, $3, NOW())', [id, produto, valor])
  await pool.query('UPDATE estoque SET quantidade = quantidade - 1 WHERE produto_id = $1;', [produto])
  client.publish(topic, '200', { qos: 2 })
})
