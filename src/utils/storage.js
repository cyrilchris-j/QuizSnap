// ─── localStorage Keys ───────────────────────────────────────────────────────
const USER_KEY = 'ecoquest_user';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Default user structure ───────────────────────────────────────────────────
const defaultUser = () => ({
  id: Date.now().toString(),
  name: '',
  age: '',
  school: '',
  grade: '',
  avatar: 'sprout',
  xp: 0,
  level: 1,
  streak: 0,
  lastLoginDate: null,
  badges: [],
  completedLessons: [],    // ['climate-1', 'climate-2', ...]
  completedModules: [],    // ['climate', 'biodiversity', ...]
  completedChallenges: {}, // { 'YYYY-MM-DD': true }
  quizScores: {},          // { 'climate-1': 5, ... }
  createdAt: new Date().toISOString(),
  soundEnabled: true,
  lightMode: false,
  onboardingDone: false,
  lastNewsRotation: null,
});

// ─── Level system ─────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, minXP: 0,    maxXP: 99,   icon: 'sprout', title: 'Eco Seedling' },
  { level: 2, minXP: 100,  maxXP: 299,  icon: 'leaf', title: 'Green Learner' },
  { level: 3, minXP: 300,  maxXP: 599,  icon: 'tree-pine', title: 'Eco Warrior' },
  { level: 4, minXP: 600,  maxXP: 999,  icon: 'tree', title: 'Nature Guardian' },
  { level: 5, minXP: 1000, maxXP: 9999, icon: 'globe', title: 'Planet Hero' },
];

export const getLevelInfo = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
};

export const getNextLevelInfo = (xp) => {
  const current = getLevelInfo(xp);
  return LEVELS.find(l => l.level === current.level + 1) || current;
};

export const getXPProgress = (xp) => {
  const current = getLevelInfo(xp);
  const next = getNextLevelInfo(xp);
  if (current.level === next.level) return 100;
  const progress = xp - current.minXP;
  const total = next.minXP - current.minXP;
  return Math.min(100, Math.round((progress / total) * 100));
};

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first-step',    icon: 'sprout', name: 'First Step',    desc: 'Complete your first lesson' },
  { id: 'on-fire',       icon: 'flame', name: 'On Fire',       desc: '3-day login streak' },
  { id: 'quiz-master',   icon: 'zap', name: 'Quiz Master',   desc: 'Score 5/5 on any quiz' },
  { id: 'recycler',      icon: 'recycle', name: 'Recycler',      desc: 'Complete Waste module' },
  { id: 'water-saver',   icon: 'droplets', name: 'Water Saver',   desc: 'Complete Water module' },
  { id: 'sun-chaser',    icon: 'sun', name: 'Sun Chaser',    desc: 'Complete Renewable module' },
  { id: 'bio-lover',     icon: 'butterfly', name: 'Bio Lover',     desc: 'Complete Biodiversity module' },
  { id: 'ocean-guard',   icon: 'waves', name: 'Ocean Guard',   desc: 'Complete Ocean module' },
  { id: 'climate-hero',  icon: 'thermometer', name: 'Climate Hero',  desc: 'Complete Climate module' },
  { id: 'all-rounder',   icon: 'trophy', name: 'All Rounder',   desc: 'Complete all 6 modules' },
  { id: 'week-warrior',  icon: 'calendar', name: 'Week Warrior',  desc: '7-day login streak' },
  { id: 'planet-hero',   icon: 'globe', name: 'Planet Hero',   desc: 'Reach max level (Planet Hero)' },
];

