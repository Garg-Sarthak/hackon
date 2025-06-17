const {Kafka} = require("kafkajs")
const {InfluxDBClient, Point} = require('@influxdata/influxdb3-client')
require('dotenv').config();


const token = process.env.INFLUX_TOKEN
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

    const client = new InfluxDBClient({host: 'https://us-east-1-1.aws.cloud2.influxdata.com', token: token});
    

    await connectKafka()
    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            console.log("message",{
                key: message.key ? message.key.toString() : null,
                value: message.value.toString(),

            },"message");
            const obj = JSON.parse(message.value.toString())
            const point = Point.measurement("kafka-event").setFields(obj)
            await client.write(point, database)
        },
    })


}
main();

