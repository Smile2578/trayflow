import { getSession, useSession, signOut } from 'next-auth/react';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <Dashboard session={session} onLogout={handleLogout}/>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',  // Redirect to the index page if not authenticated
        permanent: false,
      },
    };
  }

  return {
    props: { session },  // Pass session data to the component if needed
  };
}