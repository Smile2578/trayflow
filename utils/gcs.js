import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
let storage;
let bucket;

// Use the provided environment variable names
const { GCP_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS, BUCKET_NAME } = process.env;

async function getSecret() {
  // Use GCP_SERVICE_ACCOUNT for accessing the secret
  const [version] = await client.accessSecretVersion({
      name: GCP_SERVICE_ACCOUNT,
  });

  const secretData = version.payload.data.toString('utf8');
  return JSON.parse(secretData);
}

export async function initGoogleCloudStorage() {
  try {
      console.log("Initializing Google Cloud Storage with bucket:", BUCKET_NAME);

      // Use GOOGLE_APPLICATION_CREDENTIALS to get the secret
      const googleCloudConfig = await getSecret();

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
