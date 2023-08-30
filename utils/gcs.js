import { Storage } from '@google-cloud/storage';

let storage;
let bucket;

const { GOOGLE_CLOUD_KEYFILE, BUCKET_NAME } = process.env;

export async function initGoogleCloudStorage() {
  try {
    console.log("Initializing Google Cloud Storage.");
    storage = new Storage({
      keyFilename: GOOGLE_CLOUD_KEYFILE
    });
    bucket = storage.bucket(BUCKET_NAME);
    console.log("Google Cloud Storage initialized.");
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
