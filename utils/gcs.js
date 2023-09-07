import { Storage } from '@google-cloud/storage';

let storage;
let bucket;

const { GOOGLE_CLOUD_KEYFILE, BUCKET_NAME } = process.env;

export async function initGoogleCloudStorage() {
  try {
    console.log("Initializing Google Cloud Storage.");

    const googleCloudConfig = JSON.parse(process.env.GOOGLE_CLOUD_KEYFILE);

    storage = new Storage({
      credentials: googleCloudConfig
    });

    bucket = storage.bucket(process.env.BUCKET_NAME);
    console.log("Google Cloud Storage initialized.");
    console.log("Connected to GCS Bucket:", bucket.name);
  } catch (error) {
    console.error("Failed to initialize Google Cloud Storage:", error);
    throw error;
  }
}


export function getGCSBucket() {
  if (!bucket) {
    throw new Error("Google Cloud Storage is not initialized.");
  }
  return bucket;
}

export async function generateSignedUrl(filename) {
  try {
    console.log("Generating signed URL for:", filename);
    console.log("Using bucket:", bucket.name);  // Log the bucket name

    const [url] = await bucket.file(filename).createResumableUpload();
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error.message);
    console.error(error.stack);  // Log the stack trace
    throw error;
  }
}
