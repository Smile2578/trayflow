import { initGoogleCloudStorage, getGCSBucket, generateV4UploadSignedUrl } from '../../../utils/gcs';


initGoogleCloudStorage();


export default async function handler(request, response) {
    try {
        const { fileName } = request.body;

        if (request.method === 'POST') {
            console.log("Received fileName for POST:", fileName);
            
            if (!fileName) {
                return response.status(400).json({ error: 'Invalid input' });
            }

            try {
                const signedUrl = await generateV4UploadSignedUrl(fileName);
                return response.status(200).json({ signedUrl });
            } catch (err) {
                console.error("Error generating signed URL for", fileName, ":", err.message);
                return response.status(500).json({ error: 'Error generating signed URL', detailedError: err.message });
            }
        } 

        else if (request.method === 'PUT') {
            let bucket;
            try {
                bucket = getGCSBucket();
            } catch (error) {
                console.error("Error fetching GCS bucket:", error.message);
                return response.status(500).json({ error: 'GCS Bucket Initialization Error', detailedError: error.message });
            }

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
        } 

        else {
            return response.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error("Error in uploadToGCS:", error.message);
        return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    }
}
