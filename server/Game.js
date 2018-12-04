class Game{
    constructor(app){
        this.server = require('http').createServer(app);
        this.io = require('socket.io')(this.server);
        this.PORT = process.env.PORT || 3000;

        this.battleField = require('./data/battlefield');

        this.SOCKET_LIST = {};
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

            socket.on('disconnect', () => {
                console.log('Socket dissconnected with id: ' + socket.id);
            });
        });
    }
}

module.exports = Game;