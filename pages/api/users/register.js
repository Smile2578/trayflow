import bcrypt from 'bcryptjs';
import UserModel from '../../../models/User';
import connectToDatabase from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();  // Method Not Allowed
  }

  await connectToDatabase();

  const { userName, email, password, passwordConfirmation, role, accessCode } = req.body;
  const predefinedAccessCode = process.env.SECRET_ACCESS_CODE;

  // Validate access code
  if (accessCode !== predefinedAccessCode) {
    return res.status(403).json({ message: 'Code d\'accès invalide.' });
  }

  // Check if passwords match
  if (password !== passwordConfirmation) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
  }

  // Check if email already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Utilisateur existant' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new UserModel({
    userName,
    email,
    password: hashedPassword,
    role
  });

  try {
    await newUser.save();
    return res.status(201).json({ message: 'Compte créé !' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    return res.status(500).json({ message: 'Une erreur serveur est survenue' });
  }
}
