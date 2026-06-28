import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initUser, getUser, saveUser } from '../utils/storage';
import { useApp } from '../context/AppContext';
import { DataIcon } from '../utils/icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AVATARS = ['sprout','butterfly','bird','waves','tree-pine','leaf'];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 6 + 6,
  color: i % 3 === 0 ? '#a3e635' : i % 3 === 1 ? '#f59e0b' : '#22c55e',
}));  

const WelcomeScreen = ({ onStart }) => (
  <div className="min-h-screen forest-bg flex flex-col items-center justify-center relative overflow-hidden">
    {PARTICLES.map(p => (
      <div key={p.id} className="particle" style={{
        width: p.size, height: p.size, left: `${p.left}%`, bottom: '-10px',
        background: p.color, opacity: 0.6,
        animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
      }} />
    ))}
    <div className="relative z-10 text-center px-6 animate-fade-in">
      <div className="flex justify-center mb-6 animate-float"><DataIcon name="globe" size={96} className="text-lime-400" /></div>
      <h1 className="font-nunito font-black text-6xl md:text-7xl text-lime-400 mb-3 drop-shadow-lg">EcoQuest</h1>
      <p className="text-xl md:text-2xl text-white/70 mb-2 font-inter">Save the Planet. <span className="text-amber-400 font-semibold">Level Up.</span></p>
      <p className="text-white/40 text-sm mb-12 max-w-md mx-auto">Join thousands of eco-warriors learning to protect our planet through quizzes, challenges, and achievements.</p>
      <button className="btn-primary text-lg px-10 py-4 animate-glow-pulse flex items-center justify-center gap-2 mx-auto" onClick={onStart} id="start-journey-btn">
        <DataIcon name="leaf" size={20} /> Start Your Journey
      </button>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-forest-950 to-transparent" />
  </div>
);

const AuthChoice = ({ onSignIn, onSignUp }) => (
  <div className="min-h-screen forest-bg flex items-center justify-center px-4">
    <div className="glass-card-glow p-8 w-full max-w-sm text-center animate-slide-up">
      <div className="flex justify-center mb-4"><DataIcon name="user" size={64} className="text-lime-400" /></div>
      <h2 className="font-nunito font-black text-2xl text-white mb-2">Welcome to EcoQuest</h2>
      <p className="text-white/60 text-sm mb-8">Do you already have an account?</p>
      
      <div className="space-y-3">
        <button className="btn-primary w-full py-4 text-lg" onClick={onSignIn} id="auth-signin-btn">
          Sign In
        </button>
        <button className="btn-secondary w-full py-4 text-lg border-lime-400/20" onClick={onSignUp} id="auth-signup-btn">
          Create New Account
        </button>
      </div>
    </div>
  </div>
);

