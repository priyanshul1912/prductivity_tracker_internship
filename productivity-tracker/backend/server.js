require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use((req, _res, next) => { req.io = io; next(); });

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/activities',    require('./routes/activities'));
app.use('/api/sessions',      require('./routes/sessions'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard',     require('./routes/dashboard'));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`[Socket] User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// ─── Cron Jobs ─────────────────────────────────────────────────────────────────
// Every 30 min: check break reminders & burnout alerts
cron.schedule('*/30 * * * *', async () => {
  try {
    const { checkReminders } = require('./services/notificationService');
    await checkReminders(io);
  } catch (e) { console.error('[Cron] checkReminders error:', e.message); }
});

// Every day at 9am: daily digest
cron.schedule('0 9 * * *', async () => {
  try {
    const { sendDailyDigest } = require('./services/notificationService');
    await sendDailyDigest(io);
  } catch (e) { console.error('[Cron] dailyDigest error:', e.message); }
});

// ─── MongoDB + Start ──────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`[Server] Running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });
