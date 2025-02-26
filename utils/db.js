import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bros-mayfair';
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get a database collection
 * @param {string} collectionName - The name of the collection
 * @returns {Promise<Collection>} - The MongoDB collection
 */
export async function getCollection(collectionName) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection(collectionName);
}

/**
 * Insert a document into a collection
 * @param {string} collectionName - The name of the collection
 * @param {Object} document - The document to insert
 * @returns {Promise<InsertOneResult>} - The result of the insert operation
 */
export async function insertDocument(collectionName, document) {
  const collection = await getCollection(collectionName);
  return collection.insertOne({
    ...document,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

/**
 * Find documents in a collection
 * @param {string} collectionName - The name of the collection
 * @param {Object} query - The query to filter documents
 * @param {Object} options - Additional options like sort, limit, etc.
 * @returns {Promise<Array>} - The found documents
 */
export async function findDocuments(collectionName, query = {}, options = {}) {
  const collection = await getCollection(collectionName);
  return collection.find(query, options).toArray();
}

/**
 * Find a single document in a collection
 * @param {string} collectionName - The name of the collection
 * @param {Object} query - The query to filter documents
 * @returns {Promise<Object>} - The found document
 */
export async function findDocument(collectionName, query) {
  const collection = await getCollection(collectionName);
  return collection.findOne(query);
}

/**
 * Update a document in a collection
 * @param {string} collectionName - The name of the collection
 * @param {Object} query - The query to filter documents
 * @param {Object} update - The update to apply
 * @returns {Promise<UpdateResult>} - The result of the update operation
 */
export async function updateDocument(collectionName, query, update) {
  const collection = await getCollection(collectionName);
  return collection.updateOne(query, {
    $set: {
      ...update,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete a document from a collection
 * @param {string} collectionName - The name of the collection
 * @param {Object} query - The query to filter documents
 * @returns {Promise<DeleteResult>} - The result of the delete operation
 */
export async function deleteDocument(collectionName, query) {
  const collection = await getCollection(collectionName);
  return collection.deleteOne(query);
}

/**
 * Count documents in a collection
 * @param {string} collectionName - The name of the collection
 * @param {Object} query - The query to filter documents
 * @returns {Promise<number>} - The count of documents
 */
export async function countDocuments(collectionName, query = {}) {
  const collection = await getCollection(collectionName);
  return collection.countDocuments(query);
} 