const LoginForm = ({ onComplete, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return setError('Email and password are required');
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      if (db) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const existingUser = userDoc.data();
          existingUser.uid = uid; // Ensure uid is kept
          saveUser(existingUser);
          onComplete(existingUser);
          return;
        }
      }
      setError("Account not found. Please sign up instead.");
    } catch (e) {
      setError(e.message || "Failed to log in. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen forest-bg flex items-center justify-center px-4">
      <div className="glass-card-glow p-8 w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <h2 className="font-nunito font-black text-2xl text-white">Sign In</h2>
          <p className="text-white/50 text-sm mt-1">Welcome back to EcoQuest</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-forest-800/60 border border-lime-400/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1">Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-forest-800/60 border border-lime-400/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50 transition-colors" />
            {error && <p className="text-red-400 text-xs mt-2 leading-tight">{error}</p>}
          </div>
          
          <button className="btn-primary w-full py-3" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button className="btn-secondary w-full py-3" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrationForm = ({ onComplete }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', school: '', grade: '', avatar: 'sprout' });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0); // 0=info, 1=avatar
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password (min 6 chars)';
    if (!form.age || form.age < 10 || form.age > 25) e.age = 'Age must be 10–25';
    if (!form.school.trim()) e.school = 'School name is required';
    if (!form.grade.trim()) e.grade = 'Grade/Year is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(1); };

  const handleSubmit = async () => {
    setLoading(true);
    setFirebaseError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCredential.user.uid;
      
      const { password, ...userData } = form; // Don't save password in local profile
      const user = initUser(userData);
      user.uid = uid;
      
      saveUser(user);
      onComplete(user);
    } catch (e) {
      setFirebaseError(e.message || "Failed to create account.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen forest-bg flex items-center justify-center px-4 py-10">
      <div className="glass-card-glow p-8 w-full max-w-md animate-slide-up">
        <div className="text-center mb-6">
          <div className="flex justify-center"><DataIcon name={step === 0 ? 'clipboard' : form.avatar} size={48} className="text-white" /></div>
          <h2 className="font-nunito font-black text-2xl text-white mt-3">
            {step === 0 ? 'Create Your Profile' : 'Choose Your Avatar'}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {step === 0 ? 'Tell us a bit about yourself' : 'Who will you be on your eco journey?'}
          </p>
        </div>

        {step === 0 ? (
          <div className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Arjun Sharma', id: 'reg-name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'arjun@example.com', id: 'reg-email' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', id: 'reg-password' },
              { key: 'age', label: 'Age', type: 'number', placeholder: '16', id: 'reg-age' },
              { key: 'school', label: 'School / College', type: 'text', placeholder: 'Delhi Public School', id: 'reg-school' },
              { key: 'grade', label: 'Grade / Year', type: 'text', placeholder: 'Class 10 / 2nd Year', id: 'reg-grade' },
            ].map(f => (
              <div key={f.key}>
                <label htmlFor={f.id} className="block text-xs font-semibold text-white/60 mb-1">{f.label}</label>
                <input id={f.id} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-forest-800/60 border border-lime-400/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-lime-400/50 transition-colors" />
                {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key]}</p>}
              </div>
            ))}
            <button className="btn-primary w-full mt-2" onClick={handleNext} id="reg-next-btn">Next →</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setForm(p => ({ ...p, avatar: a }))}
                  className={`flex justify-center items-center p-4 rounded-2xl border-2 transition-all duration-200 ${form.avatar === a ? 'border-lime-400 bg-lime-400/15 scale-105' : 'border-lime-400/10 bg-forest-800/40 hover:border-lime-400/30'}`}
                  aria-label={`Select avatar ${a}`}>
                  <DataIcon name={a} size={36} className={form.avatar === a ? 'text-lime-400' : 'text-white/60'} />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleSubmit} disabled={loading} id="reg-submit-btn">
                {loading ? 'Creating...' : 'Begin Quest!'} <DataIcon name="leaf" size={18} />
              </button>
            </div>
            {firebaseError && <p className="text-red-400 text-xs mt-2 text-center">{firebaseError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Onboarding Tour ────────────────────────────────────────────────────────────
export const OnboardingTour = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: 'book-open', title: 'Learn & Earn XP', desc: 'Complete lessons and quizzes to earn experience points and level up your eco knowledge.' },
    { icon: 'trophy', title: 'Unlock Badges', desc: 'Complete challenges and modules to unlock 12 unique eco badges. Collect them all!' },
    { icon: 'flame', title: 'Daily Challenges', desc: 'Complete one eco challenge every day to build your streak and earn bonus XP.' },
  ];
  const s = steps[step];
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card-glow p-8 w-full max-w-sm animate-slide-up border border-lime-400/30">
        <div className="text-center">
          <div className="flex justify-center"><DataIcon name={s.icon} size={64} className="text-lime-400" /></div>
          <div className="flex justify-center gap-1.5 my-4">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-lime-400' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
          <h3 className="font-nunito font-black text-xl text-white mb-2">{s.title}</h3>
          <p className="text-white/60 text-sm mb-6">{s.desc}</p>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1 text-sm" onClick={onDone}>Skip</button>
            <button className="btn-primary flex-1 text-sm flex items-center justify-center gap-1" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onDone()}>
              {step < steps.length - 1 ? 'Next →' : <><DataIcon name="leaf" size={16} /> Let's Go!</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Onboarding Page ──────────────────────────────────────────────────────
const Onboarding = () => {
  const [screen, setScreen] = useState('welcome'); // welcome | register
  const { setUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (getUser()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleComplete = (user) => {
    setUser(user);
    navigate('/dashboard', { replace: true });
  };

  if (screen === 'auth-choice') return <AuthChoice onSignIn={() => setScreen('login')} onSignUp={() => setScreen('register')} />;
  if (screen === 'login') return <LoginForm onComplete={handleComplete} onBack={() => setScreen('auth-choice')} />;
  if (screen === 'register') return <RegistrationForm onComplete={handleComplete} />;
  return <WelcomeScreen onStart={() => setScreen('auth-choice')} />;
};

export default Onboarding;
