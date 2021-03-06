const getDistance = require("./commonOperations").getDistance;

class Game {
  constructor(app) {
    this.server = require("http").createServer(app);
    this.io = require("socket.io")(this.server);
    this.PORT = process.env.PORT || 3000;

    this.battleField = require("./data/battlefield");
    this.bullets = [];
    this.ammo = this.setAmmo();
    this.hp = this.setHP();

    this.SOCKET_LIST = {};
    this.PLAYER_LIST = {};
    this.id = 1;
  }

  runServer() {
    this.server.listen(this.PORT, () => {
      console.log("Server running on port: " + this.PORT);
    });
  }

  ioON() {
    this.io.sockets.on("connection", socket => {
      //handle connection
      socket.id = this.id;
      this.id++;
      this.SOCKET_LIST[socket.id] = socket;
      console.log("Socket connection with id: " + socket.id);

      socket.emit("battleField", this.battleField);

      socket.on("mouseProcess", data => {
        this.movePlayer(socket.id, data);
      });

      socket.on("triggerShot", data => {
        this.setShot(data.x, data.y, this.PLAYER_LIST[socket.id], socket.id);
      });

      socket.on("disconnect", () => {
        delete this.PLAYER_LIST[socket.id];
        delete this.SOCKET_LIST[socket.id];
        console.log("Socket dissconnected with id: " + socket.id);
      });

      socket.on("processNameAndTeam", data => {
        this.setNewPlayer(data.team, socket.id, data.name);
      });
    });

    //60FPS
    setInterval(() => {
      this.processBullets();
      for (let pi in this.PLAYER_LIST) {
        const player = this.PLAYER_LIST[pi];
        const socket = this.SOCKET_LIST[player.id];

        //process picking items
        this.processAmmo(player, player.id);
        this.processHP(player, player.id);

        //my info
        socket.emit("me", player);

        //other players
        let otherPlayers = [];
        for (let pi2 in this.PLAYER_LIST) {
          if (pi === pi2) continue;
          const player2 = this.PLAYER_LIST[pi2];

          otherPlayers.push(player2);
        }
        socket.emit("otherPlayers", otherPlayers);
        socket.emit("bullets", this.bullets);
        socket.emit("ammo", this.ammo);
        socket.emit("hp", this.hp);
      }
    }, 1000 / 60);
  }

  setNewPlayer(team, id, name) {
    const player = {
      team,
      id,
      hp: 100,
      ammo: 10,
      x: 400,
      y: team === 1 ? 100 : 700,
      name,
      points: 0
    };

    this.PLAYER_LIST[id] = player;
  }

  movePlayer(id, dirs) {
    const newX = this.PLAYER_LIST[id].x + dirs.x * 1.5;
    const newY = this.PLAYER_LIST[id].y + dirs.y * 1.5;

    let possible = true;

    //check edges
    if (newX <= 19 || newX >= 781 || newY <= 19 || newY >= 781)
      possible = false;

    //check battleField
    for (let i = 0; i < this.battleField.length; i++) {
      const dist = getDistance(
        newX,
        newY,
        this.battleField[i].x,
        this.battleField[i].y
      );
      if (dist <= 16) possible = false;
    }

    if (possible) {
      this.PLAYER_LIST[id].x = newX;
      this.PLAYER_LIST[id].y = newY;
    }
  }

  givePlayerAmmo(supply, id) {
    this.PLAYER_LIST[id].ammo += supply;
    if (this.PLAYER_LIST[id].ammo > 25) this.PLAYER_LIST[id].ammo = 25;
  }

  givePlayerHP(supply, id) {
    this.PLAYER_LIST[id].hp += supply;
    if (this.PLAYER_LIST[id].hp > 100) this.PLAYER_LIST[id].hp = 100;
  }

  setShot(x, y, player, id) {
    if (this.PLAYER_LIST[id].ammo === 0) return;
    this.PLAYER_LIST[id].ammo -= 1;
    const angle = Math.atan2(x - player.x, y - player.y);
    const xSpeed = Math.sin(angle);
    const ySpeed = Math.cos(angle);

    this.bullets.push({
      xSpeed,
      ySpeed,
      x: player.x,
      y: player.y,
      team: player.team,
      id
    });
  }

  processBullets() {
    let newBullets = [];
    for (let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      bullet.x += bullet.xSpeed * 5;
      bullet.y += bullet.ySpeed * 5;

      let clear = true;

      if (
        bullet.x >= 790 ||
        bullet.x <= 10 ||
        bullet.y >= 790 ||
        bullet.y <= 10
      ) {
        clear = false;
      }

      for (let j = 0; j < this.battleField.length; j++) {
        const dist = getDistance(
          bullet.x,
          bullet.y,
          this.battleField[j].x,
          this.battleField[j].y
        );
        if (dist <= 7) clear = false;
      }

      for (var pi in this.PLAYER_LIST) {
        const player = this.PLAYER_LIST[pi];
        if (player.team === bullet.team) continue;

        const dist = getDistance(bullet.x, bullet.y, player.x, player.y);

        if (dist <= 12) {
          clear = false;
          this.processHit(pi, bullet.id);
          break;
        }
      }

      if (clear) newBullets.push(bullet);
    }
    this.bullets = newBullets;
  }

  processHit(pi, id) {
    this.PLAYER_LIST[pi].hp -= 10;
    this.PLAYER_LIST[pi].points -= 1;
    this.PLAYER_LIST[id].points += 2;

    if (this.PLAYER_LIST[pi].hp <= 0) {
      this.PLAYER_LIST[pi].hp = 100;
      this.PLAYER_LIST[pi].ammo = 10;
      this.PLAYER_LIST[pi].points -= 20;
      this.PLAYER_LIST[pi].x = 400;
      this.PLAYER_LIST[pi].y = this.PLAYER_LIST[pi].team === 1 ? 100 : 700;
    }
  }

  setAmmo() {
    let arr = [];
    for (let i = 0; i < 6; i++) {
      const oneAmmo = {
        id: i,
        x: Math.floor(Math.random() * 706) + 20,
        y: Math.floor(Math.random() * 760) + 20,
        supply: 10,
        size: 15
      };

      arr.push(oneAmmo);
    }
    return arr;
  }

  processAmmo(player, id) {
    for (let i = 0; i < this.ammo.length; i++) {
      let ammo = this.ammo[i];

      const dist = getDistance(
        player.x,
        player.y,
        ammo.x + ammo.size / 2,
        ammo.y + ammo.size / 2
      );

      if (dist <= 16) {
        this.givePlayerAmmo(ammo.supply, id);
        ammo.x = Math.floor(Math.random() * 760) + 20;
        ammo.y = Math.floor(Math.random() * 760) + 20;
      }

      this.ammo[i] = ammo;
    }
  }

  setHP() {
    let arr = [];
    for (let i = 0; i < 6; i++) {
      const oneHP = {
        id: i,
        x: Math.floor(Math.random() * 760) + 20,
        y: Math.floor(Math.random() * 760) + 20,
        supply: 20,
        size: 15
      };

      arr.push(oneHP);
    }
    return arr;
  }

  processHP(player, id) {
    for (let i = 0; i < this.hp.length; i++) {
      let hp = this.hp[i];

      const dist = getDistance(
        player.x,
        player.y,
        hp.x + hp.size / 2,
        hp.y + hp.size / 2
      );

      if (dist <= 16) {
        this.givePlayerHP(hp.supply, id);
        hp.x = Math.floor(Math.random() * 760) + 20;
        hp.y = Math.floor(Math.random() * 760) + 20;
      }

      this.hp[i] = hp;
    }
  }
}

module.exports = Game;
