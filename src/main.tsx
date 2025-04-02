
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Buffer polyfill for browser environments
import { Buffer } from 'buffer';
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
