const {Kafka} = require("kafkajs")
const {InfluxDB, Point} = require('@influxdata/influxdb-client')
require('dotenv').config();


const token = process.env.INFLUX_TOKEN
const YOUR_ORG = process.env.INFLUX_ORG
const database = 'hackon'
const kafka = new Kafka({
    clientId : 'analytics-service',
    brokers: ['localhost:9092']
})
// const subscriber = kafka.consumer()
const consumer = kafka.consumer({ groupId: 'watch-party-analytics-group' });

async function connectKafka() {
    try{
        await consumer.connect();
        await consumer.subscribe({
            topics:['party-events','engagement-events','user-events'],
            fromBeginning : true
        })
        console.log('kafka connected')
    }catch(e){console.log(e)}
}
// connectKafka()

async function main(){

    const client = new InfluxDB({url:'https://us-east-1-1.aws.cloud2.influxdata.com',token:token});
    const writeApi = client.getWriteApi(YOUR_ORG, database)

    await connectKafka()
    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            console.log("message",{
                key: message.key ? message.key.toString() : null,
                value: message.value.toString(),

            },"message");
            const data = JSON.parse(message.value.toString())
            const point = new Point(topic);
            point.tag('partyId', data.partyId || 'unknown');
            point.tag('userId', data.userId || 'unknown');
            point.tag('eventType', data.eventType || 'unknown');
            
            if (data.mediaId) point.tag('mediaId', data.mediaId);
            if (data.messageType) point.tag('messageType', data.messageType);
            if (data.messageConten) point.tag('messageContent', data.messageContent);
            point.intField('value', 1);
            point.timestamp(new Date(data.timestamp));
            // await client.write(point, database)
            writeApi.writePoint(point); 
        },
    })


}
main();

