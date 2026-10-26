import React from 'react';
import { VehicleUpgrades, UpgradeDef } from '../game/types';
import { soundFX } from '../game/audio';
import { X, Sparkles, Zap, Wrench, Shield, Flame, Check } from 'lucide-react';

interface UpgradeShopProps {
  upgrades: VehicleUpgrades;
  money: number;
  onUpgrade: (type: keyof VehicleUpgrades, cost: number) => void;
  onClose: () => void;
}

const UPGRADE_DEFINITIONS: UpgradeDef[] = [
  {
    id: 'bladeLevel',
    name: 'Heavy V-Plow Blade',
    desc: 'Widens blade clearance swath and plows through heavy drifts easier.',
    baseCost: 200,
    costMultiplier: 1.8,
    maxLevel: 5,
    levels: [
      { level: 1, title: 'Stock Steel Blade', bonusDesc: '2.5m Width' },
      { level: 2, title: 'Reinforced Wing Blade', bonusDesc: '2.8m Width · +10% Snow Intake' },
      { level: 3, title: 'Commercial Highway V-Plow', bonusDesc: '3.2m Width · +20% Snow Intake' },
      { level: 4, title: 'Titan Deep-Drift Scraper', bonusDesc: '3.6m Width · +35% Snow Intake' },
      { level: 5, title: 'Apex Mammoth Blade', bonusDesc: '4.0m Giant Width · Auto-Clearing' },
    ],
  },
  {
    id: 'engineLevel',
    name: 'Turbo Diesel Engine',
    desc: 'Increases horsepower, peak speed, and plowing torque under snow load.',
    baseCost: 180,
    costMultiplier: 1.75,
    maxLevel: 5,
    levels: [
      { level: 1, title: 'Standard 4-Cylinder', bonusDesc: 'Top Speed: 28 km/h' },
      { level: 2, title: 'Turbocharged Diesel', bonusDesc: 'Top Speed: 34 km/h · +20% Accel' },
      { level: 3, title: 'Heavy Cummins 6.7L', bonusDesc: 'Top Speed: 40 km/h · +40% Accel' },
      { level: 4, title: 'Twin-Turbo V8 Beast', bonusDesc: 'Top Speed: 46 km/h · Instant Torque' },
      { level: 5, title: 'Overclocked Apex Rig', bonusDesc: 'Top Speed: 54 km/h · Maximum Thrust' },
    ],
  },
  {
    id: 'tiresLevel',
    name: 'Studded Snow Chains',
    desc: 'Sharper steering response and tight grip when turning across icy pavement.',
    baseCost: 150,
    costMultiplier: 1.7,
    maxLevel: 5,
    levels: [
      { level: 1, title: 'All-Weather Standard', bonusDesc: 'Moderate ice drift' },
      { level: 2, title: 'Deep Tread Siped Tires', bonusDesc: 'Traction +25% · Less slide' },
      { level: 3, title: 'Tungsten Studded Grip', bonusDesc: 'Traction +50% · Razor turns' },
      { level: 4, title: 'Diamond Steel Chains', bonusDesc: 'Traction +75% · Zero ice slippage' },
      { level: 5, title: 'Arctic Track System', bonusDesc: 'Unstoppable all-surface grip' },
    ],
  },
  {
    id: 'spreaderLevel',
    name: 'Heated Salt Spreader',
    desc: 'Rear spinner broadcasts warm salt, clearing snow behind you automatically.',
    baseCost: 220,
    costMultiplier: 1.85,
    maxLevel: 5,
    levels: [
      { level: 0, title: 'No Spreader', bonusDesc: 'Disabled' },
      { level: 1, title: 'Gravity Salt Drop', bonusDesc: '1.5m rear melting radius' },
      { level: 2, title: 'Powered Spinner Plate', bonusDesc: '2.2m rear melting radius' },
      { level: 3, title: 'Heated Brine Spray', bonusDesc: '3.0m wide melting coverage' },
      { level: 4, title: 'Industrial De-Icer Unit', bonusDesc: '4.0m wide melting coverage' },
      { level: 5, title: 'Thermal Blizzard Purger', bonusDesc: '5.2m giant thermal aura' },
    ],
  },
  {
    id: 'nitroLevel',
    name: 'Nitro Boost Injection',
    desc: 'Extended rocket boost bursts and faster passive tank replenishment.',
    baseCost: 160,
    costMultiplier: 1.75,
    maxLevel: 5,
    levels: [
      { level: 1, title: 'Single Nitrous Canister', bonusDesc: 'Standard recharge' },
      { level: 2, title: 'Dual High-Flow Tanks', bonusDesc: '+25% Capacity · Faster recharge' },
      { level: 3, title: 'Cryo-Charge Induction', bonusDesc: '+50% Capacity · Rapid recharge' },
      { level: 4, title: 'Overdrive Thruster Pods', bonusDesc: '+75% Capacity · Blazing burst' },
      { level: 5, title: 'Infinite Blizzard Core', bonusDesc: 'Instant recharge · Max speed surge' },
    ],
  },
];

export const UpgradeShop: React.FC<UpgradeShopProps> = ({
  upgrades,
  money,
  onUpgrade,
  onClose,
}) => {
  const getIcon = (id: keyof VehicleUpgrades) => {
    switch (id) {
      case 'bladeLevel':
        return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'engineLevel':
        return <Zap className="w-5 h-5 text-orange-400" />;
      case 'tiresLevel':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'spreaderLevel':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'nitroLevel':
        return <Flame className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-none pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-sans tracking-wide">
                Cozy Garage Upgrades
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Enhance your plow truck for severe blizzards and high multiplier combos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold tabular-nums text-sm md:text-base">
              <span>$</span>
              <span>{money}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {UPGRADE_DEFINITIONS.map((def) => {
            const currentLvl = upgrades[def.id];
            const isMax = currentLvl >= def.maxLevel;
            const cost = Math.round(def.baseCost * Math.pow(def.costMultiplier, currentLvl));
            const canAfford = money >= cost && !isMax;

            const nextLevelDef = def.levels.find((l) => l.level === (isMax ? currentLvl : currentLvl + 1));
            const currentLevelDef = def.levels.find((l) => l.level === currentLvl);

            return (
              <div
                key={def.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                    {getIcon(def.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm md:text-base">{def.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        Tier {currentLvl}/{def.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{def.desc}</p>
                    <div className="text-xs font-medium text-emerald-400 mt-1 flex items-center gap-1.5">
                      <span className="text-slate-500">Current:</span>
                      <span>{currentLevelDef?.title || 'None'}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-amber-300">{nextLevelDef?.bonusDesc}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:self-center gap-2">
                  {isMax ? (
                    <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Check className="w-3.5 h-3.5" />
                      <span>MAXED</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        if (canAfford) {
                          soundFX.playUpgradeSound();
                          onUpgrade(def.id, cost);
                        }
                      }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm font-mono transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>UPGRADE</span>
                      <span className="tabular-nums">${cost}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Upgrades apply instantly to all winter contracts.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
