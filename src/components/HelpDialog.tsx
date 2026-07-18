import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, HelpCircle, Star } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            id="help-modal-content"
            className="relative w-full max-w-sm bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-900 rounded-2xl shadow-2xl overflow-hidden text-neutral-600 dark:text-zinc-300 z-10 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-zinc-900 bg-neutral-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-neutral-500 dark:text-zinc-400" />
                <h2 className="font-display font-light text-base tracking-[0.1em] uppercase text-neutral-800 dark:text-zinc-100">How To Play</h2>
              </div>
              <button
                id="close-help-btn"
                onClick={onClose}
                className="p-1.5 rounded-full bg-neutral-100 dark:bg-zinc-900 hover:bg-neutral-200 dark:hover:bg-zinc-800 text-neutral-500 dark:text-zinc-400 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-5 overflow-y-auto font-sans text-sm">
              {/* Objective */}
              <div className="p-3.5 bg-neutral-100/50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-900 rounded-xl space-y-1">
                <p className="font-bold text-neutral-800 dark:text-zinc-100 font-display text-xs uppercase tracking-wider">Your Goal:</p>
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-zinc-400">
                  Direct the energy flow from the starting <span className="text-red-500 dark:text-red-400 font-medium">Trigger</span> cell to the <span className="text-blue-500 dark:text-blue-400 font-medium">Target</span> cell.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-zinc-300 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 dark:text-zinc-100 font-display text-xs uppercase tracking-wider mb-1">
                      Tap to Rotate
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                      Tap any cell on the grid to rotate its arrow clockwise (<span className="font-mono text-neutral-700 dark:text-zinc-200">90°</span>). Align them to forge a path.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-zinc-300 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 dark:text-zinc-100 font-display text-xs uppercase tracking-wider mb-1">
                      Connect the Path
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                      The flow begins at the red <span className="text-red-500 dark:text-red-400 font-semibold">Trigger (top-left)</span>. Once aligned, tap the <span className="text-neutral-800 dark:text-zinc-100 font-semibold">Connect</span> button to initiate.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-zinc-300 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 dark:text-zinc-100 font-display text-xs uppercase tracking-wider mb-1">
                      Mind the Obstacles
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                      If the path hits an <span className="text-neutral-500 dark:text-zinc-400 font-semibold">Obstacle</span>, runs out of bounds, or loops back to an active cell, the flow breaks.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-zinc-300 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 dark:text-zinc-100 font-display text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                      Earn Stars <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed">
                      Each level has a move quota. Finish in fewer rotations to capture a perfect 3-star rating.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick visuals legend */}
              <div className="border-t border-neutral-200 dark:border-zinc-900 pt-4 space-y-2">
                <p className="text-[10px] font-bold text-neutral-400 dark:text-zinc-500 tracking-wider uppercase mb-2">Tile Legend</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-1.5 bg-neutral-50 dark:bg-zinc-900/40 rounded-lg border border-neutral-200 dark:border-zinc-900">
                    <span className="w-2.5 h-2.5 rounded bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-zinc-400">Trigger</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-neutral-50 dark:bg-zinc-900/40 rounded-lg border border-neutral-200 dark:border-zinc-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)] flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-zinc-400">Target</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-neutral-50 dark:bg-zinc-900/40 rounded-lg border border-neutral-200 dark:border-zinc-900">
                    <span className="w-2.5 h-2.5 rounded bg-neutral-200 dark:bg-black border border-neutral-300 dark:border-zinc-800 flex-shrink-0 flex items-center justify-center">
                      <span className="w-1 h-1 bg-neutral-400 dark:bg-zinc-700 rounded-sm rotate-45" />
                    </span>
                    <span className="text-neutral-600 dark:text-zinc-400">Obstacle</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-neutral-50 dark:bg-zinc-900/40 rounded-lg border border-neutral-200 dark:border-zinc-900">
                    <span className="w-2.5 h-2.5 rounded bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex-shrink-0 flex items-center justify-center">
                      <ArrowRight className="w-2 h-2 text-neutral-500 dark:text-zinc-500" />
                    </span>
                    <span className="text-neutral-600 dark:text-zinc-400">Rotatable Arrow</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="p-4 border-t border-neutral-200 dark:border-zinc-900 bg-neutral-50 dark:bg-zinc-950 flex justify-end">
              <button
                id="help-understood-btn"
                onClick={onClose}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-black font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                Let's Play
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
