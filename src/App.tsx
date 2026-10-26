/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GAME_LEVELS } from './game/levels';
import { GameState, LevelConfig, VehicleUpgrades, GameStats } from './game/types';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { UpgradeShop } from './components/UpgradeShop';
import { PauseVictoryModal } from './components/PauseVictoryModal';
import { soundFX } from './game/audio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level App State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(GAME_LEVELS[0]);
  const [upgrades, setUpgrades] = useState<VehicleUpgrades>({
    bladeLevel: 1,
    engineLevel: 1,
    tiresLevel: 1,
    spreaderLevel: 0,
    nitroLevel: 1,
  });

  const [stats, setStats] = useState<GameStats>({
    money: 150,
    score: 0,
    combo: 0,
    maxCombo: 0,
    comboMultiplier: 1.0,
    snowClearedCount: 0,
    totalSnowPlowedKg: 0,
    giftsFound: 0,
    timeElapsed: 0,
  });

  const [progressPercent, setProgressPercent] = useState(0);
  const [nitroPercent, setNitroPercent] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [comboPopup, setComboPopup] = useState<{ text: string; multiplier: number } | null>(null);
  const popupTimeoutRef = useRef<number | null>(null);

  // Initialize Three.js Game Engine once in isolated ref container
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
        if (engineRef.current && engineRef.current.snowSystem) {
          setProgressPercent(engineRef.current.snowSystem.getProgress());
        }
      },
      onLevelComplete: () => {
        setGameState('VICTORY');
      },
      onComboPopup: (text, multiplier) => {
        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
        setComboPopup({ text, multiplier });
        popupTimeoutRef.current = window.setTimeout(() => {
          setComboPopup(null);
        }, 1800);
      },
    });

    engine.loadLevel(currentLevel, upgrades);
    engineRef.current = engine;

    // Loop for Title screen live-camera pan
    let titleFrameId = 0;
    const titleLoop = () => {
      if (engine.isTitleScreen) {
        engine.tickTitleScreen();
      }
      titleFrameId = requestAnimationFrame(titleLoop);
    };
    titleLoop();

    return () => {
      cancelAnimationFrame(titleFrameId);
      engine.dispose();
    };
  }, []);

  // Keyboard shortcuts (Escape to Pause, R to Reset, H to toggle HUD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          setGameState('PLAYING');
        } else if (gameState === 'UPGRADES') {
          setGameState('PLAYING');
        }
      } else if (e.code === 'KeyR' && gameState === 'PLAYING') {
        handleRestart();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        if (gameState === 'TITLE') {
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Start Game
  const handleStartGame = useCallback(() => {
    if (!engineRef.current) return;
    setGameState('PLAYING');
    engineRef.current.start();
  }, []);

  // Restart Current Contract
  const handleRestart = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resetLevel();
    setProgressPercent(0);
    setGameState('PLAYING');
    engineRef.current.start();
  }, []);

  // Switch Level
  const handleSelectLevel = useCallback((lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    if (engineRef.current) {
      engineRef.current.loadLevel(lvl, upgrades);
    }
  }, [upgrades]);

  // Next Level Transition
  const handleNextLevel = useCallback(() => {
    const nextIdx = (GAME_LEVELS.findIndex((l) => l.id === currentLevel.id) + 1) % GAME_LEVELS.length;
    const nextLvl = GAME_LEVELS[nextIdx];
    setCurrentLevel(nextLvl);
    if (engineRef.current) {
      engineRef.current.loadLevel(nextLvl, upgrades);
      engineRef.current.start();
    }
    setProgressPercent(0);
    setGameState('PLAYING');
  }, [currentLevel, upgrades]);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  }, []);

  // Upgrade Purchase
  const handleUpgrade = useCallback((type: keyof VehicleUpgrades, cost: number) => {
    setUpgrades((prev) => {
      const next = { ...prev, [type]: prev[type] + 1 };
      if (engineRef.current) {
        engineRef.current.applyUpgrades(next);
      }
      return next;
    });
    setStats((prev) => ({
      ...prev,
      money: prev.money - cost,
    }));
    if (engineRef.current) {
      engineRef.current.stats.money -= cost;
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Isolated WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Title Screen Overlay */}
      {gameState === 'TITLE' && (
        <TitleScreen
          levels={GAME_LEVELS}
          selectedLevel={currentLevel}
          onSelectLevel={handleSelectLevel}
          onStartGame={handleStartGame}
          onOpenUpgrades={() => setGameState('UPGRADES')}
          money={stats.money}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* In-Game HUD (Low-occlusion, world-matched) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <HUD
          stats={stats}
          level={currentLevel}
          progressPercent={progressPercent}
          nitroPercent={nitroPercent}
          isMuted={isMuted}
          comboPopup={comboPopup}
          onToggleMute={handleToggleMute}
          onPause={() => {
            engineRef.current?.pause();
            setGameState('PAUSED');
          }}
          onRestart={handleRestart}
          onOpenUpgrades={() => {
            engineRef.current?.pause();
            setGameState('UPGRADES');
          }}
          onVirtualInput={(input) => {
            if (engineRef.current) {
              engineRef.current.virtualInput = input;
            }
          }}
        />
      )}

      {/* Upgrades Garage Modal */}
      {gameState === 'UPGRADES' && (
        <UpgradeShop
          upgrades={upgrades}
          money={stats.money}
          onUpgrade={handleUpgrade}
          onClose={() => {
            if (engineRef.current && engineRef.current.isRunning && !engineRef.current.isTitleScreen) {
              engineRef.current.resume();
              setGameState('PLAYING');
            } else {
              setGameState('TITLE');
            }
          }}
        />
      )}

      {/* Pause & Victory Modals */}
      {(gameState === 'PAUSED' || gameState === 'VICTORY') && (
        <PauseVictoryModal
          type={gameState === 'VICTORY' ? 'VICTORY' : 'PAUSE'}
          level={currentLevel}
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onResume={() => {
            engineRef.current?.resume();
            setGameState('PLAYING');
          }}
          onRestart={handleRestart}
          onNextLevel={gameState === 'VICTORY' ? handleNextLevel : undefined}
          onOpenUpgrades={() => setGameState('UPGRADES')}
          onMainMenu={() => {
            if (engineRef.current) {
              engineRef.current.isRunning = false;
              engineRef.current.isTitleScreen = true;
              engineRef.current.loadLevel(currentLevel, upgrades);
            }
            setGameState('TITLE');
          }}
        />
      )}
    </div>
  );
}
