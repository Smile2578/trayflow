import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  width: 600px;
`;

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('/welcomebg.jpg');
  background-size: cover;
`;

const RoleButton = styled.button`
  margin: 0 5px;
  width: 100px;
  height: 100px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.selected ? '#00cc00' : '#ffffff')};
  color: ${(props) => (props.selected ? '#ffffff' : '#000000')};
  cursor: pointer;
  &:hover {
    background-color: #00cc00;
    color: #ffffff;
  }
`;

const Icon = styled.img`
  width: 100px;
  height: 100px;
`;

const Logo = styled.img`
  width: 150px;
  height: auto;
  margin-bottom: 20px;
`;


const Register = ({ onLogin }) => {
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [accessCode, setAccessCode] = useState('');  // New state for access code

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure all fields are filled
    if (!lastName || !email || !password || !confirmPassword || !role || !accessCode) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    const finalLastName = lastName;

    try {
      const response = await axios.post('http://localhost:3000/api/users/register', {
        userName: finalLastName, 
        email, 
        password, 
        passwordConfirmation: confirmPassword,
        role,
        accessCode
      });
      setConfirmationMessage('Inscription réussie ! Redirection vers la connexion...');
      setTimeout(onLogin, 2000);  // Redirect to login after 2 seconds
    } catch (error) {
      console.error("Erreur lors de l'enregistrement", error);
    }
  };

  return (
    <RegisterContainer>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
        <RegisterForm onSubmit={handleSubmit}>
          <Image src="/trayflowlogo.png" alt="TrayFlow Logo" width={150} height={150} /> {/* Replaced Logo with Image component */}
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">Nom</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">Mot de Passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">Confirmer le Mot de Passe</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">Code Accès</label>
            <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" />
          </div>
          <div className="mb-4">
            <label className="flex text-sm text-black font-bold mb-2">Rôle</label>
            <div>
              <RoleButton type="button" selected={role === 'Dentiste'} onClick={() => setRole('Dentiste')}>  {/* Added type="button" */}
                <Image src="/dentist.png" alt="Dentiste" />
              </RoleButton>
              <RoleButton type="button" selected={role === 'Prothesiste'} onClick={() => setRole('Prothesiste')}>  {/* Added type="button" */}
                <Image src="/prothese.png" alt="Prothesiste" />
              </RoleButton>
              <RoleButton type="button" selected={role === 'Assistante'} onClick={() => setRole('Assistante')}>  {/* Added type="button" */}
                <Image src="/assistante.png" alt="Assistante" />
              </RoleButton>
            </div>
          </div>
          <div className="mb-6 text-center">
            <motion.button whileTap={{ scale: 0.9 }} type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline">Confirmer</motion.button>
          </div>
          <div className="text-center">
            <button onClick={onLogin} className="text-blue-500 hover:text-blue-700 underline">Retour à la connexion</button>
          </div>
          {confirmationMessage && <p>{confirmationMessage}</p>}
        </RegisterForm>
      </motion.div>
    </RegisterContainer>
  );
};

export default Register;