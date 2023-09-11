import connectToDatabase from '../../../utils/db';
import Task from '../../../models/Task';

export default async function handler(req, res) {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error("Database connection error:", dbError);
        return res.status(500).json({ message: 'Failed to connect to database.', error: dbError.message });
    }

    if (req.method === 'POST') {
        const {
            patientName,
            practitionerName,
            taskType,
            impressionDate,
            fittingDate,
            arcade,
            quantity,
            priority,
            comment,
            status
        } = req.body;

        const {
            upperImpression,
            upperImpressionReady = false, // Default values in case they aren't provided
            lowerImpression,
            lowerImpressionReady = false,
            upperImpressionGCSKey = null,
            lowerImpressionGCSKey = null
        } = arcade || {}; // Default to an empty object in case arcade isn't provided

        try {
            const newTask = new Task({
                patientName,
                practitionerName,
                taskType,
                impressionDate,
                fittingDate,
                arcade: {
                    upperImpression,
                    upperImpressionReady,
                    lowerImpression,
                    lowerImpressionReady,
                    upperImpressionGCSKey, // Include GCS key fields here
                    lowerImpressionGCSKey
                },
                quantity,
                priority,
                comment,
                status
            });

            await newTask.save();

            console.log("Task saved successfully:", newTask);  // Log successful task save
            return res.status(201).json(newTask);
        } catch (saveError) {
            console.error("Error saving new task:", saveError);  // Logging the error to server console for more details
            return res.status(500).json({ message: 'Internal Server Error', error: saveError.message });
        }
    } else {
        console.warn("Method not allowed:", req.method);  // Log if there's any unexpected method used
        return res.status(405).end();  // Method Not Allowed
    }
}
