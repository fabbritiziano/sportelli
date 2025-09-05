// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({limit: '1mb'}));
app.use(express.static(path.join(__dirname, 'public')));

const defaultConfig = {
  adUrl: "https://www.example.com",
  audioLang: "it-IT",
  autoCallNext: false,
  adminPassword: "tiziano",
  offices: [
    { id: "anagrafe", name: "Anagrafe", prefix: "A" },
    { id: "carta", name: "Carte d'Identità", prefix: "C" },
    { id: "tributi", name: "Tributi", prefix: "T" }
  ]
};

let state = {
  config: defaultConfig,
  queues: {} // officeId: { nextNumber, waiting:[], current:null, served:[], skipped:[] }
};

function loadState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const obj = JSON.parse(raw);
    state = obj;
    ensureQueues();
  } catch (e) {
    // initialize
    ensureQueues();
    saveState();
  }
}

function ensureQueues() {
  if (!state.queues) state.queues = {};
  state.config.offices.forEach(o => {
    if (!state.queues[o.id]) {
      state.queues[o.id] = { nextNumber: 1, waiting: [], current: null, served: [], skipped: [] };
    }
  });
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error("Errore salvataggio stato:", e);
  }
}

loadState();

// Socket.IO
io.on('connection', (socket) => {
  // Send initial state
  socket.emit('init', state);

  // Request config/state
  socket.on('config:get', () => {
    socket.emit('config', state.config);
  });
  socket.on('state:get', () => {
    socket.emit('state', state);
  });

  // Admin updates config
  socket.on('config:update', (newConfig) => {
    try {
      // basic validation
      if (!newConfig || !Array.isArray(newConfig.offices)) return;
      state.config = {
        adUrl: newConfig.adUrl || state.config.adUrl,
        audioLang: newConfig.audioLang || state.config.audioLang || 'it-IT',
        autoCallNext: !!newConfig.autoCallNext,
        adminPassword: state.config.adminPassword, // Mantiene la password esistente
        offices: newConfig.offices.map(o => ({
          id: (o.id || o.name || '').toLowerCase().replace(/\s+/g,'_').replace(/[^\w\-]/g,''),
          name: o.name || 'Ufficio',
          prefix: (o.prefix || '').toUpperCase().slice(0,2) || 'U'
        }))
      };
      ensureQueues();
      saveState();
      io.emit('config', state.config);
      io.emit('state', state);
    } catch (e) {
      console.error(e);
    }
  });

  // Admin resets
  socket.on('queues:reset', () => {
    Object.keys(state.queues).forEach(k => {
      state.queues[k] = { nextNumber: 1, waiting: [], current: null, served: [], skipped: [] };
    });
    saveState();
    io.emit('state', state);
  });

  // Totem: new ticket
  socket.on('ticket:new', ({ officeId }) => {
    const q = state.queues[officeId];
    const office = state.config.offices.find(o=>o.id===officeId);
    if (!q || !office) return;
    const number = q.nextNumber++;
    const id = `${office.prefix}${String(number).padStart(3,'0')}`;
    q.waiting.push({ id, ts: Date.now() });
    saveState();
    io.emit('state', state);
    socket.emit('ticket:issued', { officeId, ticketId: id, position: q.waiting.length });
  });

  // Office actions
  socket.on('office:next', ({ officeId }) => {
    const q = state.queues[officeId];
    if (!q) return;
    if (q.current) {
      // move current to served by default
      q.served.push(q.current);
      q.current = null;
    }
    const next = q.waiting.shift() || null;
    q.current = next;
    saveState();
    io.emit('state', state);
    if (next) io.emit('announce', { officeId, ticketId: next.id });
    // autocall chain if enabled and no waiting? not necessary
  });

  socket.on('office:recall', ({ officeId }) => {
    const q = state.queues[officeId];
    if (!q || !q.current) return;
    io.emit('announce', { officeId, ticketId: q.current.id });
  });

  socket.on('office:skip', ({ officeId }) => {
    const q = state.queues[officeId];
    if (!q || !q.current) return;
    q.skipped.push(q.current);
    q.current = null;
    saveState();
    io.emit('state', state);
  });

  socket.on('disconnect', () => {});
});

server.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
