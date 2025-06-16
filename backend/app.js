require("dotenv").config();


const uuid = require("uuid");
const express = require('express');
const { createClient } = require('redis');

const {partyRooms} = require("./globalVars")

const app = express();
app.use(express.json());

const redisUrl = process.env.REDIS_URL;

const client = createClient({
        url: redisUrl
});
client.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
    try {
        await client.connect();
        console.log("Connected to Redis successfully!");
    } catch (e) {
        console.error("Couldn't connect to Redis:", e);
        process.exit(1); 
    }
}
connectRedis()



app.post('/party',async (req,res)=> {
    console.log(req.body);
            
    const partyId = uuid.v4();
    const redisKey = `party:${partyId}`;
    
    const time = new Date();
    const partyVal = {
        "mediaId": req.body.mediaId,
        "hostId": req.body.hostId,
        "createdAt": time.toISOString(),
        "playbackState": "paused",
        "timestamp": 0             
    }
    
    
    const serverHost = process.env.HOST;
    console.log(serverHost)
    const url = `${serverHost}/party/${partyId}`;

    client.set(redisKey,JSON.stringify(partyVal));
    client.expire(redisKey,60*60)


    res.send({
        "id": partyId,
        "url": url,
        "partyVal" :partyVal
    })

})

app.listen(8080, () => {
    console.log(`Example app listening on port 8080`)
    console.log(partyRooms.get("test"));
})