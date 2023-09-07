import multer from 'multer';
import { initGoogleCloudStorage, getGCSBucket, generateSignedUrl } from '../../../utils/gcs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default async function handler(req, res) {
  await initGoogleCloudStorage();

  if (req.method === 'GET') {
    const filename = req.query.filename;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required to generate a signed URL.' });
    }
    try {
      const signedUrl = await generateSignedUrl(filename);
      return res.status(200).json({ url: signedUrl });
    } catch (error) {
    console.error("Error in GET method:", error.message);
    console.error(error.stack);  // Log the stack trace
    return res.status(500).json({ error: 'Failed to generate signed URL.' });
  }
  }

  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file || !req.file.buffer || !req.file.originalname) {
      return res.status(400).json({ error: 'No file attached in the request' });
    }

    try {
      const blob = getGCSBucket().file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (blobErr) => {
        res.status(500).json({ error: blobErr.message });
      });

      blobStream.on('finish', () => {
        res.status(200).json({ filename: req.file.originalname });
      });

      blobStream.end(req.file.buffer);
    } catch (storageErr) {
      res.status(500).json({ error: storageErr.message });
    }
  });
}
