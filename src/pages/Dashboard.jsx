import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { XPBar, LevelBadge, StatCard, Skeleton } from '../components/UI';
import { getUser, addXP, markChallengeComplete, isChallengeCompletedToday, playXPSound, playBadgeSound, checkAndAwardBadges, getLevelInfo, BADGES } from '../utils/storage';
import { getTodayChallenge } from '../utils/content';
import { MODULES } from '../utils/modules';
import { DataIcon } from '../utils/icons';
import { CheckCircle, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const { user, refreshUser, showNotification, showBadgePopup, showLevelUp } = useApp();
  const [loading, setLoading] = useState(true);
  const [challengeDone, setChallengeDone] = useState(false);
  const navigate = useNavigate();
  const challenge = getTodayChallenge();

  useEffect(() => {
    setTimeout(() => setLoading(false), 400);
    setChallengeDone(isChallengeCompletedToday());
  }, []);

  const handleChallenge = () => {
    if (challengeDone) return;
    const { user: updated, leveledUp, newLevel } = addXP(15);
    const newBadges = checkAndAwardBadges(updated);
    markChallengeComplete();
    setChallengeDone(true);
    refreshUser();
    playXPSound(updated);
    showNotification('+15 XP earned! Keep it up!', 'success');
    if (leveledUp) { confetti({ particleCount: 120, spread: 80, colors: ['#a3e635','#f59e0b','#22c55e'] }); showLevelUp(newLevel); }
    newBadges.forEach((b, i) => setTimeout(() => { playBadgeSound(updated); showBadgePopup(b); confetti({ particleCount: 60, spread: 60 }); }, i * 1500));
  };

  // Streak calendar last 30 days
  const getStreakDays = () => {
    const u = getUser();
    if (!u) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0];
      const isToday = i === 29;
      const done = u.completedChallenges?.[d];
      return { d, done, isToday };
    });
  };

  const streakDays = getStreakDays();
  const u = getUser() || user;

  const getModuleProgress = (mod) => {
    if (!u) return 0;
    const done = mod.lessons.filter(l => u.completedLessons?.includes(l.id)).length;
    return Math.round((done / mod.lessons.length) * 100);
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-3 gap-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card-glow p-5 flex items-center gap-4">
        <LevelBadge xp={u?.xp || 0} size="md" />
        <div className="flex-1">
          <h2 className="font-nunito font-black text-2xl text-white flex items-center gap-2">Welcome back, {u?.name?.split(' ')[0]}! <DataIcon name="sprout" size={24} className="text-lime-400" /></h2>
          <p className="text-white/50 text-sm mb-2">{u?.school}</p>
          <XPBar xp={u?.xp || 0} />
        </div>
      </div>

      {/* Today's Challenge */}
      <div className={`challenge-card ${challengeDone ? 'border-lime-400/40' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-lime-400 text-xs font-semibold tracking-widest uppercase mb-1">Today's Eco Challenge</p>
            <h3 className="font-nunito font-bold text-lg text-white mb-1 flex items-center gap-2"><DataIcon name={challenge.icon} size={20} className="text-amber-400" /> {challenge.title}</h3>
            <p className="text-white/60 text-sm mb-4">{challenge.desc}</p>
          </div>
          {challengeDone && <CheckCircle className="text-lime-400 mt-1 shrink-0" size={28} />}
        </div>
        {challengeDone ? (
          <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
            <CheckCircle size={18} /> Completed today! ✅ +15 XP earned
          </div>
        ) : (
          <button className="btn-primary w-full" onClick={handleChallenge} id="complete-challenge-btn">
            Mark as Complete +15 XP
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="flame" label="Day Streak" value={u?.streak || 0} color="text-amber-400" />
        <StatCard icon="star" label="Total XP" value={u?.xp || 0} color="text-lime-400" />
        <StatCard icon="medal" label="Badges" value={u?.badges?.length || 0} color="text-purple-400" />
      </div>

      {/* Quick Quiz CTA */}
      <button
        className="w-full glass-card-glow p-4 flex items-center gap-4 text-left group"
        onClick={() => navigate('/quiz')}
        id="quick-quiz-btn"
      >
        <DataIcon name="brain" size={36} className="text-pink-400 group-hover:scale-110 transition-transform duration-200" />
        <div className="flex-1">
          <h3 className="font-nunito font-bold text-white">Quick Quiz Mode</h3>
          <p className="text-white/50 text-xs">Pick a topic and test your knowledge instantly</p>
        </div>
        <span className="text-lime-400 font-bold text-sm bg-lime-400/10 px-3 py-1.5 rounded-xl">Start →</span>
      </button>

      {/* Streak Calendar */}
      <div className="glass-card p-5">
        <h3 className="font-nunito font-bold text-white mb-3 flex items-center gap-2"><DataIcon name="calendar" size={20} className="text-blue-400" /> Challenge Streak</h3>
        <div className="flex flex-wrap gap-1.5">
          {streakDays.map(({ d, done, isToday }) => (
            <div key={d} title={d}
              className={`streak-day ${isToday ? 'today' : done ? 'active' : 'inactive'} rounded-sm`}
              style={{ width: 18, height: 18 }} />
          ))}
        </div>
        <p className="text-xs text-white/30 mt-2">Last 30 days</p>
      </div>

      {/* Learning Modules */}
      <div>
        <h3 className="font-nunito font-bold text-white text-lg mb-3 flex items-center gap-2"><DataIcon name="book-open" size={20} className="text-lime-400" /> Learning Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODULES.map(mod => {
            const progress = getModuleProgress(mod);
            const isComplete = u?.completedModules?.includes(mod.id);
            return (
              <button key={mod.id} className="module-card text-left"
                onClick={() => navigate(`/learn/${mod.id}`)} id={`module-${mod.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <DataIcon name={mod.icon} size={24} className="text-white" />
                  {isComplete ? <span className="text-lime-400 text-xs font-bold flex items-center gap-1"><DataIcon name="check-circle" size={14} /> Complete</span>
                    : <span className="text-xs text-white/40">{mod.xpReward} XP</span>}
                </div>
                <h4 className="font-nunito font-bold text-white text-sm mb-2">{mod.title}</h4>
                <div className="xp-bar-track">
                  <div className="xp-bar-fill h-full rounded-full" style={{ width: `${progress}%`, transition: 'width 0.7s ease' }} />
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>{progress}% complete</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Badges */}
      {u?.badges?.length > 0 && (
        <div>
          <h3 className="font-nunito font-bold text-white text-lg mb-3 flex items-center gap-2"><DataIcon name="medal" size={20} className="text-purple-400" /> Recent Badges</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {u.badges.slice(-6).map(id => {
              const badge = BADGES.find(b => b.id === id);
              if (!badge) return null;
              return (
                <div key={id} className="glass-card-glow p-3 flex flex-col items-center gap-1 min-w-[80px] text-center">
                  <DataIcon name={badge.icon} size={28} className="text-lime-400 mb-1" />
                  <span className="text-xs text-white/70 font-semibold">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
