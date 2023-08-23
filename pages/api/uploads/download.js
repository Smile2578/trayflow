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
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Handle GET request for file download
    if (req.method === 'GET') {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ error: 'File key is required.' });
        }

        console.log(`Attempting to download file with ID: ${key}`);

        bucket.openDownloadStreamByName(key)
            .on('error', (error) => {
                console.error(`Error fetching file with ID ${key} from GridFS:`, error);
                return res.status(500).send("Failed to fetch file");
            })
            .pipe(res);
        
        // Return here to prevent further execution.
        return;
    }

    // If no method matched, return a 405 error.
    return res.status(405).json({ error: 'Method not allowed.' });
}
