import { Server, Socket } from "socket.io";
import {Server as HttpServer} from 'http';
import { v4 as uuidv4 } from 'uuid';

interface game {
  players: {
    [tokenId: string] : {
      username: string,
      score: number,
      socketId: string
    }
  };
  status: 'ready' | 'done' | 'waiting';
}

export default (server: HttpServer) => {
  const game = <game>{players: {}, status: 'waiting'}
  const io = new Server(server)

  io.on('connection', (socket) => {
    socket.on('join-game', (data)=>{
      const username = randomUsername();
      const playerToken = uuidv4();
      game.players[playerToken] = {username, score: 0, socketId: socket.id}
      socket.emit('joined-game', {playerToken, username, gameStatus: game.status})
    })
    socket.on('player-click', (data)=>{
      const player = game.players[data.playerToken]
      if(game.status === 'done'){
        return;
      }
      if (!player) {
        socket.emit('invalid-player');
        return; 
      }
      player.score += 1
      socket.emit('valid-click', player.score);
      winnerEmit();
    })
  });

  async function winnerEmit() {
    var players = Object.keys(game.players)
    var player = players.find(key => game.players[key].score >= 20);
    if (player) {
      io.emit('winner-found', 'O jogo acabou');
      io.to(game.players[player].socketId).emit('you-win');
      game.status = 'done'
    }
  }

  function randomUsername(): string {
    const a = ["UNO", "MEGA", "NANO", "MICRO", "MINI", "YUN", "TIAN", "101", "ZERO", "DUEMILANOVE", "DIECIMILA", "EXTREMEV2", "EXTREME", "NG240", "LEONARDO"];
    const b = ["VERMELHO", "LARANJA", "AMARELO", "VERDE", "AZUL", "INDIGO", "VIOLETA", "ROXO", "ROSA", "DOURADO", "CINZA", "CASTANHO", "BRONZE", "PRATA", "OURO"]
    const c = ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"]
    const rA = Math.floor(Math.random()*a.length);
    const rB = Math.floor(Math.random()*b.length);
    const rC = Math.floor(Math.random()*c.length);
    const username = "ARDUINO_" + a[rA] + '_' + b[rB] + c[rC];
    return username
  }
}
