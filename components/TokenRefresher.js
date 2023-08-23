// components/TokenRefresher.js

import { useEffect, useState } from 'react';
import { getSession, useSession } from 'next-auth/react';

function TokenRefresher() {
  const { data: session } = useSession();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    // Define the function to refresh the token
    const refreshToken = async () => {
      try {
        await getSession();
        console.log("Token refreshed!");
        setRetryCount(0);  // Reset retry count on success
      } catch (error) {
        console.error("Error refreshing token:", error);

        // Increment retry count and attempt to refresh again if under 3 retries
        setRetryCount(prev => prev + 1);
        if (retryCount < 3) {
          setTimeout(refreshToken, 5000);  // Retry after 5 seconds
        } else {
          // Handle max retries exceeded (e.g., display a notification to the user)
          console.warn("Max token refresh retries exceeded");
        }
      }
    };

    // Set up an interval to refresh the token every hour
    const intervalId = setInterval(refreshToken, 55 * 60 * 1000);  // Refresh 5 minutes before the hour

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [session, retryCount]);

  return null;  // This component doesn't render anything
}

export default TokenRefresher;
