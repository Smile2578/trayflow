import bcrypt from 'bcryptjs';
import UserModel from '../../../models/User';
import connectToDatabase from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();  // Method Not Allowed
  }

  // Ensure a DB connection
  await connectToDatabase();

  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if user exists (using a case-insensitive match)
    const user = await UserModel.findOne({ userName: { $regex: new RegExp(`^${userName}$`, 'i') } }).exec();

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Return user data (consistent with NextAuth expectations)
    return res.status(200).json({ 
      id: user._id, 
      name: user.userName, 
      email: user.email, 
      role: user.role 
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
