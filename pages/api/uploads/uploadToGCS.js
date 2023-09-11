import { getSession } from 'next-auth/server';
import { getGCSBucket, generateV4UploadSignedUrl } from '../../../utils/gcs';

export default async function handler(request, response) {
    try {
        const session = await getSession({ req: request });
        if (!session) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        const { fileName, contentType } = request.body;

        if (request.method === 'POST') {
            if (!fileName || !contentType) {
                return response.status(400).json({ error: 'Invalid input' });
            }

            if (contentType !== 'model/stl') {
                return response.status(400).json({ error: 'Unsupported file type' });
            }

            const signedUrl = await generateV4UploadSignedUrl(fileName, contentType);
            return response.status(200).json({ signedUrl });

        } else if (request.method === 'PUT') {
            const bucket = getGCSBucket();
            const file = bucket.file(fileName);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: contentType,
                },
                resumable: false,
            });

            request.pipe(stream);

            stream.on('error', (err) => {
                console.error(err);
                return response.status(500).json({ error: 'Error uploading to GCS' });
            });

            stream.on('finish', () => {
                return response.status(200).json({ message: 'Uploaded successfully' });
            });

        } else {
            return response.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error("Error in uploadToGCS:", error.message);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
