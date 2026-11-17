require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // big enough for a base64 photo

// Log every request: "POST /api/items 201 - 840ms"
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`));
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'VJTI Lost & Found API is running' });
});

// Health check: open http://<your-ip>:5000/api/health in the phone browser to test
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({ api: 'ok', database: dbConnected ? 'connected' : 'not connected' });
});

// If the database is down, reply with a clear error instead of hanging
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected yet. Please try again in a moment.' });
  }
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// 0.0.0.0 so phones on the same Wi-Fi can reach the server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Another backend is already running - close it first.`);
    } else {
      console.error('Server failed to start:', err.message);
    }
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => `http://${n.address}:${PORT}/api`);
  if (ips.length) console.log(`Phone can reach the API at: ${ips.join('  or  ')}`);
});

connectDB();
