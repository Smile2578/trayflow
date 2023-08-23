import { useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('/welcomebg.jpg');
  background-size: cover;
`;

const Logo = styled.img`
  width: 500px;
  height: auto;
`;

const Welcome = ({ onFinishedTyping }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishedTyping();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onFinishedTyping]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <WelcomeContainer>
        <Logo src="/trayflowlogo.png" alt="TrayFlow Logo" />
      </WelcomeContainer>
    </motion.div>
  );
};

export default Welcome;
