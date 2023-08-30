import { initGoogleCloudStorage, getGCSBucket } from '../../../utils/gcs';

export default async function handler(req, res) {
  await initGoogleCloudStorage();  // Initialize GCS
  const bucket = getGCSBucket();  // Get the initialized bucket

  if (req.method === 'GET') {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'File key is required.' });
    }

    const file = bucket.file(key);

    file.createReadStream()
      .on('error', (error) => {
        console.error(`Download Error: ${error}`);
        return res.status(500).json({ error: 'Download failed' });
      })
      .pipe(res);
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
