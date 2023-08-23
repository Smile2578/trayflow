import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSession } from 'next-auth/client';

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const [ session, loading ] = useSession();
    const Router = useRouter();

    // Quand la session n'est pas chargée ou que l'utilisateur n'est pas connecté, redirigez vers la page de connexion
    useEffect(() => {
      if (!loading && !session) {
        Router.replace('/');
      }
    }, [session, loading]);

    // Si la session est chargée et qu'il y a un utilisateur connecté, affichez le composant enveloppé
    if (!loading && session) {
      return <WrappedComponent {...props} />;
    }

    // Pendant le chargement de la session, n'affichez rien, ou bien un composant de chargement
    return null;
  };

  // Copie les getInitialProps si elles existent
  if (WrappedComponent.getInitialProps) {
    Wrapper.getInitialProps = WrappedComponent.getInitialProps;
  }

  return Wrapper;
};

export default withAuth;
