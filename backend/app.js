require("dotenv").config();


const uuid = require("uuid");
const express = require('express');
const { createClient } = require('redis');
const {WebSocketServer} = require("ws")

const {partyRooms} = require("./globalVars")

const app = express();
app.use(express.json());

const redisUrl = process.env.REDIS_URL;

const client = createClient({
        url: redisUrl
});
const subscriber = client.duplicate();
client.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
    try {
        await client.connect();
        await subscriber.connect();
        console.log("Connected to Redis successfully!");
    } catch (e) {
        console.error("Couldn't connect to Redis:", e);
        process.exit(1); 
    }
}
connectRedis()



app.post('/party',async (req,res)=> {
    /* 
    makes party room
    gets userId and mediaId
    partyId = uuid 
    "party:partyId" is redis key
    redis : party:partyId -> partyVal (json object as string) expires in 1 day
    
    url is `http://localhost:8080/party/${partyId}`

    returns url, partyId, partyVal

    */

    // console.log(req.body);

    if (!req.body.mediaId || !req.body.hostId) {
        console.log("Invalid request");
        res.status(400);
        res.send("Invalid request");
        return;
    }
            
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
    // console.log(serverHost)
    const url = `${serverHost}/party/${partyId}`;

    client.set(redisKey,JSON.stringify(partyVal));
    client.expire(redisKey,60*60*24)

    res.status(201);
    res.send({
        "id": partyId,
        "url": url,
        "partyVal" :partyVal
    })

})

app.get('/party/:partyId',async(req,res) => {
    // console.log(req.params.partyId)
    const partyId = req.params.partyId
    if (!partyId){
        console.log("Invalid request");
        res.status(400);
        res.send("Invalid request");
        return;
    }
    // for (const rec of partyRooms.get(partyId)){
    //     rec.send("this is because of http request")
    // }
    const redisKey = `party:${partyId}`
    const partyVal = await client.get(redisKey)
    if (!partyVal){
        res.status(404)
        res.send({"error" : `Invalid URL or the party has expired.`})
        return;
    }


    res.status(200)
    res.send(JSON.parse(partyVal))
})

const server = app.listen(8080, () => {
    console.log(`Example app listening on port 8080`)
    console.log(partyRooms.get("test"));
})






const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws,req) {
    

    const partyId = req.url.split("?")[1].split("&")[0].split("=")[1];
    // const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')));
    // const partyId = params.get("partyId");

    if (!partyId) {
        console.log("Connection rejected: No partyId provided.");
        ws.close();
        return;
    }

    // console.log(partyId);

    // adds ws connection to dedicated party room
    ws.partyId = partyId;
    if (!partyRooms.get(partyId)) {
        partyRooms.set(partyId,new Set());
    }
    partyRooms.get(partyId).add(ws);

    // check for addition of ws to party room
    console.log(`party ${partyId} now has ${partyRooms.get(partyId).size} members`);
    
    // receives message -> sends to pub-sub
    ws.on('message', function message(data) {
        console.log('received: %s', data);
        try{
            data = JSON.parse(data.toString());
        }catch(e){
            console.log(e);
            console.log("message is not json")
            return;
        }

        if (data.type == "controls" || data.type == "chat"){
            const channel = `party-${data.type}:${partyId}`;
            client.publish(channel,JSON.stringify(data))
        }

        
        
    });


    ws.on('close', function close() {
        console.log(`client disconneted from party ${partyId}`);

        const room = partyRooms.get(partyId);
        if (room){
            room.delete(ws);
            console.log(`party ${partyId} now has ${partyRooms.get(partyId).size} members`);
        }
    });




    ws.send('welcome to the party');
});

subscriber.pSubscribe(['party-controls:*','party-chat:*'],(message,channel) => {
    const partyId = channel.split(":")[1];
    // const type = channel.split(":")[0].split("-")[1];
    const room = partyRooms.get(partyId)
    if (room){
        for (const client of room){
            client.send(message)
        }
    }
})

module.exports = {
    server
}