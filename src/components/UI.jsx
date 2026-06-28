import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getLevelInfo, getNextLevelInfo } from '../utils/storage';
import { DataIcon } from '../utils/icons';
import * as Icons from 'lucide-react';

export const Icon = ({ name, ...props }) => {
  const LucideIcon = Icons[name] || Icons.HelpCircle;
  return <LucideIcon {...props} />;
};


// ── XPBar ─────────────────────────────────────────────────────────────────────
export const XPBar = ({ xp, compact = false }) => {
  const barRef = useRef(null);
  const current = getLevelInfo(xp);
  const next = getNextLevelInfo(xp);
  const progress = current.level === next.level
    ? 100
    : Math.min(100, Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100));

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--xp-width', `${progress}%`);
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = `${progress}%`;
      });
    }
  }, [progress]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="xp-bar-track flex-1">
          <div ref={barRef} className="xp-bar-fill" style={{ width: '0%', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <span className="text-xs text-white/50 whitespace-nowrap">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span className="flex items-center gap-1.5"><DataIcon name={current.icon} size={14} className="text-lime-400" /> {current.title}</span>
        <span className="text-lime-400 font-semibold">{xp} / {next.minXP} XP</span>
      </div>
      <div className="xp-bar-track">
        <div ref={barRef} className="xp-bar-fill" style={{ width: '0%', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      {current.level !== next.level && (
        <div className="text-right text-xs text-white/40 flex items-center justify-end gap-1.5"><DataIcon name={next.icon} size={14} className="text-white/40" /> {next.title} in {next.minXP - xp} XP</div>
      )}
    </div>
  );
};

// ── LevelBadge ────────────────────────────────────────────────────────────────
export const LevelBadge = ({ xp, size = 'md' }) => {
  const info = getLevelInfo(xp);
  const sizes = { sm: 'p-2', md: 'p-3', lg: 'p-4' };
  const iconSizes = { sm: 20, md: 32, lg: 48 };
  return (
    <div className={`rounded-2xl bg-forest-800 border border-lime-400/20 animate-glow-pulse inline-flex items-center justify-center ${sizes[size]}`}>
      <DataIcon name={info.icon} size={iconSizes[size]} className="text-lime-400" />
    </div>
  );
};

// ── BadgeCard ─────────────────────────────────────────────────────────────────
export const BadgeCard = ({ badge, unlocked = false }) => (
  <div className={`glass-card p-4 flex flex-col items-center gap-2 text-center transition-all duration-300 ${unlocked ? 'glass-card-glow' : 'badge-locked'}`}>
    <DataIcon name={badge.icon} size={32} className={unlocked ? 'text-lime-400' : 'text-white/60'} />
    <div>
      <p className="text-xs font-nunito font-bold text-white">{badge.name}</p>
      <p className="text-xs text-white/50 mt-0.5">{badge.desc}</p>
    </div>
    {unlocked && <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded-full font-semibold">Unlocked</span>}
  </div>
);

// ── QuizCard ──────────────────────────────────────────────────────────────────
export const QuizCard = ({ question, options, onSelect, selected, correct, revealed }) => (
  <div className="space-y-3 animate-slide-up">
    <p className="font-nunito font-bold text-lg text-white leading-snug">{question}</p>
    <div className="space-y-2">
      {options.map((opt, i) => {
        let cls = 'quiz-option';
        if (revealed) {
          if (i === correct) cls += ' correct';
          else if (i === selected && selected !== correct) cls += ' wrong';
        } else if (i === selected) {
          cls += ' border-lime-400/40 bg-lime-400/5';
        }
        return (
          <button key={i} className={`${cls} w-full text-left`} onClick={() => !revealed && onSelect(i)}
            disabled={revealed} aria-label={`Option ${i + 1}: ${opt}`}>
            <span className="mr-3 text-white/40 font-bold">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max, color = 'lime' }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const colors = {
    lime: 'bg-gradient-to-r from-lime-500 to-lime-400',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-400',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
  };
  return (
    <div className="xp-bar-track">
      <div className={`${colors[color]} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = 'text-lime-400' }) => (
  <div className="stat-card glass-card-glow">
    <div className="flex justify-center mb-1"><DataIcon name={icon} size={24} className={color} /></div>
    <span className={`text-xl font-nunito font-bold ${color} block text-center`}>{value}</span>
    <span className="text-xs text-white/50 block text-center mt-1">{label}</span>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

// ── Toast Notification ────────────────────────────────────────────────────────
export const Toast = () => {
  const { notification } = useApp();
  if (!notification) return null;
  const colors = {
    success: 'border-lime-400/40 bg-lime-400/10 text-lime-400',
    error: 'border-red-400/40 bg-red-400/10 text-red-400',
    info: 'border-amber-400/40 bg-amber-400/10 text-amber-400',
  };
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl border font-semibold text-sm animate-slide-up glass-card ${colors[notification.type] || colors.success}`}>
      {notification.message}
    </div>
  );
};

// ── Badge Popup ───────────────────────────────────────────────────────────────
export const BadgePopup = () => {
  const { badgePopup, setBadgePopup } = useApp();
  if (!badgePopup) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setBadgePopup(null)}>
      <div className="glass-card p-8 text-center max-w-sm mx-4 border border-lime-400/30 animate-badge-pop level-up-modal">
        <div className="flex justify-center mb-4 animate-float"><DataIcon name={badgePopup.icon} size={72} className="text-lime-400" /></div>
        <p className="text-lime-400 text-sm font-semibold tracking-widest uppercase mb-1">Badge Unlocked!</p>
        <h2 className="font-nunito font-black text-3xl text-white mb-2">{badgePopup.name}</h2>
        <p className="text-white/60 text-sm mb-6">{badgePopup.desc}</p>
        <button className="btn-primary w-full" onClick={() => setBadgePopup(null)}>Awesome!</button>
      </div>
    </div>
  );
};

// ── Level Up Modal ────────────────────────────────────────────────────────────
export const LevelUpModal = () => {
  const { levelUpModal, setLevelUpModal } = useApp();
  if (!levelUpModal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-card p-10 text-center max-w-sm mx-4 border border-lime-400/40 animate-level-up level-up-modal">
        <div className="flex justify-center mb-4 animate-float"><DataIcon name={levelUpModal.icon} size={96} className="text-amber-400" /></div>
        <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-1">Level Up!</p>
        <h2 className="font-nunito font-black text-4xl text-white mb-2">{levelUpModal.title}</h2>
        <p className="text-white/60 mb-6">You've reached a new milestone on your eco journey!</p>
        <button className="btn-primary w-full" onClick={() => setLevelUpModal(null)}>Keep Going!</button>
      </div>
    </div>
  );
};
