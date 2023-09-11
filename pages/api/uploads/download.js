import { initGoogleCloudStorage, getGCSBucket } from '../../../utils/gcs';

export default async function handler(req, res) {
  await initGoogleCloudStorage();
  const bucket = getGCSBucket();

  if (req.method === 'GET') {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: 'File key is required.' });
    }

    const file = bucket.file(key);
    file.createReadStream()
      .on('error', () => {
        return res.status(404).json({ error: 'File not found' });
      })
      .on('response', (response) => {
        // Set the Content-Type based on the file extension
        const contentType = key.endsWith('.stl') ? 'application/netfabb' : 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
      })
      .pipe(res);
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
