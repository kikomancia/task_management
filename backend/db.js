const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI is required in .env');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: '1'
  }
});

let db = null;
let connectionError = null;

async function connectDatabase() {
  try {
    await client.connect();
    db = client.db(process.env.MONGO_DB_NAME || 'nexus-task-management');
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    connectionError = error;
    console.error('MongoDB connection failed:', error.message);
    return null;
  }
}

function getTasksCollection() {
  if (!db) {
    throw new Error('Database connection failed: ' + (connectionError?.message || 'Unknown error'));
  }
  return db.collection('tasks');
}

module.exports = {
  connectDatabase,
  getTasksCollection
};
