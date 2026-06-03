import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Check for PWA updates every hour and apply them immediately
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() {
    console.log('PWA is ready to work offline.');
  }
});

// Periodic background check for updates
setInterval(() => {
  updateSW();
}, 60 * 60 * 1000);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
