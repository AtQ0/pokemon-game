
import mongoose, { Mongoose } from 'mongoose';

// Use environment variable if available, otherwise fallback to local MongoDB
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemon_db';

// Define the cache structure for maintaining a single DB connection
interface CachedMongoose {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Reuse the cached connection if it exists, otherwise initialize it
const cached = (global as typeof globalThis & { mongoose?: CachedMongoose }).mongoose ||
    ((global as typeof globalThis & { mongoose: CachedMongoose }).mongoose = { conn: null, promise: null });

// Main function to connect to MongoDB
async function dbConnect(): Promise<Mongoose> {
    // Return existing connection if already established
    if (cached.conn) return cached.conn;

    // If no connection is in progress, start a new one
    if (!cached.promise) {
        const opts = { bufferCommands: false }; // Disable buffering for reliability
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    // Await and store the resolved connection
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
