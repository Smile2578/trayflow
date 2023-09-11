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
    if (bucket) {
        console.log("GCS already initialized.");
        return;
    }

    if (!process.env.GOOGLE_PROJECTID) {
        const error = "Environment variable GOOGLE_PROJECTID is not set.";
        console.error(error);
        throw new Error(error);
    }

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
      const errMsg = "Bucket is not initialized.";
      console.error(errMsg);
      throw new Error(errMsg);
  }
  console.log("Retrieved GCS bucket:", BUCKET_NAME);
  return bucket;
}

export async function generateV4ReadSignedUrl(filename) {
  try {
      if (!bucket) {
          throw new Error("Bucket is not initialized");
      }

      const [url] = await bucket.file(filename).getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      return url;
  } catch (error) {
      console.error("Failed to generate V4 Read Signed URL:", error.message);
      throw error;
  }
}
export async function generateV4UploadSignedUrl(filename) {
  try {
      if (!bucket) {
          throw new Error("Bucket is not initialized");
      }

      const [url] = await bucket.file(filename).getSignedUrl({
          version: 'v4',
          action: 'write',
          contentType: 'application/octet-stream',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      console.log('Generated signed URL:', url);
      return url;
  } catch (error) {
      console.error("Failed to generate V4 Upload Signed URL:", error.message);
      throw error;
  }
}