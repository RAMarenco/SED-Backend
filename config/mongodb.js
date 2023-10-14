const { MongoClient } = require('mongodb');
const debug = require('debug')('app:mongodb');

const url = process.env.CHAIN || 'mongodb://localhost:27017/'; // Replace with your MongoDB connection string
const dbName = process.env.DB || 'testdb'; // Replace with your database name

let db;

async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(url);
    db = client.db(dbName);    
    debug('Connected to MongoDB');    
  } catch (err) {
    debug('Error connecting to MongoDB:', err);
  }
}

function getDb() {
  if (db) {
    return db;
  } else {
    throw new Error('Database is not connected yet.');
  }
}

module.exports = {
  connectToMongoDB,
  getDb,
};
