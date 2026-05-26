require('dotenv').config();
const dns = require('dns');
// Fix querySrv ECONNREFUSED issues in Node.js v18+ by resolving IPv4 first
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors()); // Allow all origins
app.use(express.json());

// Routes
const taskRoutes = require('./routes/tasks');
app.use('/bfhl/tasks', taskRoutes);

// Base route for checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TaskFlow backend service is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// MongoDB Connection and Server Start
if (!MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI env variable is missing!');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
