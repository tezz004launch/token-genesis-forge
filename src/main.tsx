
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import LoadingScreen from './components/LoadingScreen'

// Add Buffer polyfill for browser environments
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const Main = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}
      {!isLoading && <App />}
    </>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
