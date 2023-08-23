import connectToDatabase from "../../../utils/db";

export default async function handler(req, res) {
    const { connection, bucket } = await connectToDatabase();

    if (!connection) {
        console.error("Database connection not established.");
        return res.status(500).json({ error: "Database connection failed." });
    }

    if (!bucket) {
        console.error("GridFS bucket not initialized.");
        return res.status(500).json({ error: "GridFS initialization failed." });
    }

    console.log("Database connected and GridFS bucket initialized.");

    // Handle OPTIONS method (pre-flight request).
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Handle POST request for file upload
    if (req.method === 'POST') {
        const filename = `file-${Date.now()}`;
        console.log(`Uploading file with name: ${filename}`);

        const uploadStream = bucket.openUploadStream(filename);
        const id = uploadStream.id;

        req.pipe(uploadStream)
            .on('error', (error) => {
                console.error("Error uploading file to GridFS:", error);
                return res.status(500).json({ error: `Failed to upload file. Reason: ${error.message}` });
            })
            .on('finish', () => {
                console.log("File uploaded successfully with ID:", id);
                return res.status(201).send({ fileID: id });
            });
        
        // Return here to prevent further execution.
        return;
    }

    // If no method matched, return a 405 error.
    return res.status(405).json({ error: 'Method not allowed.' });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};
