import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
let storage;
let bucket;

async function getSecret() {
    const [version] = await client.accessSecretVersion({
        name: 'projects/197018611744/secrets/trayflow_service_account/versions/latest',
    });

    const secretData = version.payload.data.toString('utf8');
    return JSON.parse(secretData);
}

export async function initGoogleCloudStorage() {
    try {
        console.log("Initializing Google Cloud Storage with bucket:", BUCKET_NAME);

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