// ─── Core Storage Ops ─────────────────────────────────────────────────────────
export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return { ...defaultUser(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
};

export const saveUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user && db) {
      const userId = user.uid || (user.name ? user.name.trim().toLowerCase().replace(/\s+/g, '-') : null);
      if (userId) {
        setDoc(doc(db, 'users', userId), user).catch(e => console.error("Firebase sync error:", e));
      }
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const initUser = (data) => {
  const user = { ...defaultUser(), ...data };
  user.lastLoginDate = new Date().toDateString();
  user.streak = 1;
  saveUser(user);
  return user;
};

// ─── XP & Level ──────────────────────────────────────────────────────────────
// Returns { user, leveledUp, newLevel }
export const addXP = (amount) => {
  const user = getUser();
  if (!user) return { user: null, leveledUp: false };
  const oldLevel = getLevelInfo(user.xp).level;
  user.xp += amount;
  const newLevelInfo = getLevelInfo(user.xp);
  const leveledUp = newLevelInfo.level > oldLevel;
  if (leveledUp) user.level = newLevelInfo.level;
  saveUser(user);
  return { user, leveledUp, newLevel: newLevelInfo };
};

// ─── Badge ops ────────────────────────────────────────────────────────────────
// Returns newly unlocked badge or null
export const unlockBadge = (badgeId) => {
  const user = getUser();
  if (!user) return null;
  if (user.badges.includes(badgeId)) return null;
  user.badges.push(badgeId);
  saveUser(user);
  return BADGES.find(b => b.id === badgeId) || null;
};

export const checkAndAwardBadges = (user) => {
  const awarded = [];
  const addIfNew = (id) => {
    if (!user.badges.includes(id)) {
      user.badges.push(id);
      awarded.push(BADGES.find(b => b.id === id));
    }
  };

  if (user.completedLessons.length >= 1) addIfNew('first-step');
  if (user.streak >= 3) addIfNew('on-fire');
  if (user.streak >= 7) addIfNew('week-warrior');
  if (user.completedModules.includes('waste')) addIfNew('recycler');
  if (user.completedModules.includes('water')) addIfNew('water-saver');
  if (user.completedModules.includes('renewable')) addIfNew('sun-chaser');
  if (user.completedModules.includes('biodiversity')) addIfNew('bio-lover');
  if (user.completedModules.includes('ocean')) addIfNew('ocean-guard');
  if (user.completedModules.includes('climate')) addIfNew('climate-hero');
  if (user.completedModules.length >= 6) addIfNew('all-rounder');
  if (getLevelInfo(user.xp).level === 5) addIfNew('planet-hero');
  const hasQuizMaster = Object.values(user.quizScores || {}).some(s => s >= 5);
  if (hasQuizMaster) addIfNew('quiz-master');

  saveUser(user);
  return awarded;
};

// ─── Lesson / Module ─────────────────────────────────────────────────────────
export const markLessonComplete = (lessonId) => {
  const user = getUser();
  if (!user) return { user: null };
  if (!user.completedLessons.includes(lessonId)) {
    user.completedLessons.push(lessonId);
  }
  saveUser(user);
  return { user };
};

export const markModuleComplete = (moduleId) => {
  const user = getUser();
  if (!user) return { user: null };
  if (!user.completedModules.includes(moduleId)) {
    user.completedModules.push(moduleId);
  }
  saveUser(user);
  return { user };
};

export const saveQuizScore = (lessonId, score) => {
  const user = getUser();
  if (!user) return;
  if (!user.quizScores) user.quizScores = {};
  const prev = user.quizScores[lessonId] || 0;
  user.quizScores[lessonId] = Math.max(prev, score);
  saveUser(user);
};

// ─── Daily Challenge ──────────────────────────────────────────────────────────
export const getTodayKey = () => new Date().toISOString().split('T')[0];

export const markChallengeComplete = () => {
  const user = getUser();
  if (!user) return { user: null, newBadges: [] };
  const today = getTodayKey();
  if (!user.completedChallenges) user.completedChallenges = {};
  user.completedChallenges[today] = true;
  saveUser(user);
  const newBadges = checkAndAwardBadges(user);
  return { user, newBadges };
};

export const isChallengeCompletedToday = () => {
  const user = getUser();
  if (!user) return false;
  const today = getTodayKey();
  return !!(user.completedChallenges && user.completedChallenges[today]);
};

// ─── Streak ───────────────────────────────────────────────────────────────────
export const updateStreak = () => {
  const user = getUser();
  if (!user) return user;
  const today = new Date().toDateString();
  if (user.lastLoginDate === today) return user;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (user.lastLoginDate === yesterday) {
    user.streak = (user.streak || 0) + 1;
  } else {
    user.streak = 1;
  }
  user.lastLoginDate = today;
  saveUser(user);
  return user;
};

// ─── Sound ────────────────────────────────────────────────────────────────────
export const playXPSound = (user) => {
  if (!user?.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
};

export const playBadgeSound = (user) => {
  if (!user?.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [392, 523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch {}
};
