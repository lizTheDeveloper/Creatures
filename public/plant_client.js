class Plant {
  constructor(data) {
    this.x = data.x;
    this.y = data.y;
    let forestGreen = "#0a5a0a";
    this.color = data.color || forestGreen;
    this.size = data.size || 2;
    // add any other properties from data we didn't plan for
    this.data = data
  }
  
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
  
}
