let battleField = undefined;

const socket = io();

const dimension = 800;
const diff = dimension/100;

function setup() {
    createCanvas(dimension+200, dimension);

}

function draw() {
    background(0);

    drawEdges();
    drawTitle();
    if(battleField !== undefined) drawBattleField();
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


//SOCKET STUFF
socket.on('battleField', (data) => {
    battleField = data;
});