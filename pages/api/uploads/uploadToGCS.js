import { Storage } from '@google-cloud/storage';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Initialize Google Cloud Storage
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
      projectId: process.env.GOOGLE_PROJECTID,
    });

    const bucketName = process.env.BUCKET_NAME;
    const bucket = storage.bucket(bucketName);

    const blob = bucket.file(req.body.filename);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      res.status(500).send(err);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ fileID: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
