const mqtt = require('mqtt')
const mqttURI = process.env.URI || 'mqtt://localhost'
const client = mqtt.connect(mqttURI, { protocolVersion: 5 })

client.on('connect', () => {
  client.subscribe('0000/+', { qos: 2 }, (err) => {
    if (err) {
      console.error('Error subscribing to topic: ', err)
    } else {
      console.log('Subscribed to topic successfully')
    }
  })
})

client.on('message', (topic, message, packet) => {
  if (packet.qos === 2) {
    console.log(topic, message.toString(), packet)
  }
})
