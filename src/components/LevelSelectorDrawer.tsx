import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Star, ChevronRight } from 'lucide-react';

interface LevelSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedLevel: number;
  currentLevel: number;
  onSelectLevel: (level: number) => void;
  levelStars: Record<number, number>; // Maps level number to stars earned
}

export default function LevelSelectorDrawer({
  isOpen,
  onClose,
  unlockedLevel,
  currentLevel,
  onSelectLevel,
  levelStars,
}: LevelSelectorDrawerProps) {
  const TOTAL_LEVELS = 185;

  const [selectedPhaseTab, setSelectedPhaseTab] = useState<1 | 2 | 3>(() => {
    if (currentLevel <= 35) return 1;
    if (currentLevel <= 85) return 2;
    return 3;
  });

  const phaseLevelsInfo = {
    1: { start: 1, length: 35, title: 'Phase 1: Direct' },
    2: { start: 36, length: 50, title: 'Phase 2: Split' },
    3: { start: 86, length: 100, title: 'Phase 3: Complex' },
  };

  const currentPhaseInfo = phaseLevelsInfo[selectedPhaseTab];
  const levels = Array.from({ length: currentPhaseInfo.length }, (_, i) => currentPhaseInfo.start + i);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            id="level-selector-drawer"
            className="relative w-full max-w-md bg-white dark:bg-zinc-950 border-t border-neutral-200 dark:border-zinc-900 rounded-t-3xl shadow-2xl z-10 flex flex-col h-[75vh]"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-2.5">
              <div className="w-12 h-1 rounded-full bg-neutral-200 dark:bg-zinc-900" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-neutral-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
              <div>
                <h2 className="font-display font-light text-base tracking-[0.1em] uppercase text-neutral-800 dark:text-zinc-100">Select Level</h2>
                <p className="text-[10px] text-neutral-500 dark:text-zinc-500 font-mono tracking-wider uppercase mt-1">
                  Unlocked: {unlockedLevel} / {TOTAL_LEVELS}
                </p>
              </div>
              <button
                id="close-drawer-btn"
                onClick={onClose}
                className="p-1.5 rounded-full bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 text-neutral-500 dark:text-zinc-400 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Phase Tabs Inside Drawer */}
            <div className="w-full px-6 pt-4 pb-2 bg-white dark:bg-zinc-950 flex gap-1.5">
              <button
                onClick={() => setSelectedPhaseTab(1)}
                className={`flex-1 py-1.5 text-[9px] font-mono font-medium tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                  selectedPhaseTab === 1
                    ? 'bg-amber-400/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                    : 'text-neutral-500 dark:text-zinc-500 hover:text-neutral-800 dark:hover:text-zinc-300 border border-transparent'
                }`}
              >
                Ph 1 (1-35)
              </button>
              <button
                onClick={() => setSelectedPhaseTab(2)}
                className={`flex-1 py-1.5 text-[9px] font-mono font-medium tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                  selectedPhaseTab === 2
                    ? 'bg-amber-400/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                    : 'text-neutral-500 dark:text-zinc-500 hover:text-neutral-800 dark:hover:text-zinc-300 border border-transparent'
                }`}
              >
                Ph 2 (36-85)
              </button>
              <button
                onClick={() => setSelectedPhaseTab(3)}
                className={`flex-1 py-1.5 text-[9px] font-mono font-medium tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                  selectedPhaseTab === 3
                    ? 'bg-amber-400/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                    : 'text-neutral-500 dark:text-zinc-500 hover:text-neutral-800 dark:hover:text-zinc-300 border border-transparent'
                }`}
              >
                Ph 3 (86-185)
              </button>
            </div>

            {/* Grid of Levels */}
            <div className="flex-1 overflow-y-auto px-6 py-3 no-scrollbar">
              <div className="grid grid-cols-4 gap-3.5 pb-8">
                {levels.map((lvl) => {
                  const isUnlocked = lvl <= unlockedLevel;
                  const isCurrent = lvl === currentLevel;
                  const stars = levelStars[lvl] || 0;

                  return (
                    <button
                      key={lvl}
                      id={`level-select-btn-${lvl}`}
                      disabled={!isUnlocked}
                      onClick={() => {
                        onSelectLevel(lvl);
                        onClose();
                      }}
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-between p-2 relative select-none transition-all duration-200
                        ${
                          isCurrent
                            ? 'bg-neutral-900 dark:bg-zinc-100 text-white dark:text-black shadow-lg font-black scale-102 ring-1 ring-neutral-400 dark:ring-zinc-400'
                            : isUnlocked
                            ? 'bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-850 text-neutral-800 dark:text-zinc-200 border border-neutral-200 dark:border-zinc-800 hover:scale-105 active:scale-95 cursor-pointer'
                            : 'bg-neutral-200/50 dark:bg-black/65 text-neutral-400 dark:text-zinc-800 border border-neutral-300 dark:border-zinc-900/40 cursor-not-allowed opacity-60'
                        }
                      `}
                    >
                      {/* Level Num / Lock */}
                      <div className="flex-1 flex items-center justify-center font-mono font-bold text-sm">
                        {isUnlocked ? (
                          lvl
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-neutral-300 dark:text-zinc-850" />
                        )}
                      </div>

                      {/* Stars */}
                      {isUnlocked && (
                        <div className="flex gap-0.5 justify-center h-3">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-2.5 h-2.5 ${
                                starIdx <= stars
                                  ? 'fill-amber-400/90 text-amber-400/90'
                                  : 'text-neutral-300 dark:text-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick action helper footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-zinc-900 bg-neutral-50 dark:bg-zinc-950/40 text-[11px] text-neutral-500 dark:text-zinc-500 flex items-center justify-between px-6">
              <span>Need help on current level?</span>
              <button
                id="drawer-next-unlocked-btn"
                onClick={() => {
                  onSelectLevel(unlockedLevel);
                  onClose();
                }}
                className="flex items-center gap-0.5 text-neutral-800 dark:text-zinc-300 font-semibold hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
              >
                Go to Level {unlockedLevel} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
