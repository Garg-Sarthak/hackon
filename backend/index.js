const { createClient } = require('redis');
require("dotenv").config();


// const client = createClient({
//     url: process.env.REDIS_URL
// });

// client.on('error', (err) => console.log('Redis Client Error', err));
async function connectRedis() {
    try {
        const client = createClient({
        url: process.env.REDIS_URL
        });

        client.on("error", function(err) {
        throw err;
        });
        await client.connect()
        console.log("Connected to Redis successfully!");
    } catch (e) {
        console.error("Couldn't connect to Redis:", e);
        process.exit(1); 
    }
}
connectRedis();
