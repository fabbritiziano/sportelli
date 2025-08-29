/**
 * Queue Pianezza Full
 * Avviare: npm install && npm start
 * Server locale con QR code generato lato server usando 'qrcode' (no internet necessario)
 */

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stato in memoria (persistenza semplice su file opzionale)
const TYPES = ['A','B','C'];
let state = {
  counters: { A:0, B:0, C:0 },
  queues: { A:[], B:[], C:[] },
  nowServing: { '1': null, '2': null, '3': null },
  history: []
};

function nextNumberFor(type){
  state.counters[type] = (state.counters[type] || 0) + 1;
  return `${type}${String(state.counters[type]).padStart(3,'0')}`;
}

function broadcast(){
  io.emit('state', state);
}

app.get('/api/state', (req,res) => {
  res.json(state);
});

app.post('/api/ticket', async (req,res) => {
  const { type } = req.body || {};
  if(!TYPES.includes(type)) return res.status(400).json({ error: 'type deve essere A,B,C' });
  const number = nextNumberFor(type);
  const ticket = { number, type, createdAt: Date.now() };
  state.queues[type].push(ticket);
  state.history.push({ action:'create', ticket, ts: Date.now() });
  // genera QR code come data URL (PNG)
  try {
    const qrDataUrl = await QRCode.toDataURL(`${number}`, { errorCorrectionLevel: 'M', margin:1, width:300 });
    ticket.qr = qrDataUrl;
  } catch(e){
    ticket.qr = null;
  }
  broadcast();
  res.json({ ticket });
});

const deskToType = { '1': 'A', '2': 'B', '3': 'C' };

app.post('/api/next', (req,res) => {
  const { desk } = req.body || {};
  if(!['1','2','3'].includes(String(desk))) return res.status(400).json({ error: 'desk deve essere 1,2,3' });
  const type = deskToType[String(desk)];
  const q = state.queues[type];
  const next = q.shift() || null;
  state.nowServing[String(desk)] = next ? next.number : null;
  state.history.push({ action:'next', desk: String(desk), ticket: next, ts: Date.now() });
  broadcast();
  res.json({ nowServing: state.nowServing[String(desk)] });
});

app.post('/api/recall', (req,res) => {
  const { desk } = req.body || {};
  if(!['1','2','3'].includes(String(desk))) return res.status(400).json({ error: 'desk deve essere 1,2,3' });
  const current = state.nowServing[String(desk)];
  io.emit('recall', { desk: String(desk), number: current });
  res.json({ recalled: current });
});

app.post('/api/skip', (req,res) => {
  const { desk } = req.body || {};
  if(!['1','2','3'].includes(String(desk))) return res.status(400).json({ error: 'desk deve essere 1,2,3' });
  const cur = state.nowServing[String(desk)];
  state.history.push({ action:'skip', desk: String(desk), number: cur, ts: Date.now() });
  state.nowServing[String(desk)] = null;
  broadcast();
  res.json({ skipped: cur });
});

app.post('/api/reset', (req,res) => {
  state = { counters: { A:0,B:0,C:0 }, queues: { A:[],B:[],C:[] }, nowServing: { '1':null,'2':null,'3':null }, history: [] };
  broadcast();
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  socket.emit('state', state);
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => { console.log(`Server avviato su http://localhost:${PORT}`); });
