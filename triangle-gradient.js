let img; // Variable to hold the background image
let lines = [];
let move = true;
let overlay; // PGraphics buffer for overlay

function preload() {
  // Load an image before the program starts (adjust the path as needed)
  img = loadImage('content/logo-gradient.jpg');
}

function setup() {
  // Create a canvas with fixed dimensions (adjust width and height as needed)
  let cnv = createCanvas(600, 400);
  cnv.parent('mySketchContainer'); // Attach the canvas to the HTML container
  
  // Initialize the overlay buffer with the same dimensions
  overlay = createGraphics(600, 400);
}

class Line {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.xSpeed = random(-0.75, 0.75);
    this.ySpeed = random(-0.75, 0.75);
  }

  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.x > width || this.x < 0) {
      this.xSpeed *= -1;
    }
    if (this.y > height || this.y < 0) {
      this.ySpeed *= -1;
    }
  }

  createTriangleWindow() {
    let closest = this.findClosest();

    if (closest.length === 2 && this.areMutualNeighbors(closest[0], closest[1])) {
      overlay.noStroke();
      overlay.erase();
      overlay.beginShape();
      overlay.vertex(this.x, this.y);
      overlay.vertex(closest[0].x, closest[0].y);
      overlay.vertex(closest[1].x, closest[1].y);
      overlay.endShape(CLOSE);
      overlay.noErase();
    }
  }

  drawLinesAndDots() {
    stroke(255);
    fill(255);
    circle(this.x, this.y, 4);

    let closest = this.findClosest();
    if (closest.length === 2) {
      line(this.x, this.y, closest[0].x, closest[0].y);
      line(this.x, this.y, closest[1].x, closest[1].y);
    }
  }

  findClosest() {
    let distances = lines.map(other => {
      if (other === this) return { line: null, dist: Infinity };
      return { line: other, dist: dist(this.x, this.y, other.x, other.y) };
    });

    distances.push({ line: { x: mouseX, y: mouseY, isMouse: true }, dist: dist(this.x, this.y, mouseX, mouseY) });
    distances = distances.filter(d => d.line !== null).sort((a, b) => a.dist - b.dist);
    return distances.slice(0, 2).map(d => d.line);
  }

  areMutualNeighbors(lineA, lineB) {
    if (lineA.isMouse || lineB.isMouse) return true;
    return lineA.findClosest().includes(lineB) && lineB.findClosest().includes(this);
  }
}

function mouseClicked() {
  lines.push(new Line(mouseX, mouseY));
}

function draw() {
  image(img, 0, 0, width, height);
  overlay.clear();
  overlay.background(0);

  lines.forEach(line => {
    if (move) {
      line.move();
    }
    line.createTriangleWindow();
  });

  image(overlay, 0, 0);
  
  lines.forEach(line => {
    line.drawLinesAndDots();
  });
}
