// websocket client to connect to a websocket server running on port 5000

let serverID = 0;
debug = false;

let WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:5000');

const Species = require("./species.js").Species
const { PlantSpecies } = require("./plantSpecies.js");

const Creature = require("./creatures.js").Creature
const World = require("./world.js").World
const Plant = require("./plants.js").Plant


// World Setup
let world = new World(800, 800)

let speciesDirectory = {};
let viewPortDirectory = {};




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

ws.on('open', function open() {
  ws.send(JSON.stringify({
    "code": CMDS.connect_new_server,
    "data": {
      "server_id": serverID,
      "check": "This is the secret string that indicates I'm really a server."
    }
  }));
});

ws.on('message', function message(data) {
  console.log('received:', data);
  // parse the incoming buffer 
  let buf = Buffer.alloc();
  let json = buf.toString('utf8');
  console.log(json);
  parseMessage(json);
});

function parseMessage(message) {
  message = JSON.parse(message);
  parseData(message.code, message);
}

function parseData(code, data) {

  switch (code) {
    case CMDS.new_client: {
      console.log("new client");
      console.log("client id: " + data.clientId)
      let newPlantSpecies = new PlantSpecies({
        "world": world,
        "nutrientData": {
          "carbohydrate": {},
          "protein": {},
          "fat": {}
        }
      })

      let clientSpecies = {
        "plants": [newPlantSpecies],
        "creatures": [new Species(world)]
      };

      speciesDirectory[data.clientId] = {
        creatures: [new Species(world)],
        plants: [newPlantSpecies]
      };

      console.log("new species:", speciesDirectory);
    }

    case CMDS.click: {

      // pull the x and y out of the message
      let x = data.x;
      let y = data.y;
      console.log(data)
      let species = speciesDirectory[data.clientId].creatures[0];

      let newCreature = new Creature(world, x, y, null, species);
      world.addCreature(newCreature);
      break;
    }

    case CMDS.right_click: {
      let x = data.x;
      let y = data.y;
      console.log("planting plant at ", x, y)
      let plantSpecies = speciesDirectory[data.clientId].plants[0];
      let newPlant = new Plant({
        world: world,
        x: x,
        y: y,
        species: plantSpecies,
        clientId: data.clientId
      });
      world.addPlant(newPlant);

      break;
    }
  }
}


// once a second, tick the world
setInterval(function() {

  world.tick()
  // send updated creature location to all clients
  let code = CMDS.updateWorld;
  // todo next: just send the client the creatures and plants within the viewport that it sent to us (idk how to associate client with connection in ws.connections)

  let pmsg = { "code": code, "data": JSON.stringify(world.json()) }

  ws.send(JSON.stringify(pmsg));

}, 2000);