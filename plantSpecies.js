module.exports.PlantSpecies = class PlantSpecies {
  constructor(data) {
    this.size = data.size || Math.floor(Math.random() * 5) + 2
    this.color = data.color || randomGreenColor();
    this.spreadRate = data.spreadRate || Math.random();
    data.world.species.plants.push(this)
    this.nutrientData = {}
    console.log(data)
    for (let nutrientName in data.nutrientData) {
      this.nutrientData[nutrientName] = {
        name: nutrientName,
        concentrationRate: data.nutrientData[nutrientName].concentrationRate || Math.random(),
        maxConcentration: data.nutrientData[nutrientName].maxConcentration || Math.floor(Math.random() * 100)
      };
    }
    return this;
  }
  
  json() {
    return {
      size: this.size,
      color: this.color,
      nutrientData: this.nutrientData
    };
  }
}


function randomGreenColor() {
  let red = Math.min(Math.floor(Math.random() * 256), 30);
  let green = Math.max(Math.floor(Math.random() * 256), 150);
  let blue = Math.min(Math.floor(Math.random() * 256), 30);
  // transform to hex
  let hex = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
  return hex;
}