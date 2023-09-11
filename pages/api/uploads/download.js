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

    // Generate a signed URL for downloading the file
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,  // URL valid for 15 minutes
    });

    // Return the signed URL
    res.status(200).json({ url: signedUrl });
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
