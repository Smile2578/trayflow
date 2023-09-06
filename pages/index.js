import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Welcome from '../components/Welcome';
import Login from '../components/Login';
import Register from '../components/Register';  // Assume you have a Register component

const HomePage = () => {
  const { data: status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const showLoginHandler = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const showRegisterHandler = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const showLoginAfterRegister = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  return (
    <div>
      {!showLogin && !showRegister && <Welcome onFinishedTyping={showLoginHandler} />}
      {showLogin && <Login onRegister={showRegisterHandler} />}
      {showRegister && <Register onLogin={showLoginAfterRegister} />}
    </div>
  );
};

export default HomePage;
