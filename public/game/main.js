let battleField = undefined;
let me = undefined;
let otherPlayers = undefined;
let bullets = undefined;

const socket = io();

const dimension = 800;
const diff = dimension / 100;
let moves = {
  up: false,
  left: false,
  down: false,
  right: false
};

function setup() {
  createCanvas(dimension + 200, dimension);

  const name = prompt("Select your name");
  const team = Number(prompt("Select your team (1-2)"));

  processNameAndTeam(name, team);
}

function draw() {
  background(0);

  drawEdges();
  drawTitle();
  if (battleField !== undefined) drawBattleField();
  if (me !== undefined) drawPlayer(me);
  if (otherPlayers !== undefined) {
    for (let i = 0; i < otherPlayers.length; i++) drawPlayer(otherPlayers[i]);
  }
  if (bullets !== undefined) drawBullets();

  checkKeys();
}

function keyPressed() {
  setMove(keyCode, true);
}

function keyReleased() {
  setMove(keyCode, false);
}

function setMove(keyCode, move) {
  if (keyCode === 87) {
    //UP
    moves.up = move;
  } else if (keyCode === 65) {
    //LEFT
    moves.left = move;
  } else if (keyCode === 83) {
    //DOWN
    moves.down = move;
  } else if (keyCode === 68) {
    //RIGHT
    moves.right = move;
  }
}

function checkKeys() {
  if (moves.up && moves.right) processKeyPress({ x: 1, y: -1 });
  else if (moves.up && moves.left) processKeyPress({ x: -1, y: -1 });
  else if (moves.down && moves.right) processKeyPress({ x: 1, y: 1 });
  else if (moves.down && moves.left) processKeyPress({ x: -1, y: 1 });
  else if (moves.up) processKeyPress({ x: 0, y: -1 });
  else if (moves.left) processKeyPress({ x: -1, y: 0 });
  else if (moves.down) processKeyPress({ x: 0, y: 1 });
  else if (moves.right) processKeyPress({ x: 1, y: 0 });
}

function mouseClicked() {
  triggerShot(mouseX, mouseY);
}

function drawEdges() {
  //horizontal
  for (let i = 0; i < dimension; i += diff) {
    fill(255);

    //top
    drawBlock(i + diff / 2, diff / 2, diff);

    //down
    drawBlock(i + diff / 2, dimension - diff / 2, diff);
  }

  //veritcal
  for (let i = 0; i < dimension; i += diff) {
    fill(255);

    //left
    drawBlock(diff / 2, i + diff / 2, diff);

    //right
    drawBlock(dimension - diff / 2, i + diff / 2, diff);
  }
}

function drawBlock(x, y, width) {
  const half = width / 2;

  fill(255);
  quad(
    x - half,
    y - half,
    x + half,
    y - half,
    x + half,
    y + half,
    x - half,
    y + half
  );
}

function drawTitle() {
  const field = "Team Battle";

  fill(255);
  textSize(32);
  text(field, dimension + 15, 32);
}

function drawBattleField() {
  for (let i = 0; i < battleField.length; i++) {
    drawBlock(battleField[i].x, battleField[i].y, diff);
  }
}

function drawPlayer(player) {
  if (player.team === 1) fill(color(255, 0, 0));
  else fill(color(0, 255, 255));

  ellipse(player.x, player.y, 20);
  textSize(14);
  text(player.name, player.x + 5, player.y - 12);
}

function drawBullets() {
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i].team === 1) fill(color(255, 0, 0));
    else fill(color(0, 255, 255));

    ellipse(bullets[i].x, bullets[i].y, 5);
  }
}

//SOCKET STUFF
function processKeyPress(dirs) {
  socket.emit("mouseProcess", dirs);
}

function processNameAndTeam(name, team) {
  socket.emit("processNameAndTeam", { name, team });
}

function triggerShot(x, y) {
  socket.emit("triggerShot", { x, y });
}

socket.on("battleField", data => {
  battleField = data;
});

socket.on("me", data => {
  me = data;
});

socket.on("otherPlayers", data => {
  otherPlayers = data;
});

socket.on("bullets", data => {
  bullets = data;
});
