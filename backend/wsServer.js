const {WebSocketServer} = require("ws")
const {partyRooms} = require("./globalVars")
// const {server} = require("./app")
// 

// const wss = new WebSocketServer({ port: 8081 });
// const wss = new WebSocketServer({server});

wss.on('connection', function connection(ws,req) {
    

    const partyId = req.url.split("?")[1].split("&")[0].split("=")[1];
    // const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')));
    // const partyId = params.get("partyId");

    if (!partyId) {
        console.log("Connection rejected: No partyId provided.");
        ws.close();
        return;
    }

    console.log(partyId);

    ws.partyId = partyId;
    if (!partyRooms.get(partyId)) {
        partyRooms.set(partyId,new Set());
    }
    partyRooms.get(partyId).add(ws);

    console.log(`party ${partyId} now has ${partyRooms.get(partyId).size} members`);
    
    ws.on('message', function message(data) {
        console.log('received: %s', data);
        for (const client of partyRooms.get(partyId)) {
            if (client == ws) continue;
            client.send(data);
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
