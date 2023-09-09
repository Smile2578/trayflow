import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const gcpCredentials = JSON.parse(GCP_SERVICE_ACCOUNT);
const client = new SecretManagerServiceClient({
    credentials: gcpCredentials
});

let storage;
let bucket;

// Use the correct environment variable name
const { BUCKET_NAME } = process.env;

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
    throw new Error("Google Cloud Storage is not initialized.");
  }
  return bucket;
}
