import React from 'react';
import { GameStats, LevelConfig } from '../game/types';
import { Trophy, Play, RotateCcw, Sparkles, Home, Volume2, VolumeX } from 'lucide-react';
import { soundFX } from '../game/audio';

interface PauseVictoryModalProps {
  type: 'PAUSE' | 'VICTORY';
  level: LevelConfig;
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onNextLevel?: () => void;
  onOpenUpgrades: () => void;
  onMainMenu: () => void;
}

export const PauseVictoryModal: React.FC<PauseVictoryModalProps> = ({
  type,
  level,
  stats,
  isMuted,
  onToggleMute,
  onResume,
  onRestart,
  onNextLevel,
  onOpenUpgrades,
  onMainMenu,
}) => {
  const isVictory = type === 'VICTORY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 pointer-events-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col text-center">
        {/* Top Icon Badge */}
        <div className="mx-auto mb-3">
          {isVictory ? (
            <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/40 text-amber-400 shadow-lg inline-block">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-lg inline-block">
              <Sparkles className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide font-sans">
          {isVictory ? 'Contract Completed!' : 'Game Paused'}
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 mb-6">
          {isVictory
            ? `The roads in ${level.name} are clean and safe for winter traffic!`
            : `${level.name} · Take a breather or tweak your setup.`}
        </p>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Snow Cleared</div>
            <div className="text-base md:text-lg font-bold text-slate-100 font-mono tabular-nums">
              {(stats.totalSnowPlowedKg / 1000).toFixed(1)} <span className="text-xs text-slate-500 font-sans">tonnes</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Max Multiplier</div>
            <div className="text-base md:text-lg font-bold text-amber-400 font-mono tabular-nums">
              {stats.maxCombo > 0 ? `${stats.comboMultiplier}x` : '1.0x'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Mystery Gifts</div>
            <div className="text-base md:text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {stats.giftsFound} / {level.bonusGiftsCount}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-semibold">{isVictory ? 'Contract Payout' : 'Current Cash'}</div>
            <div className="text-base md:text-lg font-bold text-amber-300 font-mono tabular-nums">
              ${isVictory ? level.rewardCash : stats.money}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {isVictory ? (
            <>
              {onNextLevel && (
                <button
                  onClick={() => {
                    soundFX.playCoinSound();
                    onNextLevel();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>NEXT CONTRACT</span>
                </button>
              )}

              <button
                onClick={onOpenUpgrades}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>VISIT GARAGE SHOP</span>
              </button>

              <button
                onClick={onRestart}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Level</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  soundFX.playCoinSound();
                  onResume();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>RESUME PLOWING</span>
              </button>

              <button
                onClick={onOpenUpgrades}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Garage Upgrades</span>
              </button>

              <button
                onClick={onRestart}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Contract (R)</span>
              </button>
            </>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
            <button
              onClick={onMainMenu}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>

            <button
              onClick={onToggleMute}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
