import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { user } = useApp();

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!user || !showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] bg-lime-500 text-slate-900 px-4 py-3 shadow-lg flex items-center justify-between border-b-4 border-lime-600 animate-in slide-in-from-top-full duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-lime-900/10 p-2 rounded-xl">
          <Download size={20} className="text-lime-900" />
        </div>
        <div>
          <h3 className="font-bold text-sm leading-tight">Install EcoQuest App</h3>
          <p className="text-xs opacity-90 font-medium">Get a better experience!</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleInstallClick}
          className="bg-lime-900 text-lime-50 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform"
        >
          Download
        </button>
        <button 
          onClick={handleClose}
          className="p-1.5 opacity-60 hover:opacity-100 transition-opacity active:scale-95"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
