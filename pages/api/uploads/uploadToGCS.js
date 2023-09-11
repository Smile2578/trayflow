import { getSession } from 'next-auth/react';
import { generateV4UploadSignedUrl } from '../../../utils/gcs';

export default async function handler(request, response) {
    try {
        // 1. Authentication
        const session = await getSession({ req: request });
        if (!session) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        // 2. Authorization (Si on veut rajouter une selection sur le rôle)
        // if (session.user.role !== "allowedRole") {
        //     return response.status(403).json({ error: 'Not authorized' });
        // }

        // 3. Validation
        const { fileName, contentType } = request.body;
        if (!fileName || !contentType) {
            return response.status(400).json({ error: 'Invalid input' });
        }

        if (contentType !== 'model/stl') { // Only allowing STL files
            return response.status(400).json({ error: 'Unsupported file type' });
        }

        // Generate signed URL for uploading
        const signedUrl = await generateV4UploadSignedUrl(fileName, contentType);

        // Return the signed URL for the frontend to use for direct upload
        return response.status(200).json({ signedUrl });

    } catch (error) {
        console.error("Error in uploadToGCS:", error.message);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
