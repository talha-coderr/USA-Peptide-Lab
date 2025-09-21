const config = require("./config");
// console.log("MongoDB")
const mongoose =  require('mongoose');

function getDatabaseUrl() {
  const { driver, username, password, host, dbName, options } = config.db_config;

  const query = new URLSearchParams(options).toString();
  return `${driver}://${username}:${password}@${host}/${dbName}?${query}`;
}


const uri = getDatabaseUrl();

let isConnected = false;
let idleTimer = null;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('Reusing existing MongoDB connection.');
    return mongoose.connection;
  }
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('MongoDB Connected:', uri);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    throw err;
  }
  return mongoose.connection;
};

// Function to start an idle timer and disconnect the database after inactivity
const startIdleTimer = () => {
  clearIdleTimer(); // Only clear the timer, don't disconnect.
  idleTimer = setTimeout(() => {
    console.log('Idle timeout reached. Timer restarted, but connection stays open.');
  }, 60000); // Log activity instead of disconnecting.
};


// Clear idle timer function
const clearIdleTimer = () => {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
};

// Export connect function and a function to manually close connection if needed
const disconnectFromDatabase = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB Disconnected');
  }
};
connectToDatabase()
module.exports = { connectToDatabase, disconnectFromDatabase, startIdleTimer };

