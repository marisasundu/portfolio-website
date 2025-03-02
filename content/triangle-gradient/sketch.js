let img; // Variable to hold the background image
let lines = [];
// let button;
let move = true;
let overlay; // PGraphics buffer for overlay
let currHeight = 300;

function preload() {
  // Load an image before the program starts (replace 'your-image.jpg' with your image file path)
  img = loadImage('./content/logo-gradient.jpg');
}

function setup() {
  // createCanvas(windowWidth, 400);

  let cnv = createCanvas(windowWidth, currHeight); // Adjust dimensions as needed
  cnv.parent('mySketchContainer');  // This attaches the canvas to the specified div
  
  // Initialize the overlay buffer with the same dimensions
  // overlay = createGraphics(600, 400);
  
  // Initialize the overlay buffer
  overlay = createGraphics(windowWidth, currHeight);
  strokeWeight(.3);
  
  
  for (i = 0; i < 20; i++) {
    x = random(width);
    y = random(height);
    let l = new Line(x, y);
    lines.push(l);
  }
  
  // button = createButton('toggle movement', 'red');
  // button.position(4, windowHeight - 30);
  // button.mousePressed(changeMovement);
}

function windowResized() {
  // Resize canvas and overlay whenever the window size changes
  resizeCanvas(windowWidth, currHeight);
  overlay = createGraphics(windowWidth, currHeight);

  lines = [];
  for (i = 0; i < 20; i++) {
    x = random(width);
    y = random(height);
    let l = new Line(x, y);
    lines.push(l);
  }
}

class Line {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.xSpeed = random(-0.3, 0.3);
    this.ySpeed = random(-0.3, 0.3);
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
    // Find the two closest neighbors, including the mouse
    let closest = this.findClosest();

    if (closest.length === 2 && this.areMutualNeighbors(closest[0], closest[1])) {
      // Draw a transparent triangle on the overlay buffer
      overlay.noStroke();
      overlay.erase(); // Start erasing on the overlay buffer
      overlay.beginShape();
      overlay.vertex(this.x, this.y);
      overlay.vertex(closest[0].x, closest[0].y);
      overlay.vertex(closest[1].x, closest[1].y);
      overlay.endShape(CLOSE);
      overlay.noErase(); // Stop erasing on the overlay buffer
    }
  }

  drawLinesAndDots() {
    // Draw points and lines in white on the main canvas
    stroke(255);
    fill(255);
    circle(this.x, this.y, .4);

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

// function changeMovement(){
//   move = !move;
// }

function mouseClicked(){
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    // Add new Line instance at the mouse position
    lines.push(new Line(mouseX, mouseY));
  }
}

function draw() {
  // Display the image as the background
  image(img, 0, 0, width, height);
  
  // Clear and redraw overlay
  overlay.clear();
  overlay.background(25,25,25);

  // Process and display each line
  lines.forEach(line => {
    if (move) line.move();
    line.createTriangleWindow();
  });

  // Display the overlay on the main canvas
  image(overlay, 0, 0);

  // Draw all lines and dots
  lines.forEach(line => {
    line.drawLinesAndDots();
  });
  
  // Only connect the mouse to its closest two points if it's inside the canvas
  if (isMouseInsideCanvas()) {
    connectMouseToClosestTwo();
  }
}

// Helper function to check if the mouse is inside the canvas
function isMouseInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function connectMouseToClosestTwo() {
  if (lines.length < 2) return;

  // Check if the mouse is inside the canvas
  const includeMouse = isMouseInsideCanvas();

  // Find the two closest points, conditionally including the mouse
  let pointsToConsider = lines.map(line => {
    return { line: line, dist: dist(mouseX, mouseY, line.x, line.y) };
  });

  // Only include the mouse as a valid point if it's within canvas bounds
  if (includeMouse) {
    pointsToConsider.push({ line: { x: mouseX, y: mouseY, isMouse: true }, dist: 0 });
  }

  // Sort by distance to get the two closest points
  pointsToConsider.sort((a, b) => a.dist - b.dist);
  let closestToMouse = pointsToConsider.slice(0, 2).map(item => item.line);

  // Draw lines only if the mouse is included and within bounds
  if (includeMouse) {
    stroke(255);
    line(mouseX, mouseY, closestToMouse[0].x, closestToMouse[0].y);
    line(mouseX, mouseY, closestToMouse[1].x, closestToMouse[1].y);
  }
}