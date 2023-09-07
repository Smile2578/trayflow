import { Storage } from '@google-cloud/storage';

let storage;
let bucket;

const { GOOGLE_CLOUD_KEYFILE, BUCKET_NAME } = process.env;

export async function initGoogleCloudStorage() {
  storage = new Storage({
    keyFilename: GOOGLE_CLOUD_KEYFILE
  });
  bucket = storage.bucket(BUCKET_NAME);
}

export function getGCSBucket() {
  if (!bucket) {
    throw new Error("Google Cloud Storage is not initialized.");
  }
  return bucket;
}

export async function generateSignedUrl(filename) {
  const [url] = await bucket.file(filename).createResumableUpload();
  return url;
}
