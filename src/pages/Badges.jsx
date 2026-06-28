import { BADGES, getUser } from '../utils/storage';
import { BadgeCard } from '../components/UI';
import { DataIcon } from '../utils/icons';

const Badges = () => {
  const u = getUser();
  const unlocked = u?.badges || [];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-nunito font-black text-3xl text-white flex items-center gap-3"><DataIcon name="medal" size={32} className="text-amber-400" /> Badges</h1>
        <p className="text-white/50 text-sm mt-1">{unlocked.length} / {BADGES.length} unlocked</p>
      </div>

      {/* Progress */}
      <div className="glass-card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Collection Progress</span>
          <span className="text-lime-400 font-bold">{Math.round((unlocked.length / BADGES.length) * 100)}%</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill h-full rounded-full"
            style={{ width: `${(unlocked.length / BADGES.length) * 100}%`, transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <h2 className="font-nunito font-bold text-white text-lg mb-3 flex items-center gap-2"><DataIcon name="sparkles" size={20} className="text-white" /> Unlocked</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BADGES.filter(b => unlocked.includes(b.id)).map(b => (
              <BadgeCard key={b.id} badge={b} unlocked={true} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="font-nunito font-bold text-white text-lg mb-3 flex items-center gap-2"><DataIcon name="lock" size={20} className="text-white" /> Locked</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES.filter(b => !unlocked.includes(b.id)).map(b => (
            <BadgeCard key={b.id} badge={b} unlocked={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Badges;
