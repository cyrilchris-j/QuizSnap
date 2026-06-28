import { useState } from 'react';
import { getUser, addXP, markChallengeComplete, isChallengeCompletedToday, checkAndAwardBadges, playXPSound, playBadgeSound } from '../utils/storage';
import { DAILY_CHALLENGES, getTodayChallenge, getNewsForThisWeek } from '../utils/content';
import { useApp } from '../context/AppContext';
import { DataIcon } from '../utils/icons';
import { CheckCircle, ChevronDown, ChevronUp, Calendar, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDayOfYear = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

// Get challenge for a specific offset from today (0 = today, 1 = tomorrow, -1 = yesterday)
const getChallengeForOffset = (offset) => {
  const idx = (getDayOfYear() + offset) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[(idx + DAILY_CHALLENGES.length) % DAILY_CHALLENGES.length];
};


// ── Streak Calendar ───────────────────────────────────────────────────────────
const StreakCalendar = ({ user }) => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = d.toISOString().split('T')[0];
    const isToday = i === 29;
    const done = user?.completedChallenges?.[key];
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return { key, done, isToday, label };
  });

  const totalDone = days.filter(d => d.done).length;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-nunito font-bold text-white flex items-center gap-2">
          <Calendar size={16} className="text-lime-400" /> Your 30-Day Streak
        </h3>
        <span className="text-lime-400 text-sm font-bold">{totalDone}/30 done</span>
      </div>

      {/* Calendar grid */}
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {days.map(({ key, done, isToday, label }) => (
          <div key={key} title={label}
            className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200
              ${isToday
                ? 'bg-amber-400 text-forest-900'
                : done
                ? 'bg-lime-400 text-forest-900'
                : 'bg-forest-800 text-white/10'}`}>
            {done ? '✓' : isToday ? '•' : ''}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-lime-400 inline-block" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-forest-800 inline-block" /> Pending
        </span>
      </div>
    </div>
  );
};

// ── News Card ─────────────────────────────────────────────────────────────────
const NewsCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="news-card glass-card" onClick={() => setExpanded(e => !e)}>
      <div className="flex items-start gap-3">
        <DataIcon name={item.icon} size={28} className="text-lime-400 shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-lime-400 font-semibold">{item.source}</span>
            <span className="text-xs text-white/30">{item.date}</span>
          </div>
          <p className="font-nunito font-bold text-white text-sm leading-snug">{item.headline}</p>
          {expanded && <p className="text-white/60 text-xs mt-2 leading-relaxed">{item.content}</p>}
        </div>
        <button className="text-white/30 hover:text-lime-400 transition-colors shrink-0 mt-1" aria-label="Toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Challenges = () => {
  const { refreshUser, showNotification, showBadgePopup, showLevelUp } = useApp();
  const [challengeDone, setChallengeDone] = useState(isChallengeCompletedToday());
  const u = getUser();
  const todayChallenge = getTodayChallenge();
  const newsItems = getNewsForThisWeek();

  const handleComplete = () => {
    if (challengeDone) return;
    const { user: updated, leveledUp, newLevel } = addXP(15);
    const newBadges = checkAndAwardBadges(updated);
    markChallengeComplete();
    setChallengeDone(true);
    refreshUser();
    playXPSound(updated);
    if (leveledUp) { confetti({ particleCount: 120, spread: 80, colors: ['#a3e635', '#f59e0b'] }); showLevelUp(newLevel); }
    newBadges.forEach((b, i) => setTimeout(() => { playBadgeSound(updated); showBadgePopup(b); confetti({ particleCount: 60 }); }, i * 1500));
    showNotification('+15 XP! Challenge complete!', 'success');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-nunito font-black text-3xl text-white flex items-center gap-3"><DataIcon name="zap" size={32} className="text-amber-400" /> Daily Challenges</h1>
        <p className="text-white/50 text-sm mt-1">One real-world eco action every day — complete it to earn XP</p>
      </div>

      {/* How it works */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Info size={18} className="text-lime-400 mt-0.5 shrink-0" />
        <div className="text-sm text-white/60 leading-relaxed">
          <span className="text-white font-semibold">How it works: </span>
          Every day you get a new eco challenge — a simple real-world action you can do today.
          Complete it to earn <span className="text-lime-400 font-semibold">+15 XP</span> and grow your streak.
          Challenges rotate daily and repeat every 30 days.
        </div>
      </div>

      {/* TODAY'S Challenge — Hero */}
      <div className={`challenge-card ${challengeDone ? 'border-lime-400/40' : 'border-amber-400/20'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">⚡ Today's Challenge</span>
          {challengeDone && <CheckCircle size={14} className="text-lime-400" />}
        </div>

        <div className="flex items-start gap-4">
          <DataIcon name={todayChallenge.icon} size={48} className="text-white shrink-0" />
          <div className="flex-1">
            <h2 className="font-nunito font-bold text-xl text-white mb-1">{todayChallenge.title}</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">{todayChallenge.desc}</p>

            {challengeDone ? (
              <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
                <CheckCircle size={18} /> Challenge completed! +15 XP earned ✅
              </div>
            ) : (
              <button className="btn-amber" onClick={handleComplete} id="complete-daily-btn">
                ✅ Mark as Complete  +15 XP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <StreakCalendar user={u} />

      {/* Challenge History */}
      <div>
        <h2 className="font-nunito font-bold text-white text-lg mb-3 flex items-center gap-2"><DataIcon name="clipboard" size={20} className="text-white" /> Challenge History</h2>
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => i + 1).map(daysAgo => {
            const d = new Date(Date.now() - daysAgo * 86400000);
            const dateKey = d.toISOString().split('T')[0];
            const done = u?.completedChallenges?.[dateKey];
            const dayChallenge = getChallengeForOffset(-daysAgo);
            const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

            return (
              <div key={dateKey}
                className={`glass-card p-4 flex items-center gap-4 ${!done ? 'opacity-75' : ''}`}>
                <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 min-w-[72px] text-center
                  ${done ? 'bg-lime-400/20 text-lime-400' : 'bg-forest-800/50 text-white/60'}`}>
                  {label}
                </div>
                <DataIcon name={dayChallenge.icon} size={24} className={done ? 'text-lime-400' : 'text-white/50'} />
                <p className={`flex-1 text-sm font-semibold ${done ? 'text-white' : 'text-white/60'}`}>
                  {dayChallenge.title}
                </p>
                {done
                  ? <span className="text-lime-400 text-sm shrink-0">✅ +15 XP</span>
                  : <span className="text-white/40 text-xs shrink-0">Missed</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Eco News */}
      <div>
        <h2 className="font-nunito font-bold text-white text-lg mb-1 flex items-center gap-2"><DataIcon name="newspaper" size={20} className="text-white" /> Eco News Feed</h2>
        <p className="text-white/30 text-xs mb-3">Refreshes every week — tap to read more</p>
        <div className="space-y-3">
          {newsItems.map(item => <NewsCard key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
