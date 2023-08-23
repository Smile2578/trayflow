import connectToDatabase from '../../../utils/db';
import TaskModel from '../../../models/Task';

export default async function handler(req, res) {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error("Database connection error:", dbError);
        return res.status(500).json({ message: 'Failed to connect to database.', error: dbError.message });
    }

    if (req.method !== 'GET') {
        console.warn("Method not allowed:", req.method);  // Log if there's any unexpected method used
        return res.status(405).end();  // Method Not Allowed
    }

    try {
        const tasks = await TaskModel.find({});
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);  // Logging the error for more details
        res.status(500).json({ error: "Failed to fetch tasks." });
    }
}
