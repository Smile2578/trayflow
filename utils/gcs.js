import { Storage } from '@google-cloud/storage';

let storage;
let bucket;

const { GOOGLE_CLOUD_KEYFILE, BUCKET_NAME } = process.env;

export async function initGoogleCloudStorage() {
  try {
    console.log("Initializing Google Cloud Storage with bucket:", BUCKET_NAME);

    if (!GOOGLE_CLOUD_KEYFILE) {
      console.error("GOOGLE_CLOUD_KEYFILE is not set.");
      throw new Error("GOOGLE_CLOUD_KEYFILE is missing.");
    }

    let googleCloudConfig;
    try {
      googleCloudConfig = JSON.parse(GOOGLE_CLOUD_KEYFILE);
    } catch (jsonError) {
      console.error("Error parsing GOOGLE_CLOUD_KEYFILE:", GOOGLE_CLOUD_KEYFILE);
      throw jsonError;
    }

    storage = new Storage({
      credentials: googleCloudConfig
    });

    bucket = storage.bucket(BUCKET_NAME);
    console.log("Google Cloud Storage initialized.");
  } catch (error) {
    console.error("Failed to initialize Google Cloud Storage:", error.message);
    throw error;
  }
}

export function getGCSBucket() {
  if (!bucket) {
    throw new Error("Google Cloud Storage is not initialized.");
  }
  return bucket;
}



