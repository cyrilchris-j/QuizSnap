import { useState, useEffect } from 'react';
import { getUser, getLevelInfo } from '../utils/storage';
import { useApp } from '../context/AppContext';
import { DataIcon } from '../utils/icons';
import { Copy } from 'lucide-react';

// 9 fake students + current user always shown
const FAKE_STUDENTS = [
  { name: 'Aarav Sharma',    school: 'Delhi Public School, R.K. Puram', avatar: 'sprout', xp: 1240, grade: 'Class 12' },
  { name: 'Priya Nair',      school: 'Kendriya Vidyalaya, Ernakulam',   avatar: 'butterfly', xp: 1105, grade: '2nd Year' },
  { name: 'Rohan Mehta',     school: 'St. Xavier\'s College, Mumbai',   avatar: 'leaf', xp: 980,  grade: 'Class 11' },
  { name: 'Ananya Reddy',    school: 'Hyderabad Public School',         avatar: 'waves', xp: 860,  grade: 'Class 10' },
  { name: 'Kabir Singh',     school: 'Modern School, Barakhamba',       avatar: 'bird', xp: 745,  grade: 'Class 12' },
  { name: 'Diya Patel',      school: 'Navrachana School, Vadodara',     avatar: 'flower', xp: 630,  grade: '1st Year' },
  { name: 'Arjun Krishnan',  school: 'Loyola College, Chennai',         avatar: 'sprout', xp: 520,  grade: '3rd Year' },
  { name: 'Sneha Joshi',     school: 'The Doon School, Dehradun',       avatar: 'butterfly', xp: 415,  grade: 'Class 11' },
  { name: 'Vikram Bose',     school: 'Presidency University, Kolkata',  avatar: 'leaf', xp: 310,  grade: '2nd Year' },
];

const RANK_ICONS = ['crown', 'medal', 'award'];

const LeaderboardRow = ({ rank, entry, isCurrentUser }) => {
  const level = getLevelInfo(entry.xp);
  return (
    <div className={`leaderboard-row ${isCurrentUser ? 'current-user border-amber-400/30' : ''} animate-fade-in`}
      style={{ animationDelay: `${rank * 0.04}s` }}>
      <div className="w-8 text-center flex justify-center items-center">
        {rank <= 3 ? <DataIcon name={RANK_ICONS[rank - 1]} size={24} className={rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : 'text-amber-600'} /> : <span className="text-white/40 text-sm font-bold">#{rank}</span>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-forest-800/80 border border-lime-400/20 flex items-center justify-center shrink-0">
        <DataIcon name={entry.avatar || 'sprout'} size={24} className="text-lime-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-nunito font-bold text-sm ${isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
          {entry.name} {isCurrentUser && '(You)'}
        </p>
        <p className="text-xs text-white/40 truncate">{entry.school}</p>
      </div>
      <div className="text-right">
        <p className="text-lime-400 font-bold text-sm">{entry.xp} XP</p>
        <p className="text-xs text-white/40 flex items-center justify-end gap-1"><DataIcon name={level.icon} size={12} /> {level.title}</p>
      </div>
    </div>
  );
};

// Weekly reset — next Monday midnight
const getResetCountdown = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const diff = nextMonday - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${Math.floor(h / 24)}d ${h % 24}h ${m}m`;
};

const Leaderboard = () => {
  const { showNotification } = useApp();
  const [filter, setFilter] = useState('global');
  const [countdown, setCountdown] = useState(getResetCountdown());
  const u = getUser();

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getResetCountdown()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentEntry = u ? {
    name: u.name, school: u.school, avatar: u.avatar,
    xp: u.xp, grade: u.grade,
  } : null;

  // Build ranked list
  const allStudents = [...FAKE_STUDENTS];
  const userRankInGlobal = [...allStudents, currentEntry].filter(Boolean)
    .sort((a, b) => b.xp - a.xp)
    .findIndex(s => s.name === u?.name) + 1;

  const isUserInTop10 = userRankInGlobal <= 10;

  const topList = [...allStudents]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, isUserInTop10 ? 9 : 9)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  // Insert user in correct position
  const insertedList = isUserInTop10 && currentEntry
    ? [...topList.slice(0, userRankInGlobal - 1), { ...currentEntry, rank: userRankInGlobal }, ...topList.slice(userRankInGlobal - 1)].slice(0, 10)
    : topList;

  const schoolList = filter === 'school'
    ? insertedList.filter(s => s.school?.includes(u?.school?.split(',')[0]?.split(' ')[0] || ''))
    : insertedList;

  const displayList = filter === 'grade'
    ? insertedList.filter(s => s.grade === u?.grade).length > 0
      ? insertedList.filter(s => s.grade === u?.grade)
      : insertedList.slice(0, 5)
    : filter === 'school' ? (schoolList.length > 0 ? schoolList : insertedList.slice(0, 5)) : insertedList;

  const handleInvite = () => {
    const link = `https://ecoquest.app/join?ref=${u?.name?.toLowerCase().replace(' ', '-') || 'eco'}-${u?.id?.slice(-4) || '1234'}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    showNotification('Link Copied! Share with your friends!', 'success');
  };

  const FILTERS = [
    { id: 'global', label: 'Global' },
    { id: 'school', label: 'My School' },
    { id: 'grade',  label: 'My Grade' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-nunito font-black text-3xl text-white flex items-center gap-3"><DataIcon name="trophy" size={32} className="text-amber-400" /> Leaderboard</h1>
          <p className="text-white/50 text-sm mt-1">Top eco-warriors this week</p>
        </div>
        <div className="glass-card px-3 py-2 text-right">
          <p className="text-xs text-white/40">Resets in</p>
          <p className="text-amber-400 font-bold text-sm">{countdown}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${filter === f.id ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30' : 'glass-card text-white/50 hover:text-white/80'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {displayList.map((entry, i) => {
          const isCurrentUser = entry.name === u?.name;
          return <LeaderboardRow key={`${entry.name}-${i}`} rank={entry.rank || i + 1} entry={entry} isCurrentUser={isCurrentUser} />;
        })}
      </div>

      {/* Current user outside top 10 */}
      {!isUserInTop10 && currentEntry && filter === 'global' && (
        <>
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">Your Rank</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <LeaderboardRow rank={userRankInGlobal} entry={currentEntry} isCurrentUser={true} />
        </>
      )}

      {/* Invite */}
      <button onClick={handleInvite} className="btn-secondary w-full flex items-center justify-center gap-2" id="invite-friends-btn">
        <Copy size={16} /> Invite Friends
      </button>
    </div>
  );
};

export default Leaderboard;
