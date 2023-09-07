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

    const googleCloudConfig = JSON.parse(GOOGLE_CLOUD_KEYFILE);

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

export async function generateSignedUrl(filename) {
  try {
    const [url] = await bucket.file(filename).createResumableUpload();
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}
