import React, { useState } from 'react';
import { GameStats, LevelConfig } from '../game/types';
import { Volume2, VolumeX, Pause, Sparkles, Flame, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { soundFX } from '../game/audio';

interface HUDProps {
  stats: GameStats;
  level: LevelConfig;
  progressPercent: number;
  nitroPercent: number;
  isMuted: boolean;
  comboPopup: { text: string; multiplier: number } | null;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenUpgrades: () => void;
  onVirtualInput: (input: { forward: number; steer: number; boost: boolean }) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  level,
  progressPercent,
  nitroPercent,
  isMuted,
  comboPopup,
  onToggleMute,
  onPause,
  onRestart,
  onOpenUpgrades,
  onVirtualInput,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [touchActive, setTouchActive] = useState(false);

  // Combo color palette
  const getComboColor = (multiplier: number) => {
    if (multiplier >= 8) return 'from-rose-500 to-amber-500 text-amber-200 border-amber-400';
    if (multiplier >= 5) return 'from-orange-500 to-amber-400 text-amber-100 border-orange-400';
    if (multiplier >= 3) return 'from-amber-500 to-yellow-400 text-yellow-100 border-yellow-400';
    if (multiplier >= 2) return 'from-cyan-500 to-emerald-400 text-cyan-100 border-cyan-400';
    return 'from-blue-600 to-cyan-500 text-blue-100 border-blue-400';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10 select-none">
      {/* Top Perimeter Status Cluster */}
      <div className="flex justify-between items-start w-full">
        {/* Top-Left: Money, Snow Plowed, Combo Indicator */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Money & Snow metric chip */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-base md:text-lg tabular-nums">
              <span className="text-amber-500 font-sans">$</span>
              <span>{stats.money}</span>
            </div>

            <span className="w-px h-4 bg-slate-700" />

            <div className="flex items-center gap-1.5 text-slate-300 font-medium text-xs md:text-sm font-mono tabular-nums">
              <span className="text-slate-400 font-sans text-xs">Snow:</span>
              <span className="text-slate-100">{(stats.totalSnowPlowedKg / 1000).toFixed(1)}t</span>
            </div>
          </div>

          {/* Combo Multiplier Gauge */}
          {stats.combo > 0 && (
            <div
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${getComboColor(
                stats.comboMultiplier
              )} bg-opacity-20 border shadow-lg transition-all transform scale-100`}
            >
              <div className="text-xs md:text-sm font-black tracking-wider uppercase">
                {stats.comboMultiplier.toFixed(1)}x COMBO
              </div>
              <div className="text-[11px] font-mono tabular-nums text-slate-200">
                +{stats.combo}
              </div>
            </div>
          )}
        </div>

        {/* Center Floating Popups */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          {comboPopup && (
            <div
              key={comboPopup.text}
              className={`px-5 py-2 rounded-2xl bg-slate-900/95 border text-base md:text-xl font-black tracking-wide shadow-2xl transition-all duration-300 transform scale-105 ${
                comboPopup.multiplier >= 3
                  ? 'border-amber-400 text-amber-300 glow-orange'
                  : 'border-cyan-400 text-cyan-300 glow-cyan'
              }`}
            >
              {comboPopup.text}
            </div>
          )}
        </div>

        {/* Top-Right: Objective Progress Bar & Action Controls */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Objective Progress Bar */}
          <div className="flex flex-col items-end px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl min-w-[160px] md:min-w-[210px]">
            <div className="flex justify-between items-center w-full text-xs font-semibold mb-1">
              <span className="text-slate-400 truncate max-w-[110px]">{level.name}</span>
              <span className="font-mono text-cyan-300 tabular-nums">
                {progressPercent}% <span className="text-slate-500">/ {level.targetSnow}%</span>
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (progressPercent / level.targetSnow) * 100)}%` }}
              />
            </div>
          </div>

          {/* Quick controls: Pause, Mute, Restart */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRestart}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
              title="Restart (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={onPause}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all shadow-md font-semibold text-xs cursor-pointer"
              title="Pause (Esc)"
            >
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline">Pause</span>
            </button>
          </div>
        </div>
      </div>

      {/* On-Screen Mobile Virtual Controls (renders when touched or on touch devices) */}
      <div
        className="pointer-events-auto flex justify-between items-end w-full px-2 md:hidden"
        onTouchStart={() => setTouchActive(true)}
      >
        {touchActive && (
          <>
            {/* D-Pad Steering */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
              <div />
              <button
                onTouchStart={() => onVirtualInput({ forward: 1, steer: 0, boost: false })}
                onTouchEnd={() => onVirtualInput({ forward: 0, steer: 0, boost: false })}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-amber-500 font-bold text-slate-200 flex items-center justify-center text-lg shadow"
              >
                ▲
              </button>
              <div />
              <button
                onTouchStart={() => onVirtualInput({ forward: 0, steer: 1, boost: false })}
                onTouchEnd={() => onVirtualInput({ forward: 0, steer: 0, boost: false })}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-amber-500 font-bold text-slate-200 flex items-center justify-center text-lg shadow"
              >
                ◀
              </button>
              <button
                onTouchStart={() => onVirtualInput({ forward: -1, steer: 0, boost: false })}
                onTouchEnd={() => onVirtualInput({ forward: 0, steer: 0, boost: false })}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-amber-500 font-bold text-slate-200 flex items-center justify-center text-lg shadow"
              >
                ▼
              </button>
              <button
                onTouchStart={() => onVirtualInput({ forward: 0, steer: -1, boost: false })}
                onTouchEnd={() => onVirtualInput({ forward: 0, steer: 0, boost: false })}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-amber-500 font-bold text-slate-200 flex items-center justify-center text-lg shadow"
              >
                ▶
              </button>
            </div>

            {/* Mobile Boost Button */}
            <button
              onTouchStart={() => onVirtualInput({ forward: 1, steer: 0, boost: true })}
              onTouchEnd={() => onVirtualInput({ forward: 0, steer: 0, boost: false })}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 active:scale-95 text-slate-950 font-black flex flex-col items-center justify-center shadow-xl border-2 border-amber-300"
            >
              <Flame className="w-6 h-6 fill-slate-950" />
              <span className="text-[10px] tracking-tighter">BOOST</span>
            </button>
          </>
        )}
      </div>

      {/* Ergonomic Collapsible Bottom Dock (Zero Mid-Screen Viewport Occlusion) */}
      <div className="flex flex-col items-center pointer-events-auto mx-auto max-w-xl w-full">
        {/* Dock Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-slate-900/90 border-t border-x border-slate-700/80 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors shadow-md cursor-pointer"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls & Nitro (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Zen View</span>
            </>
          )}
        </button>

        {!collapsed && (
          <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl">
            {/* Nitro Gauge */}
            <div className="flex items-center gap-2.5 flex-1 max-w-[190px]">
              <Flame className={`w-4 h-4 ${nitroPercent > 20 ? 'text-orange-400' : 'text-slate-500'}`} />
              <div className="flex flex-col flex-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-semibold mb-0.5">
                  <span>NITRO</span>
                  <span className="text-amber-300 tabular-nums">{Math.round(nitroPercent)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150"
                    style={{ width: `${nitroPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Flat Control Hints */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">W</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">A</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">S</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">D</kbd>
                <span className="text-slate-400">Plow</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">SPACE</kbd>
                <span className="text-slate-400">Boost</span>
              </span>
            </div>

            {/* Garage Upgrades Button */}
            <button
              onClick={() => {
                soundFX.playCoinSound();
                onOpenUpgrades();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Upgrades</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
