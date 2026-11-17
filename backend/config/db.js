const mongoose = require('mongoose');

// Connect to MongoDB and keep retrying instead of crashing the server
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('-> Check MONGO_URI in .env and Atlas Network Access (allow 0.0.0.0/0). Retrying in 5s...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
