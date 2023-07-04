/** @type {HTMLCanvasElement} */
const C = document.getElementById("c");
C.width = 400;
C.height = 400;
let stats = document.getElementById("stats");
stats.appendChild(document.createTextNode("Stats"))
let selectedCreatures = {};
let viewPort = {
  x: 0,
  y: 0,
  width: C.width,
  height: C.height
};

/** @type {CanvasRenderingContext2D} */
const X = C.getContext("2d");

const CMDS = {
  move: 0,
  new_client: 1,
  remove: 2,
  click: 3,
  updateWorld: 4,
  right_click: 5

};

let mySpeciesID = "";

window.creatures = [];
window.plants = []

let socketOpen = false;




C.addEventListener("click", function(e) {
  if (socketOpen) {
    let buf = new Int16Array(2);

    let data = {
      code: CMDS.click,
      data: {
        x: e.layerX,
        y: e.layerY
      }

    };

    let creature = new Creature(e.layerX, e.layerY, "#000000");

    creature.draw(X);
    creatures.push(creature);

    socket.send(JSON.stringify(data));
  }
})

C.addEventListener("contextmenu", function(e) {
  e.preventDefault();
  if (socketOpen) {
    let buf = new Int16Array(2);

    let data = {
      code: CMDS.right_click,
      data: {
        x: e.layerX,
        y: e.layerY
      }
    }
    let plant = new Plant(e.layerX, e.layerY);
    plant.draw(X);
    plants.push(plant);
    socket.send(JSON.stringify(data));
  }
})


const socket = new WebSocket(location.href.replace("http", "ws"));

function parseMessage(message) {
  message = JSON.parse(message);
  parsePacket(message.code, message.data);
}

function parsePacket(code, data) {
  switch (code) {
    case CMDS.move: {
      
      break;
    }

    case CMDS.new_client: {
      console.log("new");
      console.log(data)
      mySpeciesID = data.creatures[0].speciesID;
      console.log(speciesID)
      break;
    }

    case CMDS.remove: {
      console.log("remove");
      
      break;
    }
    case CMDS.updateWorld: {
      // clear the world and redraw all creatures we've recieved, which will have an x, y, and a color. We'll use them to create a new Creature(x,y,color)
      X.clearRect(0, 0, C.width, C.height);
      let parsedData = JSON.parse(data);
      console.log(parsedData)
      creaturesData = parsedData.creatures;
      plantsData = parsedData.plants;

      // Update creature location based on received data

      // break;
      window.creatures = []
      window.plants = []
      stats.innerHTML = "Stats: <hr>"
      let table = document.createElement("table");
      let columns = Object.keys(creaturesData[0]);
      
      let tr = document.createElement("tr");
      columns.forEach((column) => {
        let td = document.createElement("td");
        td.innerHTML = column;
        tr.appendChild(td);
        
      })
      table.appendChild(tr);

      for (let plantData of plantsData) {
        let plant = new Plant(plantData);
        window.plants.push(plant);
        plant.draw(X);
      }

      for (let creatureData of creaturesData) {
        let creature = new Creature(creatureData);
        window.creatures.push(creature);
        if (selectedCreatures[creature.id] || creature.species.id == mySpeciesID) {
          creature.selected = true;
        }
        creature.draw(X,table,selectedCreatures)
        
      }

      stats.appendChild(table);
      
      break;
    }

  }
}

socket.addEventListener("message", function(e) {
  parseMessage(e.data);
});

socket.addEventListener("open", function(e) {
  setTimeout(function() {
    socketOpen = true;
  }, 75); // give some time for the socket to send data
});

function getCreatureAt(x, y) {
  // check to see if X and Y overlap any part of a creature
  let creaturesWithin = [];

  for (let creature of window.creatures) {
    let creatureX = creature.x;
    let creatureY = creature.y;
    let creatureX2 = creatureX + creature.size;
    let creatureY2 = creatureY + creature.size;

    // check to see if the pixel at by x,y overlaps in any way with the box defined by creatureX,creatureY and creatureX2,creatureY2
    if (x >= creatureX && x <= creatureX2 && y >= creatureY && y <= creatureY2) {
      creaturesWithin.push(creature);
      continue;
    }
  }
  return creaturesWithin;
}


// when our mouse hovers over one of the creatures
window.onmousemove = function(e) {
  // console.log("mousemove", e.layerX, e.layerY);

  let foundCreatures = getCreatureAt(e.layerX, e.layerY);
  for (let i=0; i<foundCreatures.length; i++) {
    let foundCreature = foundCreatures[i];
    selectedCreatures[foundCreature.id] = foundCreature;
    foundCreature.selected = true;
  }
}


window.addEventListener("keydown", function(e) {
  // console.log("keydown", e.key);

  switch (e.key) {
      
    case "ArrowUp": {
      // console.log("ArrowUp");
      socket.send(JSON.stringify({
        cmd: CMDS.move,
        direction: "up",
        viewPort: viewPort
      }));
      break;
    }
      
    case "ArrowDown": {
      // console.log("ArrowDown");
      socket.send(JSON.stringify({
        cmd: CMDS.move,
        direction: "down",
        viewPort: viewPort
      }));
      break;
    }
      
    case "ArrowLeft": {
      // console.log("ArrowLeft");
      socket.send(JSON.stringify({
        cmd: CMDS.move,
        direction: "left",
        viewPort: viewPort
      }));
      break;
    }
      
    case "ArrowRight": {
      // console.log("ArrowRight");
      socket.send(JSON.stringify({
        cmd: CMDS.move,
        direction: "right",
        viewPort: viewPort
      }));
      break;
    }
  }
})