class Creature {
  constructor(data) {
    this.x = data.x;
    this.y = data.y;
    this.color = data.color || "#000000";
    this.size = data.size || 2;
    // add any other properties from data we didn't plan for
    this.data = data;
    for (let key in data) {
      this[key] = data[key];
    }
  }

  draw(ctx, table, selectedCreatures) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);

    // based on whether we're facing north, northeast, east, southeast, south, southwest, west, or northwest, draw a 1px black line across the whole face to indicate the direction we're facing
    let facing = this.data.facing;
    if (facing === "north") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y, this.size, 1);
    }
    if (facing === "northeast") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y, this.size, 1);
      ctx.fillRect(this.x + this.size, this.y, 1, this.size);
    }
    if (facing === "east") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x + this.size, this.y, 1, this.size);
    }
    if (facing === "southeast") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x + this.size, this.y, 1, this.size);
      ctx.fillRect(this.x, this.y + this.size, this.size, 1);
    }
    if (facing === "south") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y + this.size, this.size, 1);
    }
    if (facing === "southwest") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y, 1, this.size);
      ctx.fillRect(this.x, this.y + this.size, this.size, 1);
    }
    if (facing === "west") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y, 1, this.size);
    }
    if (facing === "northwest") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(this.x, this.y, 1, this.size);
      ctx.fillRect(this.x, this.y, this.size, 1);
    }
    
    if (this.selected) {
      let tr = document.createElement("tr");
      for (let key in this.data) {
        let td = document.createElement("td");
        td.innerHTML = this.data[key];
        tr.appendChild(td);
        
      }
      tr.addEventListener("click",function() {
          this.selected = false;
          table.deleteRow(tr.rowIndex);
          delete selectedCreatures[this.id];
        })
      table.appendChild(tr);
    }
  }
  
  json() {
    return {
      x: this.x,
      y: this.y,
      color: this.color,
      size: this.size
    };
  }
}