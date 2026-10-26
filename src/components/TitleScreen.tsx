import React from 'react';
import { LevelConfig } from '../game/types';
import { Volume2, VolumeX, Sparkles, Play } from 'lucide-react';
import { soundFX } from '../game/audio';

interface TitleScreenProps {
  levels: LevelConfig[];
  selectedLevel: LevelConfig;
  onSelectLevel: (lvl: LevelConfig) => void;
  onStartGame: () => void;
  onOpenUpgrades: () => void;
  money: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  levels,
  selectedLevel,
  onSelectLevel,
  onStartGame,
  onOpenUpgrades,
  money,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-10 z-20">
      {/* Top Header / Audio */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg text-xs md:text-sm text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Alpine Winter Edition</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold tabular-nums font-mono">${money}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpgrades}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs md:text-sm font-semibold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Garage Upgrades</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors shadow-md cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Hero Center Lockup with Bespoke SVG */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-auto text-center max-w-xl mx-auto">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg className="w-72 md:w-96 h-28 filter drop-shadow-xl" viewBox="0 0 400 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Snowy Mountain Silhouette Background */}
            <path d="M40 85L85 30L130 85H40Z" fill="#38BDF8" fillOpacity="0.25" />
            <path d="M85 30L95 44L85 49L75 44L85 30Z" fill="#F8FAFC" />
            <path d="M110 85L160 15L210 85H110Z" fill="#0284C7" fillOpacity="0.35" />
            <path d="M160 15L172 32L160 38L148 32L160 15Z" fill="#FFFFFF" />

            {/* Heavy V-Plow Blade Motif in orange & gold */}
            <path d="M190 70L240 86L290 70L282 62L240 76L198 62L190 70Z" fill="#F97316" stroke="#D97706" strokeWidth="2" />
            <path d="M236 76H244V88H236V76Z" fill="#FBBF24" />

            {/* Main Title Typography */}
            <text x="200" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="38" fontWeight="800" letterSpacing="1.5" fontFamily="'Fredoka', sans-serif">
              SNOWDRIFT
            </text>
            <text x="200" y="80" textAnchor="middle" fill="#38BDF8" fontSize="15" fontWeight="700" letterSpacing="5" fontFamily="'Fredoka', sans-serif">
              3D ISOMETRIC PLOW
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-sm md:text-base font-medium max-w-md drop-shadow mb-6">
          Hop into your heavy-duty winter truck. Carve fresh roads, string huge combo multipliers, and earn cash to upgrade your rig!
        </p>

        {/* Level Selection Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 w-full max-w-lg">
          {levels.map((lvl) => {
            const isSelected = selectedLevel.id === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  soundFX.playCoinSound();
                  onSelectLevel(lvl);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-900/70 border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Level {lvl.id}</span>
                <span className="text-xs font-bold truncate max-w-[100px]">{lvl.name}</span>
                <span className="text-[10px] text-amber-400 font-mono mt-0.5">Target: {lvl.targetSnow}%</span>
              </button>
            );
          })}
        </div>

        {/* Start Game CTA */}
        <button
          onClick={onStartGame}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-base md:text-lg shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>START PLOWING</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-950/20 text-slate-950 text-xs font-mono">SPACE / ENTER</span>
        </button>
      </div>

      {/* Flat Control Hint Line */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-300 bg-slate-950/60 border border-slate-800/60 py-2.5 px-6 rounded-2xl mx-auto backdrop-blur-none pointer-events-auto">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">WASD</kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">Arrows</kbd>
          <span className="text-slate-400">Drive & Steer</span>
        </div>
        <span className="hidden md:inline text-slate-600">•</span>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">SPACE</kbd>
          <span className="text-slate-400">Nitro Boost</span>
        </div>
        <span className="hidden md:inline text-slate-600">•</span>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">R</kbd>
          <span className="text-slate-400">Reset</span>
          <span className="text-slate-600">·</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">ESC</kbd>
          <span className="text-slate-400">Pause</span>
        </div>
      </div>
    </div>
  );
};
