
module.exports.Species = class Species {
  
  constructor(world) {
    this.id = generateuuid();
    // determine a minimum size above 2, and a maximum starting size lower than 10
    this.upperSizeBound = Math.floor(Math.random() * 10 + 2);
    this.lowerSizeBound = 2
    this.upperSpeedBound = Math.floor(Math.random() * 10 + 2);
    this.lowerSpeedBound = 1
    this.upperSightDistanceBound = Math.floor(Math.random() * 10) + this.upperSizeBound;
    this.lowerSightDistanceBound = this.upperSightDistanceBound - Math.min(Math.floor(Math.random() * 10),5);
    this.color = world.colors.pop(0);
    this.breeding_time = Math.floor(Math.random() * 10 + 30);
    this.breeding_chance = Math.floor(Math.random() * 10 + 30);
    this.breeding_speed = Math.floor(Math.random() * 10 + 30);
    this.members = [];

    this.attack_power = Math.floor(Math.random() * 10 + 1);

    this.nutrientRequirements = {
      "protein": Math.floor(Math.random() * 10 + 1),
      "carbohydrate": Math.floor(Math.random() * 10 + 1),
      "fat": Math.floor(Math.random() * 10 + 1)
    }
    this.metabolism = this.size * this.attack_power;

    world.species.creatures.push(this);
  }

  json() {
    return {
      id: this.id,
      upperSizeBound: this.upperSizeBound,
      lowerSizeBound: this.lowerSizeBound,
      upperSpeedBound: this.upperSpeedBound,
      lowerSpeedBound: this.lowerSpeedBound,
      upperSightDistanceBound: this.upperSightDistanceBound,
      lowerSightDistanceBound: this.lowerSightDistanceBound,
      color: this.color,
      breeding_time: this.breeding_time,
      breeding_chance: this.breeding_chance,
      breeding_speed: this.breeding_speed
    }
  }
}

function generateuuid() {
  // generates a uuid for the creature
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}