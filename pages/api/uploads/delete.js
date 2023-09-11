import { initGoogleCloudStorage, getGCSBucket } from '../../../utils/gcs'

const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT)
});
;

export default async function handler(req, res) {
  await initGoogleCloudStorage();  // Initialize GCS
  const bucket = getGCSBucket();  // Get the initialized bucket

  if (req.method === 'DELETE') {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'File key is required.' });
    }

    const file = bucket.file(key);
    file.delete()
      .then(() => {
        res.status(200).json({ message: 'File deleted successfully' });
      })
      .catch((err) => {
        console.error(`Deletion Error: ${err}`);
        res.status(500).json({ error: 'Deletion failed' });
      });
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
