import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { DataIcon } from './utils/icons';
import { Sidebar, BottomNav } from './components/Nav';
import { Toast, BadgePopup, LevelUpModal } from './components/UI';
import Onboarding, { OnboardingTour } from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import { LearnPage, ModulePage, LessonPage } from './pages/Learn';
import Challenges from './pages/Challenges';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import QuizPage from './pages/QuizPage';
import { getUser, saveUser } from './utils/storage';

// ── Protected Route ──────────────────────────────────────────────────────────
const Protected = ({ children }) => {
  const u = getUser();
  if (!u) return <Navigate to="/" replace />;
  return children;
};

// ── Layout (sidebar + main) ──────────────────────────────────────────────────
const Layout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen forest-bg w-full overflow-x-hidden">
      <Sidebar />
      <main className="main-content min-h-screen w-full" key={location.pathname}>
        <div className="max-w-4xl mx-auto w-full px-0">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

function App() {
  const { user, loading } = useApp();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u && !u.onboardingDone) {
      setShowTour(true);
      u.onboardingDone = true;
      saveUser(u);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen forest-bg flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-float"><DataIcon name="globe" size={72} className="text-lime-400" /></div>
          <p className="text-lime-400 font-nunito font-bold text-xl animate-pulse">Loading EcoQuest…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast />
      <BadgePopup />
      <LevelUpModal />
      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}

      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
        <Route path="/learn" element={<Protected><Layout><LearnPage /></Layout></Protected>} />
        <Route path="/learn/:moduleId" element={<Protected><Layout><ModulePage /></Layout></Protected>} />
        <Route path="/learn/:moduleId/:lessonId" element={<Protected><Layout><LessonPage /></Layout></Protected>} />
        <Route path="/challenges" element={<Protected><Layout><Challenges /></Layout></Protected>} />
        <Route path="/badges" element={<Protected><Layout><Badges /></Layout></Protected>} />
        <Route path="/leaderboard" element={<Protected><Layout><Leaderboard /></Layout></Protected>} />
        <Route path="/profile" element={<Protected><Layout><Profile /></Layout></Protected>} />
        <Route path="/quiz" element={<Protected><Layout><QuizPage /></Layout></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
