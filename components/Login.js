import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  width: 400px;
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('/welcomebg.jpg');
  background-size: cover;
`;

const Logo = styled.img`
  width: 150px;
  height: auto;
  margin-bottom: 20px;
`;

const Login = ({ onRegister }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);  // Start loading

    const result = await signIn('credentials', {
      userName,
      password,
      redirect: false
    });

    setLoading(false);  // End loading

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <LoginContainer>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
        <LoginForm onSubmit={handleSubmit}>
          <Image src="/trayflowlogo.png" alt="TrayFlow Logo" width={150} height={150} />
          
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">Utilisateur</label>
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" 
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-black text-sm font-bold mb-2">Mot de Passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border border-red-500 rounded shadow appearance-none focus:outline-none focus:shadow-outline" 
            />
          </div>
  
          {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
  
          <div className="mb-6 text-center">
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
            </button>
          </div>
          
          <div className="text-center">
            <button onClick={onRegister} className="text-blue-500 hover:text-blue-700 underline">Créer mon compte</button>
          </div>
        </LoginForm>
      </motion.div>
    </LoginContainer>
  );
};

export default Login;