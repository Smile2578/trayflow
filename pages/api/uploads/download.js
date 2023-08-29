import { Storage } from '@google-cloud/storage';
import connectToDatabase from "../../../utils/db";

const { GOOGLE_CLOUD_KEYFILE, BUCKET_NAME } = process.env;

const storage = new Storage({
    keyFilename: GOOGLE_CLOUD_KEYFILE
});

const bucket = storage.bucket(BUCKET_NAME);

export default async function handler(req, res) {
    await connectToDatabase(); // Assuming this still establishes your MongoDB connection

    if (req.method === 'GET') {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ error: 'File key is required.' });
        }

        const file = bucket.file(key);

        file.createReadStream()
            .on('error', (error) => {
                return res.status(500).json({ error: `Download failed: ${error}` });
            })
            .pipe(res);
    } else {
        return res.status(405).json({ error: 'Method not allowed.' });
    }
}
