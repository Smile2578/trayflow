import { initGoogleCloudStorage, generateV4UploadSignedUrl, getGCSBucket } from '../../../utils/gcs';

export default async function handler(request, response) {
    try {
        // Ensure GCS is initialized
        await initGoogleCloudStorage();

        const { fileName } = request.body;

        if (!fileName) {
            return response.status(400).json({ error: 'Invalid input' });
        }

        switch (request.method) {
            case 'POST':
                try {
                    const signedUrl = await generateV4UploadSignedUrl(fileName);
                    return response.status(200).json({ signedUrl });
                } catch (err) {
                    console.error("Error generating signed URL for", fileName, ":", err.message);
                    return response.status(500).json({ error: 'Error generating signed URL', detailedError: err.message });
                }
            case 'PUT':
                const bucket = getGCSBucket();
                const file = bucket.file(fileName);
                const stream = file.createWriteStream({
                    resumable: false,
                });

                request.pipe(stream);

                stream.on('error', (err) => {
                    console.error("Error during stream:", err);
                    return response.status(500).json({ error: 'Error uploading to GCS', detailedError: err.message });
                });

                stream.on('finish', () => {
                    return response.status(200).json({ message: 'Uploaded successfully' });
                });
                break;
            default:
                return response.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error("Error in uploadToGCS:", error.message);
        return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    }
}
