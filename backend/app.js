import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { createClient as createRedisClient } from 'redis';
import { WebSocketServer } from 'ws';
import { Kafka } from 'kafkajs';
import cors from 'cors';
import { partyRooms } from './globalVars.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
app.use(express.json());

// Add CORS middleware for API endpoints
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

const redisUrl = process.env.REDIS_URL;

const client = createRedisClient({
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

const kafka = new Kafka({
    clientId : "watch-party-app",
    brokers : ['localhost:9092']
})
const producer = kafka.producer();

async function connectKafka(){
    try{
        await producer.connect();
        console.log('kafka connected')
    }catch(e){ console.log(e, 'kafka connection error') }
}
connectKafka()


async function sendKafkaEvent(topic, payload) {
    if (!producer) return;
  try {
    // await producer.connect()
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
    console.debug("kafka message sent successfully to topic", topic);
  } catch (error) {
    console.error(`Failed to send event to Kafka topic ${topic}:`, error);
  }
}





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
            
    const partyId = uuidv4();
    const redisKey = `party:${partyId}`;
    
    const time = new Date();
    const partyVal = {
        "mediaId": req.body.mediaId,
        "hostId": req.body.hostId,
        "createdAt": time.toISOString(),
        "playbackState": "paused",
        "timestamp": 0             
    }
    
    sendKafkaEvent('party-events',{
        "timestamp" : time.toISOString(),
        "partyId" : partyId,
        "userId" : req.body.hostId,
        "mediaId" : req.body.mediaId,
        "eventType" : "create-party"
    })
    
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

// API endpoint to track movie clicks for recommendations
app.post('/api/track-click', async (req, res) => {
  try {
    const { userId, movieId, movieTitle, movieGenreIds, movieRating } = req.body
    
    if (!userId || !movieId) {
      return res.status(400).json({ error: 'User ID and Movie ID are required' })
    }

    // First, ensure the user exists in the users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist, create them with a placeholder email
      console.log('Creating user record for:', userId)
      const { error: createUserError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: `${userId}@placeholder.com` // Placeholder email since it's required
        }])

      if (createUserError) {
        console.error('Error creating user:', createUserError)
        return res.status(500).json({ error: 'Failed to create user record' })
      }
    } else if (userCheckError) {
      console.error('Error checking user existence:', userCheckError)
      return res.status(500).json({ error: 'Database error' })
    }

    // Now insert the movie history record
    const { data, error } = await supabase
      .from('movie_history')
      .insert([{
        user_id: userId,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_genre_ids: movieGenreIds || [],
        movie_rating: movieRating || 0,
        clicked_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error tracking movie click:', error)
      return res.status(500).json({ error: 'Failed to track movie click' })
    }

    console.log('Movie click tracked successfully:', movieTitle)
    res.status(200).json({ message: 'Movie click tracked successfully' })

  } catch (error) {
    console.error('Error in track-click endpoint:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// API endpoint to sync user from frontend
app.post('/api/sync-user', async (req, res) => {
  try {
    const { userId, email, displayName } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create them with minimal required fields
      const { data, error: createError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: email,
          display_name: displayName
        }])

      if (createError) {
        console.error('Error creating user:', createError)
        return res.status(500).json({ error: 'Failed to create user' })
      }

      console.log('User created successfully:', userId)
      res.status(201).json({ message: 'User created successfully' })
    } else if (checkError) {
      console.error('Error checking user:', checkError)
      return res.status(500).json({ error: 'Database error' })
    } else {
      // User exists, update if needed
      const updateData = {}
      if (email && email !== existingUser.email) updateData.email = email
      if (displayName && displayName !== existingUser.display_name) updateData.display_name = displayName

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating user:', updateError)
          return res.status(500).json({ error: 'Failed to update user' })
        }

        console.log('User updated successfully:', userId)
      }
      
      res.status(200).json({ message: 'User updated successfully' })
    }

  } catch (error) {
    console.error('Error in sync-user endpoint:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// API endpoint to get user recommendations based on history
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get user's movie history to analyze preferences
    const { data: movieHistory, error } = await supabase
      .from('movie_history')
      .select('movie_genre_ids, movie_rating')
      .eq('user_id', userId)
      .order('clicked_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching user history:', error)
      return res.status(500).json({ error: 'Failed to get recommendations' })
    }

    // Simple recommendation logic: find most frequent genres
    const genreCount = {}
    let totalRating = 0
    
    movieHistory.forEach(record => {
      if (record.movie_genre_ids && Array.isArray(record.movie_genre_ids)) {
        record.movie_genre_ids.forEach(genreId => {
          genreCount[genreId] = (genreCount[genreId] || 0) + 1
        })
      }
      totalRating += record.movie_rating || 0
    })

    const preferredGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genreId]) => parseInt(genreId))

    const avgRating = movieHistory.length > 0 ? totalRating / movieHistory.length : 7

    res.status(200).json({
      message: 'Recommendations generated',
      preferredGenres,
      averageRating: avgRating,
      historyCount: movieHistory.length
    })

  } catch (error) {
    console.error('Error in recommendations endpoint:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const server = app.listen(8080, () => {
    console.log(`Example app listening on port 8080`)
    console.log(partyRooms.get("test"));
})






