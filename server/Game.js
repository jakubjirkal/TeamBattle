const getDistance = require('./commonOperations').getDistance;

class Game{
    constructor(app){
        this.server = require('http').createServer(app);
        this.io = require('socket.io')(this.server);
        this.PORT = process.env.PORT || 3000;

        this.battleField = require('./data/battlefield');

        this.SOCKET_LIST = {};
        this.PLAYER_LIST = {};
        this.id = 1;
    }

    runServer(){
        this.server.listen(this.PORT, () => {
            console.log('Server running on port: ' + this.PORT);
        })
    }

    ioON(){
        this.io.sockets.on('connection', (socket) => {
                //handle connection
            socket.id = this.id;
            this.id++;
            this.SOCKET_LIST[socket.id] = socket;
            console.log('Socket connection with id: ' + socket.id);

            socket.emit('battleField', this.battleField);

            socket.on('mouseProcess', (data) => {
                this.movePlayer(socket.id, data);
            });

            socket.on('disconnect', () => {
                delete this.PLAYER_LIST[socket.id];
                delete this.SOCKET_LIST[socket.id];
                console.log('Socket dissconnected with id: ' + socket.id);
            });

            socket.on('processNameAndTeam', (data) => {
                this.setNewPlayer(data.team, socket.id, data.name);
            });
        });

            //60FPS
        setInterval(() => {
            for(let pi in this.PLAYER_LIST){
                const player = this.PLAYER_LIST[pi];
                const socket = this.SOCKET_LIST[player.id];

                //my info
                socket.emit('me', player);

                //other players
                let otherPlayers = [];
                for(let pi2 in this.PLAYER_LIST){
                    if(pi === pi2) continue;
                    const player2 = this.PLAYER_LIST[pi2];

                    otherPlayers.push(player2);
                }
                socket.emit('otherPlayers', otherPlayers);
            }
        }, 1000/60);
    }

    setNewPlayer(team, id, name){
        const player = {
            team,
            id,
            hp: 100,
            ammo: 10,
            x: 400,
            y: team === 1 ? 100 : 700,
            name
        };

        this.PLAYER_LIST[id] = player;
    }

    movePlayer(id, dirs){
        const newX = this.PLAYER_LIST[id].x + dirs.x;
        const newY = this.PLAYER_LIST[id].y + dirs.y;

        let possible = true;

        //check edges
        if(newX <= 19 || newX >= 781 || newY <= 19 || newY >= 781) possible = false;

        //check battleField
        for(let i = 0; i < this.battleField.length; i++){
            const dist = getDistance(newX, newY, this.battleField[i].x, this.battleField[i].y);
            if(dist <= 16) possible = false;
        }

        if(possible){
            this.PLAYER_LIST[id].x = newX;
            this.PLAYER_LIST[id].y = newY;
        }
    }
}

module.exports = Game;