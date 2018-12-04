let battleField = undefined;
let me = undefined;

const socket = io();

const dimension = 800;
const diff = dimension/100;
let moves = {
  up: false,
  left: false,
  down: false,
  right: false
};

function setup() {
    createCanvas(dimension+200, dimension);

}

function draw() {
    background(0);

    drawEdges();
    drawTitle();
    if(battleField !== undefined) drawBattleField();
    if(me !== undefined) drawPlayer(me);

    checkKeys();
}

function keyPressed(){
    setMove(keyCode, true);
}

function keyReleased(){
    setMove(keyCode, false);
}

function setMove(keyCode, move){
    if(keyCode === 87){ //UP
        moves.up = move;
    }else if(keyCode === 65){ //LEFT
        moves.left = move;
    }else if(keyCode === 83){ //DOWN
        moves.down = move;
    }else if(keyCode === 68){ //RIGHT
        moves.right = move;
    }
}

function checkKeys(){
    if(moves.up && moves.right) processKeyPress({x: 1, y: -1});
    else if(moves.up && moves.left) processKeyPress({x: -1, y:-1});
    else if(moves.down && moves.right) processKeyPress({x: 1, y:1});
    else if(moves.down && moves.left) processKeyPress({x: -1, y: 1});
    else if(moves.up) processKeyPress({x: 0, y: -1});
    else if(moves.left) processKeyPress({x: -1, y: 0});
    else if(moves.down) processKeyPress({x: 0, y: 1});
    else if(moves.right) processKeyPress({x: 1, y: 0});
}

function drawEdges(){
    //horizontal
    for(let i = 0; i < dimension; i += diff){
        fill(255);

        //top
        drawBlock(i + diff/2, diff/2, diff);

        //down
        drawBlock(i + diff/2, dimension - diff/2, diff);
    }

    //veritcal
    for(let i = 0; i < dimension; i += diff){
        fill(255);

        //left
        drawBlock(diff/2, i + diff/2, diff);

        //right
        drawBlock(dimension - diff/2, i + diff/2, diff);
    }
}

function drawBlock(x, y, width){
    const half = width / 2;

    fill(255);
    quad(x - half, y - half, x + half, y - half, x + half, y + half, x - half, y + half);
}

function drawTitle(){
    const field = "Team Battle";

    fill(255);
    textSize(32);
    text(field, dimension+15, 32);
}

function drawBattleField(){
    for(let i = 0; i < battleField.length; i++){
        drawBlock(battleField[i].x, battleField[i].y, diff);
    }
}

function drawPlayer(player){
    if(player.team === 1) fill(color(255,0,0));
    else fill(color(0,0,128));

    ellipse(player.x, player.y, 20);
}

//SOCKET STUFF
function processKeyPress(dirs){
    socket.emit('mouseProcess', dirs);
}

socket.on('battleField', (data) => {
    battleField = data;
});

socket.on('me', (data) => {
   me = data;
});