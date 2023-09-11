import { getSession } from 'next-auth/react';
import { generateV4UploadSignedUrl } from '../../../utils/gcs';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).end();  // Only allow POST method
    }

    try {
        // 1. Authentication
        const session = await getSession({ req: request });
        if (!session) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        // 2. Authorization (If you want to add role-based checks later)
        // if (session.user.role !== "allowedRole") {
        //     return response.status(403).json({ error: 'Not authorized' });
        // }

        // 3. Validation
        const { fileName, contentType } = request.body;

        if (!fileName) {
            return response.status(400).json({ error: 'File name is required.' });
        }

        if (!contentType) {
            return response.status(400).json({ error: 'Content type is required.' });
        }

        if (contentType !== 'model/stl') { // Only allowing STL files
            return response.status(400).json({ error: 'Unsupported file type. Only .stl files are allowed.' });
        }

        // Generate signed URL for uploading
        const signedUrl = await generateV4UploadSignedUrl(fileName, contentType);

        // Return the signed URL for the frontend to use for direct upload
        return response.status(200).json({ signedUrl });

    } catch (error) {
        console.error("Error in uploadToGCS:", error);
        return response.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
}
