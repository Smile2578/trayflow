import { getGCSBucket, generateV4UploadSignedUrl } from '../../../utils/gcs';

export default async function handler(request, response) {
    try {
        const { fileName } = request.body;

        if (request.method === 'POST') {
            console.log("Received fileName for POST:", fileName);
            
            if (!fileName) {
                console.error("Error: fileName is not provided in the request body.");
                return response.status(400).json({ error: 'Invalid input: fileName is required' });
            }

            const signedUrl = await generateV4UploadSignedUrl(fileName);
            console.log("Generated signed URL for POST:", signedUrl);
            return response.status(200).json({ signedUrl });

        } else if (request.method === 'PUT') {
            // This part is not necessary since the frontend is uploading directly to GCS using the signed URL.
            // However, to ensure that any unwanted PUT requests are handled, let's add a simple message.
            console.error("Error: Direct file upload attempted to backend instead of using the signed URL.");
            return response.status(405).json({ error: 'Direct file upload should use the signed URL. This method is not supported.' });

        } else {
            console.error(`Error: Unsupported HTTP method ${request.method} used.`);
            return response.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error("Error in uploadToGCS:", error.message);
        return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    }
}
