import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;
let bucket;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null, bucket: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        console.log("Using cached connection.");
        return { connection: cached.conn, bucket: cached.bucket };
    }

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongooseInstance => {
            console.log("Database connection established.");
            return mongooseInstance.connections[0];
        });
    }

    cached.conn = await cached.promise;

    if (!cached.conn) {
        throw new Error("Failed to connect to database");
    }

    // Initialize the GridFS bucket here after the connection is established
    if (!cached.bucket) {
        console.log("Initializing GridFS bucket.");
        cached.bucket = new GridFSBucket(cached.conn.db, {
            bucketName: 'files'
        });
        console.log("GridFS bucket initialized.");
    }

    return { connection: cached.conn, bucket: cached.bucket };
}

export default connectToDatabase;
