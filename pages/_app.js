import '@/styles/globals.css';
import { SessionProvider } from "next-auth/react";
import TokenRefresher from "../components/TokenRefresher";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <TokenRefresher />
      <DndProvider backend={HTML5Backend}>
        <Component {...pageProps} />
      </DndProvider>
    </SessionProvider>
  );
}

export default App;
