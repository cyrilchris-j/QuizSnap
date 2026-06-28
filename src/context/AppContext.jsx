import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, saveUser, updateStreak, getLevelInfo, getXPProgress } from '../utils/storage';

export const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // { type, message }
  const [badgePopup, setBadgePopup] = useState(null);     // badge object
  const [levelUpModal, setLevelUpModal] = useState(null); // level object
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    const stored = getUser();
    if (stored) {
      const updated = updateStreak();
      setUser(updated || stored);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.lightMode) {
      document.body.classList.add('light-mode');
      setLightMode(true);
    } else {
      document.body.classList.remove('light-mode');
      setLightMode(false);
    }
  }, [user?.lightMode]);

  const refreshUser = useCallback(() => {
    const u = getUser();
    if (u) setUser(u);
    return u;
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const showBadgePopup = useCallback((badge) => {
    setBadgePopup(badge);
  }, []);

  const showLevelUp = useCallback((level) => {
    setLevelUpModal(level);
  }, []);

  const toggleSound = useCallback(() => {
    const u = getUser();
    if (!u) return;
    u.soundEnabled = !u.soundEnabled;
    saveUser(u);
    setUser({ ...u });
  }, []);

  const toggleLightMode = useCallback(() => {
    const u = getUser();
    if (!u) return;
    u.lightMode = !u.lightMode;
    saveUser(u);
    setUser({ ...u });
  }, []);

  const levelInfo = user ? getLevelInfo(user.xp) : null;
  const xpProgress = user ? getXPProgress(user.xp) : 0;

  return (
    <AppContext.Provider value={{
      user, setUser, loading, refreshUser,
      notification, showNotification,
      badgePopup, setBadgePopup, showBadgePopup,
      levelUpModal, setLevelUpModal, showLevelUp,
      levelInfo, xpProgress,
      toggleSound, toggleLightMode, lightMode,
    }}>
      {children}
    </AppContext.Provider>
  );
};

