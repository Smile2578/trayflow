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
    throw new Error("Google Cloud Storage is not initialized.");
  }
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

export async function generateV4UploadSignedUrl(filename, contentType) {
  const [url] = await bucket.file(filename).getSignedUrl({
    version: 'v4',
    action: 'write',
    contentType: contentType,
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return url;
}
