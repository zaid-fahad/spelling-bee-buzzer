import express from "express";
import { WebSocketServer } from "ws";
import { SerialPort } from "serialport";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9393;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () =>
  console.log(`🌐 Web server running at http://localhost:${PORT}`)
);

const wss = new WebSocketServer({ port: PORT + 1 });
console.log(`🔌 WebSocket running at ws://localhost:${PORT + 1}`);

// ----------------- Serial Port -----------------
const port = new SerialPort({ path: "/dev/ttyACM0", baudRate: 9600 });

port.on("open", () => console.log("✅ SerialPort Connected"));
port.on("error", (err) => console.error("❌ SerialPort Error:", err.message));

let queue = []; // {player:1,time:"ISO"}
let roundNumber = 1;
let roundWinners = [];

// Broadcast helper
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((c) => {
    if (c.readyState === c.OPEN)
      try {
        c.send(msg);
      } catch {}
  });
}

function updateQueue() {
  broadcast({ type: "queue", queue });
}
function updateRoundWinners() {
  broadcast({
    type: "round-winners",
    winners: roundWinners,
    round: roundNumber,
  });
}

// ----------------- Serial Data -----------------
let buf = "";
port.on("data", (data) => {
  buf += data.toString();
  const lines = buf.split("\n");
  buf = lines.pop();

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith("BTN:")) {
      const [p, ms] = line.substring(4).split(",").map(Number);
      if (!queue.find((q) => q.player === p)) {
        queue.push({ player: p, time: new Date(Number(ms)).toISOString() });
        updateQueue();
      }
    } else if (line === "RESET") queue = [];
  });
});

// ----------------- WebSocket -----------------
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "queue", queue }));
  ws.send(
    JSON.stringify({
      type: "round-winners",
      winners: roundWinners,
      round: roundNumber,
    })
  );

  ws.on("message", (msg) => {
    try {
      msg = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (msg.type === "RESET") {
      queue = [];
      port.write("RESET\n");
      updateQueue();
    }
    else if (msg.type === "NEXT") {
      queue.shift();
      port.write("NEXT\n");
      updateQueue();
    }
    else if(msg.type==="DECLARE_WINNER" && queue.length>0 && !queue[0].winnerDeclared){
  const winnerObj = queue[0];
  winnerObj.winnerDeclared = true; // mark first player as declared
  roundWinners.push({ round: roundNumber, winner: winnerObj.player, time: winnerObj.time });
  updateRoundWinners();
  console.log(`🏆 Winner declared: P${winnerObj.player} for round ${roundNumber}`);
}

    else if (msg.type === "NEW_ROUND") {
      queue = [];
      roundNumber++;
      updateQueue();
      updateRoundWinners();
      port.write("RESET\n");
    }
    else if (msg.type === "RESET_ROUNDS") {
      queue = [];
      roundNumber = 1;
      roundWinners = [];
      updateQueue();
      updateRoundWinners();
      port.write("RESET\n");
    }
  });
});
