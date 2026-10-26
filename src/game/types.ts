export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'UPGRADES' | 'VICTORY' | 'GAME_OVER';

export type TimeOfDay = 'day' | 'sunset' | 'night';

export interface VehicleUpgrades {
  bladeLevel: number;    // 1 to 5 (Wider blade, clears wider swath)
  engineLevel: number;   // 1 to 5 (Faster top speed & acceleration)
  tiresLevel: number;    // 1 to 5 (Grip on ice, tighter cornering)
  spreaderLevel: number; // 0 to 5 (Spreads salt to melt snow around/behind)
  nitroLevel: number;    // 1 to 5 (Longer nitro boost, faster recharge)
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  targetSnow: number; // e.g. 75% snow cleared to win contract
  bonusGiftsCount: number;
  mapSize: number; // e.g. 90 x 90 units
  timeOfDay: TimeOfDay;
  rewardCash: number;
}

export interface GameStats {
  money: number;
  score: number;
  combo: number;
  maxCombo: number;
  comboMultiplier: number;
  snowClearedCount: number;
  totalSnowPlowedKg: number;
  giftsFound: number;
  timeElapsed: number;
}

export interface UpgradeDef {
  id: keyof VehicleUpgrades;
  name: string;
  desc: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  levels: {
    level: number;
    title: string;
    bonusDesc: string;
  }[];
}
