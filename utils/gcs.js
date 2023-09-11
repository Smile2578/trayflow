import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const { BUCKET_NAME, GCP_SERVICE_ACCOUNT } = process.env;
const gcpCredentials = JSON.parse(GCP_SERVICE_ACCOUNT);
const client = new SecretManagerServiceClient({
    credentials: gcpCredentials
});
let storage;
let bucket;

async function getSecret(secretName) {
  try {
    const [version] = await client.accessSecretVersion({ name: secretName });
    const secretData = version.payload.data.toString('utf8');
    return JSON.parse(secretData);
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error.message);
    throw error;
  }
}

export async function initGoogleCloudStorage() {
  try {
    console.log("Initializing Google Cloud Storage with bucket:", BUCKET_NAME);

    const secretName = `projects/${process.env.GOOGLE_PROJECTID}/secrets/trayflow_service_account/versions/latest`;
    const googleCloudConfig = await getSecret(secretName);

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
    console.error("Bucket is not initialized.");
    throw new Error("Google Cloud Storage is not initialized.");
  }
  console.log("Retrieved GCS bucket:", BUCKET_NAME);
  return bucket;
}



export async function generateV4ReadSignedUrl(filename) {
  const [url] = await bucket.file(filename).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return url;
}

export async function generateV4UploadSignedUrl(filename) {
  const [url] = await bucket.file(filename).getSignedUrl({
    version: 'v4',
    action: 'write',
    contentType: 'application/octet-stream',  // This will allow any file type. Modify if needed.
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return url;
}
