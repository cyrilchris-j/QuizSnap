import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DataIcon } from '../utils/icons';
import { QuizCard, ProgressBar } from '../components/UI';
import { MODULES } from '../utils/modules';
import { getUser, addXP, markLessonComplete, markModuleComplete,
  saveQuizScore, checkAndAwardBadges, playXPSound, playBadgeSound, BADGES } from '../utils/storage';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, Lock, Clock, Star, BookOpen } from 'lucide-react';

// ── Module List ───────────────────────────────────────────────────────────────
export const LearnPage = () => {
  const navigate = useNavigate();
  const u = getUser();

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-nunito font-black text-3xl text-white flex items-center gap-3"><DataIcon name="book-open" size={32} className="text-lime-400" /> Learn</h1>
        <p className="text-white/50 text-sm mt-1">Deep-dive into each topic — read, understand, then quiz yourself</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MODULES.map(mod => {
          const done = mod.lessons.filter(l => u?.completedLessons?.includes(l.id)).length;
          const pct = Math.round((done / mod.lessons.length) * 100);
          const isComplete = u?.completedModules?.includes(mod.id);

          return (
            <button key={mod.id} id={`learn-${mod.id}`}
              onClick={() => navigate(`/learn/${mod.id}`)}
              className="glass-card-glow p-5 text-left group hover:translate-y-[-2px] transition-transform duration-200">
              <div className="flex gap-4">
                {/* Big icon */}
                <DataIcon name={mod.icon} size={48} className="shrink-0 group-hover:scale-110 transition-transform duration-200 text-lime-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-nunito font-black text-lg text-white">{mod.title}</h3>
                    {isComplete
                      ? <span className="text-lime-400 text-xs font-bold bg-lime-400/10 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1"><DataIcon name="check-circle" size={14} /> Done</span>
                      : <span className="text-white/30 text-xs shrink-0" style={{ color: mod.color }}>{mod.xpReward} XP</span>}
                  </div>
                  <p className="text-white/50 text-sm leading-snug mb-3">{mod.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-white/30 mb-3">
                    <span className="flex items-center gap-1"><Clock size={11} /> {mod.readTime}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {mod.lessons.length} lessons</span>
                    <span className="flex items-center gap-1"><Star size={11} /> {done}/{mod.lessons.length} complete</span>
                  </div>

                  {/* Progress */}
                  <div className="xp-bar-track">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${mod.color}88, ${mod.color})` }} />
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/20 group-hover:text-lime-400 transition-colors shrink-0 self-center" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Module Overview ───────────────────────────────────────────────────────────
export const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const mod = MODULES.find(m => m.id === moduleId);
  const u = getUser();
  if (!mod) return <div className="p-6 text-white/60">Module not found.</div>;

  const done = mod.lessons.filter(l => u?.completedLessons?.includes(l.id)).length;
  const pct = Math.round((done / mod.lessons.length) * 100);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <button onClick={() => navigate('/learn')}
        className="flex items-center gap-1 text-white/50 hover:text-lime-400 text-sm transition-colors">
        <ChevronLeft size={16} /> All Modules
      </button>

      {/* Hero */}
      <div className="glass-card-glow p-6">
        <div className="flex items-center gap-4 mb-4">
          <DataIcon name={mod.icon} size={64} className="text-lime-400 shrink-0" />
          <div>
            <h1 className="font-nunito font-black text-2xl text-white">{mod.title}</h1>
            <div className="flex gap-4 text-xs text-white/40 mt-1">
              <span className="flex items-center gap-1"><DataIcon name="book-open" size={12} /> {mod.readTime}</span>
              <span className="flex items-center gap-1"><DataIcon name="target" size={12} /> {mod.lessons.length} lessons</span>
              <span className="flex items-center gap-1"><DataIcon name="star" size={12} className="text-amber-400" /> {mod.xpReward} XP</span>
            </div>
          </div>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-4">{mod.description}</p>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/40">Progress</span>
          <span style={{ color: mod.color }} className="font-bold">{pct}%</span>
        </div>
        <div className="xp-bar-track">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${mod.color}88, ${mod.color})` }} />
        </div>
      </div>

      {/* Lessons */}
      <h2 className="font-nunito font-bold text-white text-lg">Lessons</h2>
      <div className="space-y-3">
        {mod.lessons.map((lesson, idx) => {
          const isDone = u?.completedLessons?.includes(lesson.id);
          const prevDone = idx === 0 || u?.completedLessons?.includes(mod.lessons[idx - 1].id);
          const locked = !prevDone;
          const score = u?.quizScores?.[lesson.id] || 0;

          return (
            <button key={lesson.id} disabled={locked}
              onClick={() => navigate(`/learn/${moduleId}/${lesson.id}`)}
              className={`w-full glass-card p-4 text-left flex items-center gap-4
                ${locked ? 'opacity-40 cursor-not-allowed' : 'hover:border-lime-400/25 hover:bg-lime-400/5'}
                transition-all duration-200`}>

              {/* Step indicator */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${isDone ? 'bg-lime-400/20 text-lime-400' : locked ? 'bg-forest-800 text-white/20' : 'bg-forest-800 text-white/60'}`}
                style={isDone ? {} : { borderColor: mod.color }}>
                {isDone ? <DataIcon name="check" size={16} /> : locked ? <Lock size={14} /> : idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-nunito font-bold text-white text-sm">Lesson {idx + 1}: {lesson.title}</p>
                <p className="text-xs text-white/30 mt-0.5">5 quiz questions • +10 XP + up to +25 XP</p>
                {isDone && score > 0 && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: score >= 4 ? '#a3e635' : '#f59e0b' }}>
                    Best quiz score: {score}/5 {score === 5 ? <DataIcon name="trophy" size={12} className="text-amber-400" /> : null}
                  </p>
                )}
              </div>

              {locked
                ? <Lock size={14} className="text-white/20 shrink-0" />
                : isDone
                ? <span className="text-lime-400 text-xs font-semibold shrink-0">Review</span>
                : <ChevronRight size={16} className="text-white/30 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Start / Continue CTA */}
      {done < mod.lessons.length && (
        <button className="btn-primary w-full"
          onClick={() => {
            const next = mod.lessons.find(l => !u?.completedLessons?.includes(l.id));
            if (next) navigate(`/learn/${moduleId}/${next.id}`);
          }}>
          {done === 0 ? `Start ${mod.title} →` : `Continue → Lesson ${done + 1}`}
        </button>
      )}
    </div>
  );
};

// ── Lesson Page (Content Reader + Quiz) ──────────────────────────────────────
export const LessonPage = () => {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { refreshUser, showNotification, showBadgePopup, showLevelUp } = useApp();

  const mod = MODULES.find(m => m.id === moduleId);
  const lesson = mod?.lessons.find(l => l.id === lessonId);
  const lessonIdx = mod?.lessons.findIndex(l => l.id === lessonId) ?? 0;
  const nextLesson = mod?.lessons[lessonIdx + 1] || null;
  const isLastLesson = !nextLesson;

  const [phase, setPhase] = useState('lesson'); // lesson | quiz | results
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerKey, setTimerKey] = useState(0);
  const timerRef = useRef(null);

  const resetQuiz = () => { setQIndex(0); setAnswers([]); setSelected(null); setRevealed(false); setTimerKey(k => k + 1); };

  useEffect(() => {
    if (phase !== 'quiz' || revealed) { clearInterval(timerRef.current); return; }
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); doReveal(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIndex, timerKey]);

  if (!mod || !lesson) return <div className="p-6 text-white/60">Lesson not found.</div>;
  const q = lesson.quiz[qIndex];

  const doReveal = (timeout = false) => {
    clearInterval(timerRef.current);
    setRevealed(true);
    const isCorrect = !timeout && selected === q.answer;
    setAnswers(prev => [...prev, { selected: timeout ? -1 : selected, correct: q.answer, isCorrect }]);
  };

  const handleNext = () => {
    if (qIndex < lesson.quiz.length - 1) {
      setQIndex(i => i + 1); setSelected(null); setRevealed(false); setTimerKey(k => k + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const allAns = [...answers, { selected, correct: q.answer, isCorrect: selected === q.answer && revealed }];
    const score = allAns.filter(a => a.isCorrect).length;
    const xp = 10 + score * 5;

    // 1. Save quiz score
    saveQuizScore(lessonId, score);

    // 2. Mark lesson complete (updates completedLessons in localStorage)
    markLessonComplete(lessonId);

    // 3. Check if all lessons in module are done → mark module complete
    const freshUser = getUser();
    const allDone = mod.lessons.every(l => freshUser?.completedLessons?.includes(l.id));
    if (allDone) markModuleComplete(moduleId);

    // 4. Add XP
    const { user: upd, leveledUp, newLevel } = addXP(xp);

    // 5. Re-read user (has lesson + module + xp all applied) then check badges
    const latestUser = getUser();
    const newBadges = checkAndAwardBadges(latestUser);

    refreshUser();
    playXPSound(latestUser);
    if (leveledUp) { confetti({ particleCount: 120, spread: 80, colors: ['#a3e635', '#f59e0b'] }); showLevelUp(newLevel); }
    newBadges.forEach((b, i) => setTimeout(() => { playBadgeSound(latestUser); showBadgePopup(b); confetti({ particleCount: 60 }); }, i * 1600));

    setAnswers(allAns);
    setPhase('results');
  };

  const score = answers.filter(a => a.isCorrect).length;
  const passed = score >= 3;

  // ── PHASE: LESSON (content reader) ─────────────────────────────────────────
  if (phase === 'lesson') return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <button onClick={() => navigate('/learn')} className="hover:text-lime-400 transition-colors">Learn</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/learn/${moduleId}`)} className="hover:text-lime-400 transition-colors">{mod.title}</button>
        <ChevronRight size={12} />
        <span className="text-white/60">Lesson {lessonIdx + 1}</span>
      </div>

      {/* Lesson header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"
            style={{ color: mod.color, background: `${mod.color}20` }}>
            <DataIcon name={mod.icon} size={14} /> {mod.title}
          </span>
          <span className="text-xs text-white/30">Lesson {lessonIdx + 1} of {mod.lessons.length}</span>
        </div>
        <h1 className="font-nunito font-black text-2xl md:text-3xl text-white">{lesson.title}</h1>
      </div>

      {/* Content */}
      <article className="glass-card p-6 space-y-5">
        {lesson.content.map((para, i) => (
          <p key={i} className="text-white/80 leading-relaxed text-[15px]">{para}</p>
        ))}

        {/* Key Fact callout */}
        <div className="border-l-4 rounded-r-xl p-4 mt-2" style={{ borderColor: mod.color, background: `${mod.color}10` }}>
          <p className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: mod.color }}><DataIcon name="lightbulb" size={14} /> KEY FACT</p>
          <p className="text-white/80 text-sm leading-relaxed">{lesson.keyFact}</p>
        </div>
      </article>

      {/* Lesson nav */}
      <div className="flex items-center justify-between text-sm">
        {lessonIdx > 0 ? (
          <button onClick={() => navigate(`/learn/${moduleId}/${mod.lessons[lessonIdx - 1].id}`)}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>
        ) : <div />}
        <button className="btn-primary px-8 py-3" onClick={() => { setPhase('quiz'); setTimerKey(k => k + 1); }} id="start-quiz-btn">
          Take Quiz
        </button>
      </div>
    </div>
  );

  // ── PHASE: QUIZ ─────────────────────────────────────────────────────────────
  if (phase === 'quiz') return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Quiz header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <DataIcon name={mod.icon} size={16} className="text-lime-400" />
            <span className="text-white/60">{lesson.title}</span>
          </div>
          <span className={`font-bold text-sm tabular-nums ${timeLeft <= 10 ? 'text-red-400' : 'text-lime-400'}`}>
            ⏱ {timeLeft}s
          </span>
        </div>
        {/* Quiz progress bar */}
        <div className="flex gap-1 mb-2">
          {lesson.quiz.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
              ${i < answers.length ? (answers[i]?.isCorrect ? 'bg-lime-400' : 'bg-red-400') : i === qIndex ? 'bg-white/30' : 'bg-forest-800'}`} />
          ))}
        </div>
        {/* Timer bar */}
        <div className="h-1 bg-forest-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%`, background: timeLeft <= 10 ? '#ef4444' : '#a3e635' }} />
        </div>
        <p className="text-xs text-white/30 mt-1 text-right">Q{qIndex + 1} / {lesson.quiz.length}</p>
      </div>

      <div className="glass-card p-6">
        <QuizCard question={q.q} options={q.options} onSelect={setSelected}
          selected={selected} correct={q.answer} revealed={revealed} />
      </div>

      <div className="flex gap-3">
        {!revealed ? (
          <button className="btn-primary flex-1 py-3" disabled={selected === null}
            onClick={() => doReveal()} id="submit-answer-btn">Submit Answer</button>
        ) : (
          <>
            <div className={`flex-1 text-center flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm
              ${selected === q.answer ? 'bg-lime-400/15 text-lime-400' : 'bg-red-400/15 text-red-400'}`}>
              {selected === q.answer ? <><DataIcon name="check-circle" size={16} /> Correct! +5 XP</> : selected === -1 ? <><DataIcon name="clock" size={16} /> Time up!</> : <><DataIcon name="x-circle" size={16} /> Wrong</>}
            </div>
            <button className="btn-primary px-8" onClick={handleNext} id="next-question-btn">
              {qIndex < lesson.quiz.length - 1 ? 'Next →' : 'Finish'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ── PHASE: RESULTS ──────────────────────────────────────────────────────────
  const xpEarned = 10 + score * 5;
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="glass-card-glow p-7 text-center">
        <div className="flex justify-center mb-2"><DataIcon name={score === 5 ? 'trophy' : passed ? 'star' : 'book-open'} size={64} className={score === 5 ? 'text-amber-400' : passed ? 'text-lime-400' : 'text-blue-400'} /></div>
        <h2 className="font-nunito font-black text-2xl text-white mb-1">
          {score === 5 ? 'Perfect!' : passed ? 'Well Done!' : 'Try Again!'}
        </h2>
        <p className="text-lime-400 text-4xl font-black my-2">
          {score}<span className="text-xl text-white/30">/{lesson.quiz.length}</span>
        </p>
        <p className="text-white/40 text-sm mb-5">+{xpEarned} XP earned</p>

        {/* Answer dots */}
        <div className="flex justify-center gap-2 mb-5">
          {lesson.quiz.map((_, i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
              ${answers[i]?.isCorrect ? 'bg-lime-400/20 text-lime-400' : 'bg-red-400/20 text-red-400'}`}>
              {answers[i]?.isCorrect ? '✓' : '✗'}
            </div>
          ))}
        </div>

        {/* Next lesson preview */}
        {passed && nextLesson && (
          <div className="bg-lime-400/8 border border-lime-400/20 rounded-xl p-3 mb-4 text-left flex items-center gap-3">
            <DataIcon name={mod.icon} size={24} className="text-lime-400 shrink-0" />
            <div>
              <p className="text-lime-400 text-xs font-semibold">Up Next</p>
              <p className="text-white text-sm font-bold">Lesson {lessonIdx + 2}: {nextLesson.title}</p>
            </div>
          </div>
        )}

        {isLastLesson && passed && (
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 mb-4">
            <p className="text-amber-400 font-nunito font-bold flex items-center justify-center gap-2"><DataIcon name="party" size={20} /> Module Complete!</p>
            <p className="text-white/50 text-xs mt-0.5">All lessons in {mod.title} done</p>
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => { setPhase('quiz'); resetQuiz(); }} id="retry-btn">↺ Retry</button>
          {passed && nextLesson
            ? <button className="btn-primary flex-1" onClick={() => { resetQuiz(); navigate(`/learn/${moduleId}/${nextLesson.id}`); }} id="next-lesson-btn">Next Lesson →</button>
            : <button className="btn-primary flex-1" onClick={() => navigate(`/learn/${moduleId}`)} id="back-module-btn">
                {isLastLesson && passed ? '✅ Module Done' : 'Back to Module'}
              </button>}
        </div>

        {!passed && nextLesson && (
          <p className="text-white/25 text-xs mt-3">Score 3/5 or above to unlock next lesson</p>
        )}
      </div>

      {/* Wrong answers review */}
      {answers.some(a => !a.isCorrect) && (
        <div className="glass-card p-5 space-y-2">
          <h3 className="font-nunito font-bold text-white text-sm mb-2">Review Mistakes</h3>
          {lesson.quiz.map((q, i) => answers[i]?.isCorrect ? null : (
            <div key={i} className="bg-red-400/8 rounded-xl p-3">
              <p className="text-white/60 text-sm mb-1">❌ {q.q}</p>
              <p className="text-lime-400 text-xs">✓ {q.options[q.answer]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
