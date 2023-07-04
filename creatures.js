module.exports.Creature = class Creature {
  constructor(world, x, y, size, species) {
    this.id = generateuuid();
    this.x = x;
    this.y = y;
    // select a species from the species in the world
    this.species = species || world.species[Math.floor(Math.random() * world.species.length)];
    
    this.color = this.species.color || randomColor();
    // either the specified size or the size range of the species
    this.size = size || Math.min(Math.floor(Math.random() * 10) + this.species.lowerSizeBound, this.species.upperSizeBound);

    // the speed range of the species
    this.speed =  Math.min(Math.floor(Math.random() * 10) + this.species.lowerSpeedBound, this.species.upperSpeedBound);

    // a random number between the species.upperSightDistanceBound and the species.lowerSightDistanceBound
    this.sightDistance = Math.floor(Math.random() * this.species.upperSightDistanceBound) + this.species.lowerSightDistanceBound;
    
    // status 
    this.visibleCreatures = [];
    this.visiblePlants = [];
    this.current_behavior = "wander";
    this.registeredThreats = [];
    this.registeredPrey = [];
    this.registeredMates = [];
    this.registeredPlants = [];
    this.hunger = 0;
    this.last_breeding = 0;
    this.age = 0;
    this.facing = "north";
    this.energy = {
      "protein": 0,
      "carbohydrate": 0,
      "fat": 0
    }
  }

  burn_energy() {
    this.hunger += 1
    for (let nutrient in ["protein", "carbohydrate", "fat"]) {
      this.energy[nutrient] += this.species.metabolism * this.species.nutrientRequirements;
    }
  }

  observe(world) {
    // check to see if there is a creature within this creature
    let closeCreatures = world.getCreatureWithin(this.x, this.y, this.x+this.size, this.y+this.size);
    this.closeCreatures = closeCreatures;
    // check to see what you can see
    let visibleCreatures = world.getCreatureWithin(this.x - this.sightDistance, this.y - this.sightDistance, this.x+this.size + this.sightDistance, this.y + this.size +this.sightDistance );
    // remove ourselves
    visibleCreatures = visibleCreatures.filter(creature => creature !== this);
    
    this.visibleCreatures = visibleCreatures;
    if (debug) {
      console.log(this.color + " observed " + this.visibleCreatures.length + " creatures at sight distance " + this.sightDistance);
    }

    // see if there are visible plants
    let visiblePlants = world.getPlantWithin(this.x - this.sightDistance, this.y - this.sightDistance, this.x+this.size + this.sightDistance, this.y + this.size +this.sightDistance );
    this.visiblePlants = visiblePlants;
  }

  orient(world) {
    // if there are creatures within sight distance, check to see if they're bigger than you. If so, designate them as threats first.
    // if they're smaller than you, designate them as prey.
    this.registeredThreats = [];
    this.registeredPrey = [];
    this.registeredMates = [];
    this.registeredPlants = [];
    
    for (let creature of this.visibleCreatures) {
      if (creature == this) { continue }
      if (creature.species == this.species) { 
        this.registeredMates.push(creature); 
        continue;
        if (debug) {
          console.log(this.color + " is a mate with " + creature.color);
        }
      }
      if (creature.size > this.size && creature.color !== this.color) {
        this.registeredThreats.push(creature);
        continue;
        if (debug) {
          console.log(this.color + " registered threat " + creature.color);
        }
      } else {
        if (creature.color !== this.color) {
          this.registeredPrey.push(creature);
          continue;
          if (debug) {
            console.log(this.color + " registered prey " + creature.color);
          }
        }
      }
    }
      
    
  }

  decide(world) {
    // if there are threats, run from them, priority 1 is survive
    // if there are prey, eat them, priority 2 is thrive
    // if there are no threats or prey, wander, priority 3 is to discover new useful information
    this.current_behavior = null
    this.closestThreat = null;
    let closestThreatDistance = Infinity;
    for (let creature of this.registeredThreats) {
      let distance = world.getDistanceBetweenCreatures(this, creature);
      if (this.closestThreat == null || distance < closestThreatDistance) {
          this.closestThreat = creature;
          let closestThreatDistance = distance;
          this.current_behavior = "flee";
          return
      }
      
    }

    

    // only hunt if not being chased
    if (this.closestThreat == null && this.hunger > 30) {
      // if there are nearby plants, try to eat them 
      let closestPlant = null;
      let closestPlantDistance = Infinity;
      
      for (let plant of this.visiblePlants) {
        let distance = world.getDistanceBetweenCreatures(this, plant);
        if (this.closestPlant == null || distance < closestPlantDistance) {
          this.closestPlant = plant;
          let closestPlantDistance = distance;
          this.current_behavior = "eat plant";
          return
        }
      }
      this.closestPrey = null;
      let closestPreyDistance = Infinity;
      for (let creature of this.registeredPrey) {
        let distance = world.getDistanceBetweenCreatures(this, creature);
        if (this.closestPrey == null || distance < closestPreyDistance) {
          this.closestPrey = creature;
          this.current_behavior = "hunt";
          closestPreyDistance = distance;
          return
        }
      }
      if (this.closestPrey == null) {
        this.current_behavior = "wander";
        return
      }
    }

    if (this.last_breeding > this.species.breeding_time) {
      this.current_behavior = "breed";
      return
    }
    
    if (this.current_behavior == null) {
      this.current_behavior = "wander";
    }
  }
    
  act(world) {
    switch (this.current_behavior) {
      case "wander": {
        this.wander(world);
        break;
      }
      case "eat plant": {
        this.target = this.closestPlant;
        this.moveTowardTarget(world)
        break;
      }
      case "flee": {
        this.flee(world);
        break;
      }
      case "hunt": {
        this.hunt(world);
        break;
      }
      case "breed": {
        this.seekMate(world);
        break;
      }
    }
  }

  move(x, y, world) {
    if (debug) console.log(this.color + "moving to", x, y)

    //determine which way we're facing based on where we were and where we are about to be
    let lastFacing = this.facing;
    // we could be facing north, northeast, northwest, south, southeast, southwest, east, west
    let eastOrWest = (x - this.x) / Math.abs(x - this.x);
    let northOrSouth = (y - this.y) / Math.abs(y - this.y);
    if (eastOrWest > 0) {
      if (northOrSouth > 0) {
        this.facing = "northeast";
      } else if (northOrSouth < 0) {
        this.facing = "southeast";
      } else {
        this.facing = "east";
      }
    } else if (eastOrWest < 0) {
      if (northOrSouth > 0) {
        this.facing = "northwest";
      } else if (northOrSouth < 0) {
        this.facing = "southwest";
      } else {
        this.facing = "west";
      }
    } else {
      if (northOrSouth > 0) {
        this.facing = "north";
      } else if (northOrSouth < 0) {
        this.facing = "south";
      }
    }

    if (this.closeCreatures.length > 0) {
      // try to interact with them
      for (let creature of this.closeCreatures) {
        if (creature === this) continue;
        creature.interact(world,this);
      }
    }

    // if we're overlapping with a plant, eat it
    let overlappingPlants = world.getPlantWithin(this.x, this.y, this.x + this.size, this.y + this.size);
    if (overlappingPlants.length > 0) {
      for (let plant of overlappingPlants) {
        this.eatPlant(world,plant);
      }
    }
          
    
    
    this.x = x;
    this.y = y;
  }

  tick(world) {
    this.burn_energy();
    this.last_breeding += 1;
    this.age += 1;
    // Observe the world
    // Orient yourself in the world
    // Decide based on your observations and orientation what to do
    // Act based on your decisions
    this.observe(world);
    this.orient(world);
    this.decide(world);
    this.act(world);
    
  }

  
  
  interact(world,creature) {

    
    // the larger creature eats the smaller one
    // don't eat any creatures that are a similar color as you
    if (creature.species == this.species) {
      if (this.last_breeding > this.species.breeding_time && creature.last_breeding > this.species.breeding_time) {
        
        // spawn a new, small creature on the bottom right
        let newX = this.x + this.size 
        let newY = this.y + this.size
        let newCreature = new Creature(world, newX, newY, this.species.lowerSizeBound, this.species);
        world.creatures.push(newCreature);
        this.last_breeding = 0
        creature.last_breeding = 0
        if (debug) {
          console.log(this.color + " is breeding")
        }
        return;
      }
    }
    if (this.size > creature.size) {
      this.grow(creature.size)
      this.hunger = 0
      this.energy.protein = 0
      this.energy.fat = 0
      creature.die(world)
      return;
    } else if (this.size < creature.size) {
      creature.grow(this.size);
      creature.hunger = 0;
      this.die(world)
      return;
    }
    
  }

  eatPlant(world, plant) {
    // reduce the creature's nutrient need by the plant's nutrientData
    for (let nutrient in plant.nutrientData) {
      this.energy[nutrient] -= plant.nutrientData[nutrient];
    }
    plant.die(world)
    this.size += 1
  }

  grow(size) {
    this.size += size
  }

  wander(world) {
    let movement_translations = [
      {
        x: this.speed,
        y: 0
      },
      {
        x: -this.speed,
        y: 0
      },
      {
        x: 0,
        y: this.speed
      },
      {
        x: 0,
        y: -this.speed
      },
      // diagonals

      {
        x: this.speed,
        y: this.speed
      
      },
      {
        x: -this.speed,
        y: this.speed
      },
      {
        x: this.speed,
        y: -this.speed
      },
      {
        x: -this.speed,
        y: -this.speed
      }
    ];
    let movement_translation = movement_translations[Math.floor(Math.random() * movement_translations.length)];
    this.move(this.x + movement_translation.x, this.y + movement_translation.y,world);
  }

  

  hunt(world) {
    this.target = this.closestPrey;
    this.moveTowardTarget(world);
  }

  moveTowardTarget(world) {
    
    if (this.target == null) {
      return;
    }
    if (debug) console.log(this.color + " hunting")
    // figure out which direction we need to move in to get closer to our prey at our current speed
    let preyXDistance = this.target.x - this.x;
    let preyYDistance = this.target.y - this.y;
    let xTranslation = 0;
    let yTranslation = 0;
    if (preyXDistance > 0) {
      xTranslation = this.speed;
    } else {
      xTranslation = -this.speed;
    }
    if (preyYDistance > 0) {
      yTranslation = this.speed;
    } else {
      yTranslation = -this.speed;
    }
    
    this.move(this.x + xTranslation, this.y + yTranslation, world);
  }
    
  flee(world) {
    
    if (this.closestThreat == null) {
      return;
    }
    // console.log(this.color + " fleeing")
    // the reverse of the hunt method
    // figure out which direction we need to move in to get farther from all hunters at our current speed, by determining the lowest-cost position we can move to.
    // first figure out all positions we can move to
    // then determine the cost of that position, as defined by the proximity of that position to all hunters
    // then determine the lowest cost position
    // then move to that position
    let xTranslation = 0;
    let yTranslation = 0;

    let positions = [];

    // add all positions we can move to
    for (let i = 1; i < this.speed+1; i++) {
      positions.push({
        x: this.x + i,
        y: this.y,
        cost: Infinity
      });
      positions.push({
        x: this.x,
        y: this.y + i,
        cost: Infinity
      });
      positions.push({
        x: this.x - i,
        y: this.y,
        cost: Infinity
      });
      positions.push({
        x: this.x,
        y: this.y - i,
        cost: Infinity
      });
      positions.push({
        x: this.x + i,
        y: this.y + i,
        cost: Infinity
      });
      positions.push({
        x: this.x + i,
        y: this.y - i,
        cost: Infinity
      });
      positions.push({
        x: this.x - i,
        y: this.y + i,
        cost: Infinity
      });
      positions.push({
        x: this.x - i,
        y: this.y - i,
        cost: Infinity
      });
    }

    // console.log(positions.length + " positions")
    // determine the cost of each position
    let lowestCostPosition = positions[0];
    positions.forEach((position) => {
      let totalCost = 0;
      // check each registeredThreat to see it's distance from this position
      for (let i = 0; i < this.registeredThreats.length; i++) {
        let threat = this.registeredThreats[i];
        let threatDistance = parseInt(world.getDistanceBetweenCreatures(this, threat))
        totalCost += threatDistance;
      }
      position.cost = totalCost;
      if (position.cost < lowestCostPosition.cost) {
        lowestCostPosition = position;
      }
      
    })
    
    // move to that position
    this.move(lowestCostPosition.x, lowestCostPosition.y, world);
  }

  seekMate(world) {
    let closestMate = null;
    let closestDistance = Infinity;
    // loop through registered mates
    this.registeredMates.forEach((mate) => {
      // calculate distance between creature and mate
      let distance = world.getDistanceBetweenCreatures(this, mate);
      // if the distance is less than the current closest distance, set the closest mate to this mate
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMate = mate;
        this.closestMate = mate;
        if (debug) console.log(this.color + " seeking mate")
      }
    })
    // if there is a mate, move to it
    if (closestMate != null) {
      this.target = closestMate;
      this.moveTowardTarget(world);
      return;
    }
    // if there is no mate, wander
    this.wander(world);
  }
    
        
    

  die(world) {
    world.removeCreature(this);
    this.dead = true;
  }

  // this method returns only the representation of the creature needed for the client.
  json() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      color: this.color,
      size: this.size,
      dead: this.dead,
      last_breeding: this.last_breeding,
      species_speed: this.species.upperSpeedBound,
      age: this.age,
      hunger: this.hunger,
      current_behavior: this.current_behavior,
      sightDistance: this.sightDistance,
      threatCount: this.registeredThreats.length,
      mateCount: this.registeredMates.length,
      preyCount: this.preyCount,
      facing: this.facing,
      visibleCreatures: this.visibleCreatures.length,
      species: this.species.json()
    };
  }
}



function randomColor() {
  // picks a random color from a list of colors 
  let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#A52A2A", "#A0522D"]
  return colors[Math.floor(Math.random() * colors.length)];
}


function generateuuid() {
  // generates a uuid for the creature
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}