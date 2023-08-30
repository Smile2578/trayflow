import multer from 'multer';
import { initGoogleCloudStorage, getGCSBucket } from '../../../utils/gcs';

// Disable global body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 55 * 1024 * 1024 }, // 55 MB
});

export default async function handler(req, res) {
  // Initial log
  console.log("Handler called with method:", req.method);

  await initGoogleCloudStorage();  // Initialize GCS
  const bucket = getGCSBucket();  // Get the initialized bucket

  if (req.method !== 'POST') {
    console.log("Invalid method attempted");
    return res.status(405).json({ error: 'Method not allowed' });
  }

  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!req.file || !req.file.buffer || !req.file.originalname) {
      console.error("File missing in request");
      return res.status(400).json({ error: 'No file attached in the request' });
    }

    try {
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (blobErr) => {
        console.error("Blob stream error:", blobErr);
        res.status(500).json({ error: blobErr.message });
        return;
      });

      blobStream.on('finish', () => {
        console.log("Blob stream finished");
        res.status(200).json({ filename: req.file.originalname });
        return;
      });

      blobStream.end(req.file.buffer);
    } catch (storageErr) {
      console.error("Storage error:", storageErr);
      res.status(500).json({ error: storageErr.message });
      return;
    }
  });
}
