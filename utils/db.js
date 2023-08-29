import mongoose from 'mongoose';
import { Storage } from '@google-cloud/storage';

const { MONGODB_URI, GOOGLE_CLOUD_KEYFILE, BUCKET_NAME } = process.env;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;
let storage;
let bucket;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null, storage: null, bucket: null };
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
            return mongooseInstance.connections[0];
        });
    }

    cached.conn = await cached.promise;

    if (!cached.conn) {
        throw new Error("Failed to connect to database");
    }

    if (!cached.storage) {
        console.log("Initializing Google Cloud Storage.");
        cached.storage = new Storage({
            keyFilename: GOOGLE_CLOUD_KEYFILE
        });
        cached.bucket = cached.storage.bucket(BUCKET_NAME);
        console.log("Google Cloud Storage initialized.");
    }

    return { connection: cached.conn, bucket: cached.bucket };
}

export default connectToDatabase;
