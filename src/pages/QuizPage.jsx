import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MODULES } from '../utils/modules';
import { getUser, addXP, saveQuizScore, checkAndAwardBadges, playXPSound, playBadgeSound } from '../utils/storage';
import { DataIcon } from '../utils/icons';
import { QuizCard } from '../components/UI';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, RotateCcw, Zap, Trophy } from 'lucide-react';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildQ = (moduleId, count = 10) => {
  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod) return [];
  const all = mod.lessons.flatMap(l => l.quiz.map(q => ({ ...q, lessonId: l.id })));
  return shuffle(all).slice(0, Math.min(count, all.length));
};

// ── Topic Picker ──────────────────────────────────────────────────────────────
const TopicPicker = ({ onSelect }) => {
  const u = getUser();
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-nunito font-black text-3xl text-white flex items-center gap-3"><DataIcon name="brain" size={32} className="text-pink-400" /> Quick Quiz</h1>
        <p className="text-white/50 text-sm mt-1">Pick a topic → short summary → quiz. No reading required.</p>
      </div>

      {/* Topic progress overview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">Your Progress</p>
          <p className="text-lime-400 text-xs font-bold">
            {MODULES.filter(m => u?.completedModules?.includes(m.id)).length}/{MODULES.length} topics done
          </p>
        </div>
        <div className="flex gap-2">
          {MODULES.map(m => (
            <div key={m.id} title={m.title}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500
                ${u?.completedModules?.includes(m.id) ? 'bg-lime-400' : 'bg-forest-800'}`} />
          ))}
        </div>
      </div>

      {/* Topic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODULES.map((mod, idx) => {
          const scores = mod.lessons.map(l => u?.quizScores?.[l.id] || 0);
          const best = scores.length ? Math.max(...scores) : 0;
          const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          const isComplete = u?.completedModules?.includes(mod.id);
          const attempted = scores.some(s => s > 0);

          return (
            <button key={mod.id} id={`quiz-pick-${mod.id}`}
              onClick={() => onSelect(mod.id)}
              className="glass-card-glow p-5 text-left group hover:translate-y-[-2px] transition-all duration-200">

              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <DataIcon name={mod.icon} size={32} className="group-hover:scale-110 transition-transform duration-200 text-lime-400" />
                  <div>
                    <h3 className="font-nunito font-bold text-white text-sm">{mod.title}</h3>
                    <p className="text-xs text-white/30">{mod.lessons.length * 5} Qs · {mod.xpReward} XP</p>
                  </div>
                </div>
                <div className="text-right">
                  {isComplete
                    ? <span className="text-lime-400 text-xs">✅</span>
                    : attempted
                    ? <span className="text-xs font-bold" style={{ color: avg >= 4 ? '#a3e635' : '#f59e0b' }}>{avg}/5 avg</span>
                    : <span className="text-white/20 text-xs flex items-center gap-1"><DataIcon name="sparkles" size={12} /> New</span>}
                </div>
              </div>

              {/* Summary */}
              <p className="text-white/50 text-xs leading-relaxed mb-3">{mod.summary}</p>

              {/* Score dots per lesson */}
              <div className="flex gap-1.5">
                {mod.lessons.map((l, i) => {
                  const s = u?.quizScores?.[l.id] || 0;
                  return (
                    <div key={i} title={`Lesson ${i+1}: ${s}/5`}
                      className="flex-1 h-1.5 rounded-full"
                      style={{ background: s >= 5 ? '#a3e635' : s >= 3 ? '#f59e0b' : s > 0 ? '#6b7280' : '#1a3a25' }} />
                  );
                })}
              </div>
              <p className="text-xs text-white/20 mt-1">Lesson quiz scores</p>

              <div className="flex items-center justify-end mt-3">
                <span className="text-lime-400 text-xs font-semibold flex items-center gap-1">
                  Start Quiz <ChevronRight size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Quiz Config ───────────────────────────────────────────────────────────────
const QuizConfig = ({ moduleId, onStart, onBack }) => {
  const mod = MODULES.find(m => m.id === moduleId);
  const [count, setCount] = useState(10);
  const [timer, setTimer] = useState(30);
  const u = getUser();
  const scores = mod?.lessons.map(l => u?.quizScores?.[l.id] || 0) || [];
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="max-w-md mx-auto space-y-5 animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-1 text-white/50 hover:text-lime-400 text-sm transition-colors">
        <ChevronLeft size={16} /> Back to Topics
      </button>

      {/* Topic card */}
      <div className="glass-card-glow p-6">
        <div className="flex items-center gap-4">
          <DataIcon name={mod?.icon} size={48} className="text-lime-400 shrink-0" />
          <div>
            <h2 className="font-nunito font-black text-xl text-white">{mod?.title}</h2>
            <p className="text-white/50 text-xs mt-1 leading-snug">{mod?.summary}</p>
          </div>
        </div>
        {avg > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-white/30">Your average score</span>
            <span className="font-bold" style={{ color: avg >= 4 ? '#a3e635' : '#f59e0b' }}>{avg}/5 per question</span>
          </div>
        )}
      </div>

      {/* Count selector */}
      <div className="glass-card p-5 space-y-3">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Questions</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: 5, label: 'Quick', sub: '~2 min' },
            { n: 10, label: 'Standard', sub: '~5 min' },
            { n: 15, label: 'Full', sub: '~8 min' },
          ].map(({ n, label, sub }) => (
            <button key={n} onClick={() => setCount(n)}
              className={`py-3 rounded-xl text-center border transition-all duration-200
                ${count === n ? 'border-lime-400/50 bg-lime-400/15' : 'border-white/8 hover:border-lime-400/25'}`}>
              <p className={`text-sm font-bold ${count === n ? 'text-lime-400' : 'text-white'}`}>{n} Qs</p>
              <p className="text-xs text-white/30">{label}</p>
              <p className="text-xs text-white/20">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Timer selector */}
      <div className="glass-card p-5 space-y-3">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Time per Question</p>
        <div className="grid grid-cols-3 gap-2">
          {[15, 30, 60].map(t => (
            <button key={t} onClick={() => setTimer(t)}
              className={`py-3 rounded-xl border text-sm font-bold transition-all duration-200
                ${timer === t ? 'border-amber-400/50 bg-amber-400/15 text-amber-400' : 'border-white/8 text-white/50 hover:border-amber-400/25'}`}>
              {t}s
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        onClick={() => onStart({ count, timer })} id="quiz-start-btn">
        <Zap size={18} /> Start Quiz!
      </button>
    </div>
  );
};

// ── Active Quiz ───────────────────────────────────────────────────────────────
const ActiveQuiz = ({ moduleId, config, onFinish }) => {
  const mod = MODULES.find(m => m.id === moduleId);
  const [questions] = useState(() => buildQ(moduleId, config.count));
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(config.timer);
  const timerRef = useRef(null);
  const q = questions[qIndex];

  useEffect(() => {
    if (revealed) { clearInterval(timerRef.current); return; }
    setTimeLeft(config.timer);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); reveal(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIndex, revealed]);

  const reveal = (timeout = false) => {
    clearInterval(timerRef.current);
    setRevealed(true);
    const isCorrect = !timeout && selected === q.answer;
    setAnswers(prev => [...prev, { selected: timeout ? -1 : selected, correct: q.answer, isCorrect }]);
  };

  const next = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1); setSelected(null); setRevealed(false);
    } else {
      onFinish(answers, questions);
    }
  };

  const timerPct = (timeLeft / config.timer) * 100;
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#a3e635';
  const correctSoFar = answers.filter(a => a.isCorrect).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Top bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DataIcon name={mod?.icon} size={20} className="text-lime-400" />
            <span className="text-white/60 text-sm font-semibold">{mod?.title}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-lime-400 font-bold">{correctSoFar} ✓</span>
            <span style={{ color: timerColor }} className="font-bold tabular-nums">⏱ {timeLeft}s</span>
          </div>
        </div>

        {/* Per-question indicator */}
        <div className="flex gap-1 mb-2">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300
              ${i < answers.length ? (answers[i]?.isCorrect ? 'bg-lime-400' : 'bg-red-400') : i === qIndex ? 'bg-white/20' : 'bg-forest-800'}`} />
          ))}
        </div>
        <div className="h-1 bg-forest-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>
        <p className="text-xs text-white/20 mt-1.5 text-right">Q{qIndex + 1} of {questions.length}</p>
      </div>

      <div className="glass-card p-6">
        <QuizCard question={q.q} options={q.options} onSelect={setSelected}
          selected={selected} correct={q.answer} revealed={revealed} />
      </div>

      <div className="flex gap-3">
        {!revealed ? (
          <button className="btn-primary flex-1 py-3" disabled={selected === null}
            onClick={() => reveal()} id="quiz-submit-btn">Submit Answer</button>
        ) : (
          <>
            <div className={`flex-1 text-center py-3 rounded-xl font-bold text-sm
              ${selected === q.answer ? 'bg-lime-400/15 text-lime-400' : 'bg-red-400/15 text-red-400'}`}>
              {selected === q.answer ? '✅ +5 XP' : selected === -1 ? '⏰ Time up!' : '❌ Wrong'}
            </div>
            <button className="btn-primary px-8" onClick={next} id="quiz-next-btn">
              {qIndex < questions.length - 1 ? 'Next →' : 'Results'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Results ───────────────────────────────────────────────────────────────────
const Results = ({ moduleId, answers, questions, onRetry, onNextTopic, onPickNew }) => {
  const { refreshUser, showNotification, showBadgePopup, showLevelUp } = useApp();
  const mod = MODULES.find(m => m.id === moduleId);
  const modIdx = MODULES.findIndex(m => m.id === moduleId);
  const nextMod = MODULES[modIdx + 1] || null;
  const score = answers.filter(a => a.isCorrect).length;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const xpEarned = score * 5;

  useEffect(() => {
    if (xpEarned > 0) {
      // 1. Save best quiz scores first
      questions.forEach((q, i) => { if (answers[i]?.isCorrect) saveQuizScore(q.lessonId, 5); });
      // 2. Add XP
      const { leveledUp, newLevel } = addXP(xpEarned);
      // 3. Read fresh user (has updated scores + XP) then check badges
      const latestUser = getUser();
      const newBadges = checkAndAwardBadges(latestUser);
      refreshUser();
      playXPSound(latestUser);
      if (leveledUp) { confetti({ particleCount: 120, spread: 80, colors: ['#a3e635', '#f59e0b'] }); showLevelUp(newLevel); }
      newBadges.forEach((b, i) => setTimeout(() => { playBadgeSound(latestUser); showBadgePopup(b); confetti({ particleCount: 60 }); }, i * 1500));
      if (pct >= 80) confetti({ particleCount: 80, spread: 70, colors: ['#a3e635', '#bef264'] });
      showNotification(`+${xpEarned} XP earned!`, 'success');
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Score */}
      <div className="glass-card-glow p-7 text-center level-up-modal">
        <div className="flex justify-center mb-2"><DataIcon name={pct >= 80 ? 'trophy' : pct >= 60 ? 'star' : 'book-open'} size={64} className={pct >= 80 ? 'text-amber-400' : pct >= 60 ? 'text-lime-400' : 'text-blue-400'} /></div>
        <p className="text-lime-400 text-xs tracking-widest uppercase font-semibold mb-1">Quiz Complete</p>
        <h2 className="font-nunito font-black text-2xl text-white mb-1">
          {pct >= 80 ? 'Outstanding!' : pct >= 60 ? 'Great job!' : 'Keep learning!'}
        </h2>
        <div className="text-5xl font-black text-lime-400 my-3">
          {score}<span className="text-xl text-white/30">/{total}</span>
        </div>
        <div className="flex justify-center gap-5 text-sm text-white/50 mb-5">
          <span><DataIcon name="target" size={14} className="inline mr-1 text-white/50" /> {pct}%</span>
          <span><DataIcon name="star" size={14} className="inline mr-1 text-amber-400" /> +{xpEarned} XP</span>
          <span className="flex items-center gap-1"><DataIcon name={mod?.icon} size={14} className="text-lime-400" /> {mod?.title}</span>
        </div>

        {/* Answer strip */}
        <div className="flex justify-center gap-1.5 mb-5">
          {answers.map((a, i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
              ${a.isCorrect ? 'bg-lime-400/20 text-lime-400' : 'bg-red-400/20 text-red-400'}`}>
              {a.isCorrect ? '✓' : '✗'}
            </div>
          ))}
        </div>

        {/* Next topic preview */}
        {nextMod && (
          <div className="bg-forest-800/60 border border-lime-400/15 rounded-xl p-3 mb-4 text-left flex items-center gap-3">
            <DataIcon name={nextMod.icon} size={28} className="text-lime-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40">Next Topic</p>
              <p className="text-white text-sm font-bold truncate">{nextMod.title}</p>
              <p className="text-xs text-white/30 truncate">{nextMod.summary}</p>
            </div>
            <ChevronRight size={14} className="text-lime-400 shrink-0" />
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn-secondary flex-1 flex items-center justify-center gap-1"
            onClick={onRetry} id="quiz-retry-btn">
            <RotateCcw size={13} /> Retry
          </button>
          {nextMod
            ? <button className="btn-primary flex-1" onClick={() => onNextTopic(nextMod.id)} id="quiz-next-topic-btn">
                Next Topic →
              </button>
            : <button className="btn-primary flex-1 flex items-center justify-center gap-1"
                onClick={onPickNew} id="quiz-done-btn">
                <Trophy size={14} /> All Done!
              </button>}
        </div>

        {!nextMod && (
          <p className="text-lime-400/50 text-xs mt-2 flex items-center justify-center gap-1">You've covered all 6 topics! <DataIcon name="globe" size={14} /></p>
        )}
      </div>

      {/* Wrong answers */}
      {answers.some(a => !a.isCorrect) && (
        <div className="glass-card p-5 space-y-2">
          <h3 className="font-nunito font-bold text-white text-sm mb-2">Review Mistakes</h3>
          {questions.map((q, i) => answers[i]?.isCorrect ? null : (
            <div key={i} className="bg-red-400/8 rounded-xl p-3">
              <p className="text-white/60 text-sm mb-1">❌ {q.q}</p>
              <p className="text-lime-400 text-xs">✓ {q.options[q.answer]}</p>
            </div>
          ))}
        </div>
      )}

      <button className="btn-secondary w-full text-sm" onClick={onPickNew}>← Change Topic</button>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const QuizPage = () => {
  const [screen, setScreen] = useState('pick');
  const [moduleId, setModuleId] = useState(null);
  const [config, setConfig] = useState({ count: 10, timer: 30 });
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);

  const pick = (id) => { setModuleId(id); setScreen('config'); };
  const start = (cfg) => { setConfig(cfg); setAnswers([]); setScreen('quiz'); };
  const finish = (ans, qs) => { setAnswers(ans); setQuestions(qs); setScreen('results'); };
  const retry = () => { setAnswers([]); setScreen('config'); };
  const nextTopic = (id) => { setModuleId(id); setAnswers([]); setScreen('config'); };
  const pickNew = () => { setModuleId(null); setAnswers([]); setScreen('pick'); };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {screen === 'pick'    && <TopicPicker onSelect={pick} />}
      {screen === 'config'  && <QuizConfig moduleId={moduleId} onStart={start} onBack={() => setScreen('pick')} />}
      {screen === 'quiz'    && <ActiveQuiz moduleId={moduleId} config={config} onFinish={finish} />}
      {screen === 'results' && <Results moduleId={moduleId} answers={answers} questions={questions}
        onRetry={retry} onNextTopic={nextTopic} onPickNew={pickNew} />}
    </div>
  );
};

export default QuizPage;
