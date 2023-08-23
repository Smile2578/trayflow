import connectToDatabase from '../../../utils/db';
import User from '../../../models/User';  

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();  // Method Not Allowed
    }

    try {
        await connectToDatabase();

        const dentists = await User.find({ role: 'Dentiste' }).select('userName');  // Fetch only the 'name' field for each user

        return res.status(200).json(dentists);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
