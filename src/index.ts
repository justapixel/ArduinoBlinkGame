import express from "express";
import http from 'http';
import gameLogic from "./gameLogic";
import dotenv from "dotenv"

dotenv.config()
const app = express();
const PORT = process.env.APP_PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, ()=> {
  console.log(`listening on *:${PORT}`);
})

gameLogic(server);