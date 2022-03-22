import {io} from '/socket.io/socket.io.esm.min.js'

var socket = io();
const player = {
  username: '',
  playerToken: '',
  score: 0
}

const button = document.getElementById("blink-btn");
button.addEventListener('click', function (e) {
  socket.emit('player-click', player);
}, false)

socket.emit('join-game', player);

socket.on('joined-game', (data)=>{
  player.playerToken = data.playerToken
  player.username = data.username
  player.score = 0
  document.getElementById("username").innerHTML = data.username;
  document.getElementById("playerToken").innerHTML = data.playerToken;
})


socket.on('valid-click', (data) => {
  const light = document.getElementById('light-fill');
  if (light.style.fill === 'none') {
    light.style.fill='#6c63ff';
  }else{
    light.style.fill = 'none'
  }
  player.score = data
  document.getElementById("blinksCount").innerHTML = data;
})

socket.on('invalid-player', ()=>{
  document.location.reload();
})

socket.on('winner-found', (data)=>{
  console.log('teste')
  button.disabled = true;
  button.removeEventListener('click', ()=>{});
})

socket.on('you-win', ()=>{
  alert('WIN THE GAME')
})