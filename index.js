
const WS = require("websocket").server;

debug = false;

worldServerClient = null

clients = {}

let speciesDirectory = {};
let viewPortDirectory = {};

let server = require("./http_server.js").server;
server.listen(5000);
console.log("Server listening on port 5000");


// WebSocket RPC Server

const CMDS = {
  move: 0,
  new_client: 1,
  remove: 2,
  click: 3,
  updateWorld: 4,
  right_click: 5,
  connect_new_server: 10
};

const ws = new WS({
  httpServer: server
});

function wsSendAll(data, exclude) {
  for (const connection of ws.connections) {
    if (connection === exclude) continue;
    connection.send(JSON.stringify(data));
  }
}

function flushSendBuffers() {
  for (const connection of ws.connections) {
    if (connection.sendBuffer.length === 0) continue;
    let size = 0;
    for (let msg of connection.sendBuffer) {
      size += msg.length;
    }
    if (size === 0) continue;
    const buf = Buffer.concat(connection.sendBuffer, size);
    connection.sendBuffer.length = 0;
    connection.sendBytes(buf);
  }
}

setInterval(flushSendBuffers, 16);

function parseData(client, clientId, msg) {


  let code = msg.code;
  let data = msg.data;
  data.clientId = clientId;

  console.log(msg)
  switch (code) {
    case CMDS.move: {
      console.log(data)
      let viewPort = viewPortDirectory[clientId];
      switch (data.direction) {
        case "up": {
          viewPort.y -= 10;
          break;
        }
        case "down": {
          viewPort.y += 10;
          break;
        }
        case "left": {
          viewPort.x -= 10;
          break;
        }
        case "right": {
          viewPort.x += 10;
          break;
        }
      }

    }

    case CMDS.new_client: {
      // send data to world server
      let pmsg = {
        "code": CMDS.new_client,
        "clientId": clientId,
      }

      client.send(pmsg)
      gameServerClient.send(pmsg)


      break;
    }

    case CMDS.click: {

      gameServerClient.send({
        "code": CMDS.right_click,
        "data": data
      })
      break;
    }

    case CMDS.right_click: {

      gameServerClient.send({
        "code": CMDS.right_click,
        "data": data
      })

      break;
    }
    case CMDS.connect_new_server: {
      gameServerClient = client
    },
    case CMDS.updateWorld: {
      
  }
}

ws.on("request", function(req) {
  const client = req.accept(null, req.origin);
  const clientId = generateuuid();

  clients[clientId] = client

  client.sendBuffer = [];

  client.clientId = clientId;

  parseData(client, clientId, { code: CMDS.new_client, "data": {} });

  client.on("message", function(msg) {
    if (msg.type === 'binary') {
      parseData(client, clientId, msg.binaryData);
    } else {
      parseData(client, clientId, msg.utf8Data);
    }
  });
  client.on("close", function() {
    parseData(client, clientId, { code: CMDS.remove, "data": {} });
    console.log("client disconnected");
  });


});



function generateuuid() {
  // generates a uuid for the creature
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}