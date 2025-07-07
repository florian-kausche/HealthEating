const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Ensure .env is loaded from backend root

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error("MongoDB connection URI (MONGODB_URI) not found in environment variables. Please set it in your .env file (e.g., MONGODB_URI=mongodb://localhost:27017/health_advisor_gh).");
    // For critical DB connection, exiting might be appropriate in production.
    // In development, you might let it try a default local URI or just warn.
    // For this app, let's make it a critical failure if URI is not set.
    process.exit(1);
  }

  try {
    // Mongoose 6+ default options are generally good (useNewUrlParser, useUnifiedTopology, etc. are deprecated)
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully to:", MONGODB_URI.replace(/\/\/(.*:.*@)?/, '//<credentials>@')); // Log URI without credentials

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB runtime connection error: ${err.message}`);
      // Depending on the error, you might want to implement retry logic or graceful shutdown
    });

    mongoose.connection.on('disconnected', () => {
      console.log("MongoDB disconnected.");
      // You might want to attempt reconnection here for resilient applications
    });

    // Graceful shutdown on SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('SIGINT received. Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination.');
      process.exit(0);
    });

  } catch (error) {
    console.error("Initial MongoDB connection failed:", error.message);
    // Exit process on initial connection failure
    process.exit(1);
  }
};

module.exports = connectDB;
