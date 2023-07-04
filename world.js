let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#A52A2A", "#A0522D"];
const MAX_CREATURES = 1000
const MAX_PLANTS = 4000

const Species = require("./species.js").Species;

module.exports.World = class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.creatures = [];
    this.species = {
      creatures: [],
      plants: []
    };
    this.plants = [];
    this.colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#A52A2A", "#A0522D"];
  }
  
  addCreature(creature) {
    if (this.creatures.length < MAX_CREATURES) {
      this.creatures.push(creature);
      creature.world = this;
      creature.species.members.push(creature);
    }
  }
  
  removeCreature(creature) {
    this.creatures.splice(this.creatures.indexOf(creature), 1);
  }

  addPlant(plant) {
    if (this.plants.length < MAX_PLANTS) {
      this.plants.push(plant);
    }
  }

  removePlant(plant) {
    this.plants.splice(this.plants.indexOf(plant), 1);
  }
  
  getCreatureWithin(x, y, x2, y2) {
    // check to see if any part of a creature is within x,y and x2,y2
    let creaturesWithin = [];
    
    for (let creature of this.creatures) {
      let creatureX = creature.x;
      let creatureY = creature.y;
      let creatureX2 = creatureX + creature.size;
      let creatureY2 = creatureY + creature.size;

      // check to see if the box defined by x,y and x2,y2 overlaps in any way with the box defined by creatureX,creatureY and creatureX2,creatureY2
      if (x < creatureX2 && x2 > creatureX && y < creatureY2 && y2 > creatureY) {
        creaturesWithin.push(creature);
        continue;
      }
        
      
    }
    return creaturesWithin;
  }

  getPlantWithin(x, y, x2, y2) {
    // check to see if any part of a creature is within x,y and x2,y2
    let plants = [];
    
    for (let plant of this.plants) {
      let plantX = plant.x;
      let plantY = plant.y;
      let plantX2 = plantX + plant.size;
      let plantY2 = plantY + plant.size;

      // check to see if the box defined by x,y and x2,y2 overlaps in any way with the box defined by plantX,plantY and plantX2,plantY2
      if (x < plantX2 && x2 > plantX && y < plantY2 && y2 > plantY) {
        plants.push(plant);
        continue;
      }
        
      
    }
    return plants;
  }

  getDistanceBetweenCreatures(creature1, creature2) {
    let creature1X = creature1.x;
    let creature1Y = creature1.y;
    let creature2X = creature2.x;
    let creature2Y = creature2.y;
    let creature1X2 = creature1X + creature1.size;
    let creature1Y2 = creature1Y + creature1.size;
    let creature2X2 = creature2X + creature2.size;
    let creature2Y2 = creature2Y + creature2.size;
    let xDistance = Math.abs(creature1X - creature2X);
    let yDistance = Math.abs(creature1Y - creature2Y);
    let xDistance2 = Math.abs(creature1X2 - creature2X2);
    let yDistance2 = Math.abs(creature1Y2 - creature2Y2);
    let xDistanceSquared = xDistance * xDistance;
    let yDistanceSquared = yDistance * yDistance;
    let xDistance2Squared = xDistance2 * xDistance2;
    let yDistance2Squared = yDistance2 * yDistance2;
    let distanceSquared = xDistanceSquared + yDistanceSquared;
    let distanceSquared2 = xDistance2Squared + yDistance2Squared;
    return Math.sqrt(distanceSquared + distanceSquared2);
  }

      
  
  tick() {
    console.log("Creature Population count:", this.creatures.length, "Plant Population count:", this.plants.length);
    for (let creature of this.creatures) {
      creature.tick(this);
    }
    for (let plant of this.plants) {
      plant.tick(this);
    }
  }
  
  json() {
    return {
      width: this.width,
      height: this.height,
      creatures: this.creatures.map(creature => creature.json()),
      plants: this.plants.map(plant => plant.json())
    };
    
  }
}


  