const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws,req) {
    
    // gets params from url
    const params = new URLSearchParams(req.url.split("?")[1]);
    const partyId = params.get("partyId");
    const userId = params.get("userId")

    // missing params reject connection
    if (!partyId || !userId) {
        console.log("Connection rejected: No partyId or userId provided.");
        ws.close();
        return;
    }


    // adds ws connection to dedicated party room
    ws.partyId = partyId;
    ws.userId = userId;
    if (!partyRooms.get(partyId)) {
        partyRooms.set(partyId,new Set());
    }
    partyRooms.get(partyId).add(ws);

    sendKafkaEvent('user-events',{
        "timestamp" : new Date().toISOString(),
        "userId" : userId,
        "partyId" : partyId,
        "eventType" : "join-party"
    })
    

    // check for addition of ws to party room
    console.log(`party ${partyId} now has ${partyRooms.get(partyId).size} members`);
    
    // receives message -> sends to pub-sub
    ws.on('message', function message(data) {
        // console.log('received: %s', data);

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
            sendKafkaEvent('engagement-events',{
            "timestamp" : new Date().toISOString(),
            "userId" : userId,
            "partyId" : partyId,
            "eventType" : "message-sent",
            "messageType" : data.type,
            "messageContent" : data.type=='controls'?data.message:"chat messages are not stored to protect user privacy"
        })
        }else{
            console.log("invalid message type : must be 'controls' or 'chat'");
        }

        
        
    });


    ws.on('close', async function close() {
        console.log(`client disconneted from party ${partyId}`);

        const room = partyRooms.get(partyId);
        
        if (room){
           
            room.delete(ws);
            console.log(`party ${partyId} now has ${partyRooms.get(partyId).size} members`);
            sendKafkaEvent('user-events',{
                "timestamp" : new Date().toISOString(),
                "userId" : userId,
                "partyId" : partyId,
                "eventType" : "leave-party"
            })

            const partyDataString = await client.get(`party:${partyId}`);
            if (partyDataString){
                const partyDetails = JSON.parse(partyDataString);

                if (partyDetails.hostId == userId){
                    console.log(`Host has left. Ending party ${partyId}`);

                    const endMsg = JSON.stringify({
                        "type" : 'controls',
                        'message' : 'party_ended_by_host'
                    })
                    client.publish(`party-controls:${partyId}`,endMsg);
                    await client.del(`party:${partyId}`);
                    sendKafkaEvent('party-events',{
                        "timestamp" : new Date().toISOString(),
                        "userId" : userId,
                        "partyId" : partyId,
                        "eventType" : "end-party"
                    })
                }
            }
        }
    });




    ws.send('welcome to the party');
});

subscriber.pSubscribe(['party-controls:*','party-chat:*'],(message,channel) => {
    const partyId = channel.split(":")[1];
    const room = partyRooms.get(partyId)
    if (room){
        const msgObj = JSON.parse(message.toString())
        for (const client of room){
            client.send(message)
        }
        if (msgObj.type == 'controls' && msgObj.message == 'party_ended_by_host'){
            for (const client of room){
                client.close(1000,"party ended by host")
            } 
        }
    }
})


// module.exports = {
//     kafka
// }