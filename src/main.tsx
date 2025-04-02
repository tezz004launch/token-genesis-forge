
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App.tsx';

// Add a cache-busting timestamp to force browser to reload resources
const timestamp = new Date().getTime();
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  const href = link.getAttribute('href');
  if (href) {
    link.setAttribute('href', `${href}?v=${timestamp}`);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
