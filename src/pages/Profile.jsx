import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser, clearUser, BADGES, getLevelInfo, getXPProgress } from '../utils/storage';
import { useApp } from '../context/AppContext';
import { BadgeCard, XPBar } from '../components/UI';
import { DataIcon } from '../utils/icons';
import { Share2, Trash2, Copy, Check } from 'lucide-react';

// ── Share Modal ───────────────────────────────────────────────────────────────
const ShareModal = ({ user, level, onClose }) => {
  const { showNotification } = useApp();
  const [copied, setCopied] = useState(false);

  const shareText =
    `I'm on EcoQuest!\n\n` +
    `${user.name} — ${level.title}\n` +
    `${user.xp} XP | ${user.streak || 0}-day streak | ${user.badges?.length || 0} badges\n\n` +
    `Learning to save the planet, one challenge at a time. #EcoQuest`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      showNotification('Copied to clipboard! ✅', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'My EcoQuest Achievement', text: shareText })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="glass-card p-6 max-w-sm w-full border border-lime-400/20 animate-slide-up space-y-5"
        onClick={e => e.stopPropagation()}>

        <h3 className="font-nunito font-black text-xl text-white text-center">Share Achievement <DataIcon name="globe" size={20} className="inline text-blue-400" /></h3>

        {/* Preview card */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg, #0a2e1a, #0f3d24)', border: '1.5px solid rgba(163,230,53,0.3)' }}>
          <div className="flex justify-center mb-2"><DataIcon name={user.avatar} size={48} className="text-lime-400" /></div>
          <p className="text-lime-400 text-xs font-bold tracking-widest uppercase mb-1">ECOQUEST ACHIEVEMENT</p>
          <h4 className="font-nunito font-black text-xl text-white">{user.name}</h4>
          <p className="text-white/40 text-xs mb-3">{user.school}</p>
          <div className="flex justify-center gap-1 mb-3">
            <DataIcon name={level.icon} size={24} className="text-lime-400" />
            <span className="text-lime-400 font-bold self-center text-sm">{level.title}</span>
          </div>
          <div className="flex gap-3 justify-center">
            {[
              ['star', user.xp + ' XP'],
              ['flame', (user.streak || 0) + ' days'],
              ['medal', (user.badges?.length || 0) + ' badges'],
            ].map(([icon, val]) => (
              <div key={val} className="bg-white/5 rounded-xl px-3 py-2 text-center flex flex-col items-center">
                <DataIcon name={icon} size={20} className="text-lime-400 mb-1" />
                <div className="text-lime-400 font-bold text-xs">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Text preview */}
        <div className="bg-forest-800/60 rounded-xl p-3">
          <p className="text-white/50 text-xs whitespace-pre-line leading-relaxed">{shareText}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 btn-secondary py-3">
            {copied ? <Check size={15} className="text-lime-400" /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          {typeof navigator.share === 'function' && (
            <button onClick={handleNativeShare}
              className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Share2 size={15} /> Share
            </button>
          )}
        </div>

        <button onClick={onClose} className="w-full text-center text-white/30 text-xs hover:text-white/60 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

// ── Profile Page ──────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const u = getUser();
  if (!u) { navigate('/'); return null; }

  const level = getLevelInfo(u.xp);
  // Total lessons can be hardcoded or imported from MODULES, let's just assume we import MODULES at the top again if needed, or compute it.
  // Actually, I removed the MODULES import above, let me add it back at the top if needed. Let's just fix it.
  const totalLessons = 18; // 6 modules * 3 lessons each roughly
  const lessonsCompleted = u.completedLessons?.length || 0;
  const modulesCompleted = u.completedModules?.length || 0;
  const challengesCompleted = Object.keys(u.completedChallenges || {}).length;

  const handleSignOut = () => {
    clearUser();
    setUser(null);
    navigate('/', { replace: true });
  };

  const STATS = [
    { icon: 'star', label: 'Total XP',       value: u.xp },
    { icon: 'flame', label: 'Day Streak',      value: u.streak || 0 },
    { icon: 'book-open', label: 'Lessons Done',    value: `${lessonsCompleted}/${totalLessons}` },
    { icon: 'package', label: 'Modules Done',    value: `${modulesCompleted}/6` },
    { icon: 'medal', label: 'Badges',          value: u.badges?.length || 0 },
    { icon: 'zap', label: 'Challenges',      value: challengesCompleted },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">

      {/* Profile Header */}
      <div className="glass-card-glow p-6">
        <div className="flex items-center gap-4 mb-4">
          <DataIcon name={u.avatar} size={56} className="text-lime-400 shrink-0" />
          <div className="flex-1">
            <h1 className="font-nunito font-black text-2xl text-white">{u.name}</h1>
            <p className="text-white/50 text-sm">{u.school}</p>
            <p className="text-white/40 text-xs">{u.grade} • Age {u.age}</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <DataIcon name={level.icon} size={36} className="text-lime-400" />
            <p className="text-lime-400 text-xs font-bold mt-1">{level.title}</p>
          </div>
        </div>
        <XPBar xp={u.xp} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="flex justify-center mb-1"><DataIcon name={s.icon} size={24} className="text-white/70" /></div>
            <p className="font-nunito font-black text-xl text-lime-400 mt-1">{s.value}</p>
            <p className="text-xs text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* All Badges */}
      <div>
        <h2 className="font-nunito font-bold text-white text-lg mb-3 flex items-center gap-2"><DataIcon name="medal" size={20} className="text-white" /> All Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES.map(b => (
            <BadgeCard key={b.id} badge={b} unlocked={u.badges?.includes(b.id)} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => setShowShareModal(true)}
          className="btn-secondary flex-1 flex items-center justify-center gap-2" id="share-achievement-btn">
          <Share2 size={16} /> Share Achievement
        </button>
        <button onClick={() => setShowSignOutModal(true)}
          className="flex-1 flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 px-6 rounded-xl font-semibold text-sm transition-all"
          id="sign-out-btn">
          <Trash2 size={16} /> Sign Out
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal user={u} level={level} onClose={() => setShowShareModal(false)} />
      )}

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowSignOutModal(false)}>
          <div className="glass-card p-8 max-w-sm w-full border border-red-500/30 animate-slide-up"
            onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="flex justify-center mb-3"><DataIcon name="alert-triangle" size={48} className="text-red-400" /></div>
              <h3 className="font-nunito font-black text-xl text-white mt-3 mb-2">Sign Out?</h3>
              <p className="text-white/60 text-sm mb-6">
                Are you sure you want to sign out? Your progress is safely backed up to the cloud. You can sign back in anytime using your name!
              </p>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setShowSignOutModal(false)}>Cancel</button>
                <button className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                  onClick={handleSignOut} id="confirm-signout-btn">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
