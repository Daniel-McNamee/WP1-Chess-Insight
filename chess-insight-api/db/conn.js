import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// MongoDB connection URI and client setup
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri);

// Database instance variable
let db;

// Connect to MongoDB Atlas and return the database instance
export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("chess_insight");
    console.log("Connected to MongoDB Atlas");
  }
  return db;
}