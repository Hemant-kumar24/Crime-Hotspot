const mongoose = require("mongoose");

/**
 * Establish a connection to MongoDB using the provided connection string.
 * The promise resolves once the connection is open so server boot can continue.
 */

const connectDB = async (mongoUri) => {
  const connectionString = mongoUri || process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MongoDB connection string is missing");
  }

  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
