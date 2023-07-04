module.exports.Plant = class Plant {
  constructor(data) {
    this.x = data.x;
    this.y = data.y;
    this.color = data.species.color;
    this.species = data.species;
    this.size = this.species.size;
    this.nutrientData = {}
    for (let nutrientName in data.species.nutrientData) {
      this.nutrientData[nutrientName] = data.species.nutrientData[nutrientName];
      this.nutrientData[nutrientName].concentration = 1
    }

    // keep data around
    this.data = data
  }
  
  grow(world) {
      // increase each nutrient in the plant by it's concentration rate defined in the species, until max concentration
      for (let nutrientName in this.species.nutrientData) {
        this.nutrientData[nutrientName].concentration += this.species.nutrientData[nutrientName].concentrationRate;
        if (this.nutrientData[nutrientName].concentration > this.species.nutrientData[nutrientName].maxConcentration) {
          this.nutrientData[nutrientName].concentration = this.species.nutrientData[nutrientName].maxConcentration;
          let randomSpread = Math.random()
          if (randomSpread < this.species.spreadRate) {
            this.spread(world)
          }
        }
      }
  }

  spread(world) {
    // choose a random nearby location to spread to
    let spreadLocations = [
      [this.x - this.size, this.y],
      [this.x + this.size, this.y],
      [this.x, this.y - this.size],
      [this.x, this.y + this.size],
      [this.x - this.size, this.y - this.size],
      [this.x - this.size, this.y + this.size],
      [this.x + this.size, this.y - this.size],
      [this.x + this.size, this.y + this.size]
    ];
    
    let spreadLocation = spreadLocations[Math.floor(Math.random() * spreadLocations.length)];
    // check the world for a plant at the spread location
    let nearbyPlants = world.getPlantWithin(spreadLocation[0], spreadLocation[1], spreadLocation[0] + this.size, spreadLocation[1] + this.size)
    if (nearbyPlants.length == 0) {
      let newPlant = new Plant({
        x: spreadLocation[0],
        y: spreadLocation[1],
        species: this.species,
      })
      
      world.addPlant(newPlant)
    }
    
  }

  die(world) {
    // remove the plant from the world
    world.removePlant(this)
    this.world = null
  }
  
  tick(world) {
    this.grow(world);
  }
  
  json() {
    return {
        x: this.x,
        y: this.y,
        size: this.size,
        color: this.color,
        species: this.species.json()
      };
    }
  }


