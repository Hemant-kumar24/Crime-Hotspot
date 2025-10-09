require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const User = require("../src/models/User");

const run = async () => {
  try {
    console.log("Connecting to", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected");
    const user = await User.create({
      name: "CLI Test",
      email: `cli_test_${Date.now()}@example.com`,
      password: "secret123",
    });
    console.log("Created user:", user._id.toString());
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
