const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/artify';
    console.log(`Connecting to database at ${uri}...`);
    
    // Attempt local database connection with a short timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`🔴 Local MongoDB Connection Failed: ${error.message}`);
    console.log('💡 Falling back to In-Memory MongoDB database...');
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`🟢 In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      // Auto seed in-memory DB
      console.log('🌱 Seeding In-Memory Database with default values...');
      const seedHelper = require('../seed-helper');
      await seedHelper();
    } catch (err) {
      console.error(`🔴 Failed to spin up In-Memory MongoDB: ${err.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
