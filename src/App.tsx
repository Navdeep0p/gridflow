import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUp, 
  RotateCcw, 
  Play, 
  HelpCircle, 
  Grid, 
  Sparkles, 
  Star, 
  AlertCircle, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Trophy,
  Activity,
  Award,
  Undo2,
  Menu,
  X,
  Info,
  Settings,
  Home,
  Lock,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import { Cell, GameStatus } from './types';
// @ts-ignore
import { generateSolvableLevel } from './levelGenerator';
import ParticleOverlay from './components/ParticleOverlay';
import HelpDialog from './components/HelpDialog';
import LevelSelectorDrawer from './components/LevelSelectorDrawer';
import { AdManager } from './utils/adEngine';
import { AdBanner } from './components/AdBanner';
import { Browser } from '@capacitor/browser';
import { triggerHaptic, HapticType } from './utils/haptics';
import { STORAGE_KEYS, setStorageItem, getStorageItemSync, hydrateStorageFromNative, saveLevelComplete } from './utils/storage';

const cloneGrid = (g: Cell[][]): Cell[][] => JSON.parse(JSON.stringify(g));

const THEMES = [
  {
    name: "Cosmic Neon",
    triggerBorder: "border-red-500",
    triggerText: "text-red-500",
    triggerBg: "bg-red-500",
    triggerGlow: "rgba(239,68,68,0.15)",
    triggerGlowPart: "rgba(239,68,68,0.25)",
    triggerBorderSpecial: "border-red-500!",
    
    targetBorder: "border-blue-500",
    targetBorderSpecial: "border-blue-500!",
    targetText: "text-blue-400",
    targetBg: "bg-blue-500",
    targetGlow: "rgba(59,130,246,0.15)",
    targetGlowPart: "rgba(59,130,246,0.25)",
    targetPing: "border-blue-400",
    targetRing: "ring-blue-500",
    targetGlowTutorial: "rgba(59,130,246,0.5)",
  },
  {
    name: "Cyber Glow",
    triggerBorder: "border-amber-500",
    triggerText: "text-amber-500",
    triggerBg: "bg-amber-500",
    triggerGlow: "rgba(245,158,11,0.15)",
    triggerGlowPart: "rgba(245,158,11,0.25)",
    triggerBorderSpecial: "border-amber-500!",
    
    targetBorder: "border-cyan-500",
    targetBorderSpecial: "border-cyan-500!",
    targetText: "text-cyan-400",
    targetBg: "bg-cyan-500",
    targetGlow: "rgba(6,182,212,0.15)",
    targetGlowPart: "rgba(6,182,212,0.25)",
    targetPing: "border-cyan-400",
    targetRing: "ring-cyan-500",
    targetGlowTutorial: "rgba(6,182,212,0.5)",
  },
  {
    name: "Sunset Pulse",
    triggerBorder: "border-purple-500",
    triggerText: "text-purple-500",
    triggerBg: "bg-purple-500",
    triggerGlow: "rgba(168,85,247,0.15)",
    triggerGlowPart: "rgba(168,85,247,0.25)",
    triggerBorderSpecial: "border-purple-500!",
    
    targetBorder: "border-pink-500",
    targetBorderSpecial: "border-pink-500!",
    targetText: "text-pink-400",
    targetBg: "bg-pink-500",
    targetGlow: "rgba(236,72,153,0.15)",
    targetGlowPart: "rgba(236,72,153,0.25)",
    targetPing: "border-pink-400",
    targetRing: "ring-pink-500",
    targetGlowTutorial: "rgba(236,72,153,0.5)",
  },
  {
    name: "Bio Flow",
    triggerBorder: "border-emerald-500",
    triggerText: "text-emerald-500",
    triggerBg: "bg-emerald-500",
    triggerGlow: "rgba(16,185,129,0.15)",
    triggerGlowPart: "rgba(16,185,129,0.25)",
    triggerBorderSpecial: "border-emerald-500!",
    
    targetBorder: "border-lime-500",
    targetBorderSpecial: "border-lime-500!",
    targetText: "text-lime-400",
    targetBg: "bg-lime-500",
    targetGlow: "rgba(132,204,22,0.15)",
    targetGlowPart: "rgba(132,204,22,0.25)",
    targetPing: "border-lime-400",
    targetRing: "ring-lime-500",
    targetGlowTutorial: "rgba(132,204,22,0.5)",
  },
];

export default function App() {
  // Game States
  const [level, setLevel] = useState<number>(() => {
    return getStorageItemSync<number>(STORAGE_KEYS.LEVEL, 1);
  });

  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    return getStorageItemSync<number>(STORAGE_KEYS.UNLOCKED, 1);
  });

  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    return getStorageItemSync<Record<number, number>>(STORAGE_KEYS.STARS, {});
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return getStorageItemSync<boolean>(STORAGE_KEYS.SOUND_ENABLED, true);
  });
  const [audioVolume, setAudioVolume] = useState<number>(() => {
    return getStorageItemSync<number>(STORAGE_KEYS.AUDIO_VOLUME, 0.8);
  });
  const [hapticIntensity, setHapticIntensity] = useState<number>(() => {
    return getStorageItemSync<number>(STORAGE_KEYS.HAPTIC_INTENSITY, 1.0);
  });

  const [appTheme, setAppTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return getStorageItemSync<'dark' | 'light' | 'system'>(STORAGE_KEYS.APP_THEME, 'dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (appTheme === 'dark') {
        isDark = true;
      } else if (appTheme === 'light') {
        isDark = false;
      } else if (appTheme === 'system') {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    if (appTheme === 'system') {
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [appTheme]);

  const triggerAppHaptic = (type: HapticType) => {
    triggerHaptic(type, hapticIntensity);
  };

  const playSound = (type: 'click' | 'undo' | 'success' | 'warning' | 'error') => {
    if (!soundEnabled || audioVolume === 0) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(audioVolume, ctx.currentTime);
      gainNode.connect(ctx.destination);

      if (type === 'click') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        
        // Rapid exponential decay on gainNode (dropping from master volume to 0 within 0.04 seconds)
        const startVolume = Math.max(audioVolume, 0.0001);
        gainNode.gain.setValueAtTime(startVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'undo') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        const notes = [523, 659, 784];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          
          noteGain.gain.setValueAtTime(audioVolume * 0.6, ctx.currentTime + idx * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
          
          osc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
        });
      } else if (type === 'warning') {
        const osc = ctx.createOscillator();
        const warnGain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        
        warnGain.gain.setValueAtTime(audioVolume * 0.8, ctx.currentTime);
        warnGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc.connect(warnGain);
        warnGain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'error') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const errGain = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, ctx.currentTime);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(155, ctx.currentTime);
        
        errGain.gain.setValueAtTime(audioVolume * 0.5, ctx.currentTime);
        errGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc1.connect(errGain);
        osc2.connect(errGain);
        errGain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  };

  const playFeedback = (profile: 'click' | 'undo' | 'success' | 'warning' | 'error') => {
    playSound(profile);

    let hapticType: HapticType = 'light';
    if (profile === 'click') hapticType = 'light';
    else if (profile === 'undo') hapticType = 'medium';
    else if (profile === 'success') hapticType = 'success';
    else if (profile === 'warning') hapticType = 'warning';
    else if (profile === 'error') hapticType = 'error';

    triggerAppHaptic(hapticType);
  };

  // Economy, Star Deduction and Simulated Ad States
  const [starDeduction, setStarDeduction] = useState<number>(() => {
    return getStorageItemSync<number>(STORAGE_KEYS.STAR_DEDUCTION, 0);
  });
  const [adReason, setAdReason] = useState<'undo' | 'restart' | null>(null);
  const [adProgress, setAdProgress] = useState<number>(-1);
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);

  useEffect(() => {
    AdManager.init();
  }, []);

  // Hydrate all state from native Capacitor Preferences on app boot
  useEffect(() => {
    hydrateStorageFromNative().then((hydrated) => {
      if (hydrated[STORAGE_KEYS.LEVEL]) {
        const lvl = parseInt(hydrated[STORAGE_KEYS.LEVEL], 10);
        if (!isNaN(lvl)) setLevel(lvl);
      }
      if (hydrated[STORAGE_KEYS.UNLOCKED]) {
        const unl = parseInt(hydrated[STORAGE_KEYS.UNLOCKED], 10);
        if (!isNaN(unl)) setUnlockedLevel(unl);
      }
      if (hydrated[STORAGE_KEYS.STARS]) {
        try {
          setLevelStars(JSON.parse(hydrated[STORAGE_KEYS.STARS]));
        } catch (e) {}
      }
      if (hydrated[STORAGE_KEYS.SOUND_ENABLED]) {
        setSoundEnabled(hydrated[STORAGE_KEYS.SOUND_ENABLED] === 'true');
      }
      if (hydrated[STORAGE_KEYS.AUDIO_VOLUME]) {
        const vol = parseFloat(hydrated[STORAGE_KEYS.AUDIO_VOLUME]);
        if (!isNaN(vol)) setAudioVolume(vol);
      }
      if (hydrated[STORAGE_KEYS.HAPTIC_INTENSITY]) {
        const hap = parseFloat(hydrated[STORAGE_KEYS.HAPTIC_INTENSITY]);
        if (!isNaN(hap)) setHapticIntensity(hap);
      }
      if (hydrated[STORAGE_KEYS.APP_THEME]) {
        const th = hydrated[STORAGE_KEYS.APP_THEME] as 'dark' | 'light' | 'system';
        if (th) setAppTheme(th);
      }
      if (hydrated[STORAGE_KEYS.PROFILE_NAME]) {
        setProfileName(hydrated[STORAGE_KEYS.PROFILE_NAME]);
        setTempProfileName(hydrated[STORAGE_KEYS.PROFILE_NAME]);
      }
      if (hydrated[STORAGE_KEYS.STAR_DEDUCTION]) {
        const ded = parseInt(hydrated[STORAGE_KEYS.STAR_DEDUCTION], 10);
        if (!isNaN(ded)) setStarDeduction(ded);
      }
      if (hydrated[STORAGE_KEYS.TUTORIAL_COMPLETED]) {
        setTutorialCompleted(hydrated[STORAGE_KEYS.TUTORIAL_COMPLETED] === 'true');
      }
      if (hydrated[STORAGE_KEYS.SELECTED_PHASE]) {
        const phase = parseInt(hydrated[STORAGE_KEYS.SELECTED_PHASE], 10) as 1 | 2 | 3;
        if (phase === 1 || phase === 2 || phase === 3) setSelectedPhaseTab(phase);
      }
    });
  }, []);

  // Active level states
  const [gridSize, setGridSize] = useState<number>(3);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [initialGrid, setInitialGrid] = useState<Cell[][]>([]);
  const [movesAllowed, setMovesAllowed] = useState<number>(3);
  const [perfectMoves, setPerfectMoves] = useState<number>(3);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [gameOverCount, setGameOverCount] = useState<number>(0);
  const [showGameOverPopup, setShowGameOverPopup] = useState<boolean>(false);
  const [showPenaltySelection, setShowPenaltySelection] = useState<boolean>(false);
  const [movesLeft, setMovesLeft] = useState<number>(3);
  const [movesUsed, setMovesUsed] = useState<number>(0);
  const [scrambleCount, setScrambleCount] = useState<number>(2);
  const [history, setHistory] = useState<{ grid: Cell[][]; movesLeft: number; movesUsed: number }[]>([]);

  // Tutorial and Solution states
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(() => {
    return getStorageItemSync<boolean>(STORAGE_KEYS.TUTORIAL_COMPLETED, false);
  });
  const [solutionDirections, setSolutionDirections] = useState<{ row: number; col: number; direction: string }[]>([]);

  // Simulation states
  const [simulationStatus, setSimulationStatus] = useState<GameStatus>('IDLE');
  const [simulationPath, setSimulationPath] = useState<{ row: number; col: number }[]>([]);
  const [failureCell, setFailureCell] = useState<{ row: number; col: number } | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [burstTrigger, setBurstTrigger] = useState<{ x: number; y: number; count: number; timestamp: number } | null>(null);

  // Dialog/drawer states
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentActiveOverlay, setCurrentActiveOverlay] = useState<'main' | 'settings' | 'about'>('main');
  const [modalAdView, setModalAdView] = useState<boolean>(false);

  // New persistent level tracking, view, and profile states
  const [currentView, setCurrentView] = useState<'landing' | 'game'>('landing');
  const [landingTab, setLandingTab] = useState<'home' | 'settings'>('home');
  const [selectedPhaseTab, setSelectedPhaseTab] = useState<1 | 2 | 3>(() => {
    const savedPhase = getStorageItemSync<number>(STORAGE_KEYS.SELECTED_PHASE, 0);
    if (savedPhase === 1 || savedPhase === 2 || savedPhase === 3) return savedPhase as 1 | 2 | 3;
    const unlocked = getStorageItemSync<number>(STORAGE_KEYS.UNLOCKED, 1);
    if (unlocked <= 35) return 1;
    if (unlocked <= 85) return 2;
    return 3;
  });
  const [settingsSubView, setSettingsSubView] = useState<'menu' | 'profile' | 'about'>('menu');
  const [profileName, setProfileName] = useState<string>(() => {
    return getStorageItemSync<string>(STORAGE_KEYS.PROFILE_NAME, 'Pilot');
  });
  const [tempProfileName, setTempProfileName] = useState<string>(() => {
    return getStorageItemSync<string>(STORAGE_KEYS.PROFILE_NAME, 'Pilot');
  });

  // Success stats (stored temporarily to animate stars)
  const [starsEarned, setStarsEarned] = useState<number>(0);

  // Load level on start / change
  useEffect(() => {
    loadLevel(level);
  }, [level]);



  // Trigger feedback when the Game Over popup or Penalty view displays
  useEffect(() => {
    if (showGameOverPopup) {
      if (showPenaltySelection) {
        playFeedback('error');
      } else {
        playFeedback('warning');
      }
    }
  }, [showGameOverPopup, showPenaltySelection]);

  const loadLevel = (lvlNum: number) => {
    // Save current level to App Data & localStorage
    setStorageItem(STORAGE_KEYS.LEVEL, lvlNum);
    
    // Generate level from solver algorithm
    const levelData = generateSolvableLevel(lvlNum);
    const size = levelData.gridSize;
    
    // Map grid to include starting rotationAngles matching directions
    const preparedGrid = levelData.grid.map((r: any[]) =>
      r.map((cell: any) => {
        let angle = 0;
        if (cell.direction === 'R') angle = 90;
        else if (cell.direction === 'D') angle = 180;
        else if (cell.direction === 'L') angle = 270;
        
        return {
          ...cell,
          rotationAngle: angle,
        };
      })
    );

    setGridSize(size);
    setGrid(cloneGrid(preparedGrid));
    setInitialGrid(cloneGrid(preparedGrid));
    setMovesAllowed(levelData.movesAllowed);
    setPerfectMoves(levelData.perfectMoves || 3);
    setAttemptCount(1);
    setGameOverCount(0);
    setShowGameOverPopup(false);
    setShowPenaltySelection(false);
    setMovesLeft(levelData.movesAllowed);
    setMovesUsed(0);
    setScrambleCount(levelData.scrambleCount || 2);
    setHistory([]);
    setSolutionDirections(levelData.solutionDirections || []);
    
    // Reset simulation
    setSimulationStatus('IDLE');
    setSimulationPath([]);
    setFailureCell(null);
  };

  // Derived tutorial states
  const isTutorialMode = level === 1 && !tutorialCompleted;
  const incorrectPathCells = solutionDirections.filter((sd) => {
    const currentCell = grid[sd.row]?.[sd.col];
    return currentCell && currentCell.direction !== sd.direction;
  });
  const tutorialTargetCell = isTutorialMode && incorrectPathCells.length > 0 ? incorrectPathCells[0] : null;

  // Dynamic theme based on current level (shifts every 5 levels)
  const currentThemeIndex = Math.floor((level - 1) / 5) % THEMES.length;
  const currentTheme = THEMES[currentThemeIndex];

  // Helper to trigger haptic shake on failure/errors
  const triggerShake = () => {
    setIsShaking(true);
    // Visual haptic style click feedback if enabled
    if (soundEnabled && navigator.vibrate) {
      navigator.vibrate(80);
    }
    setTimeout(() => setIsShaking(false), 500);
  };

  // Handles clockwise tile rotation on user tap
  const rotateCell = (row: number, col: number) => {
    if (simulationStatus !== 'IDLE') return; // Block changes during flow simulation
    
    // Prevent random clicking during Level 1 tutorial
    if (isTutorialMode && tutorialTargetCell) {
      if (tutorialTargetCell.row !== row || tutorialTargetCell.col !== col) {
        triggerShake();
        return;
      }
    }

    const cell = grid[row][col];
    if (cell.isObstacle || cell.isTarget) return; // Cannot rotate target or obstacles

    if (movesLeft <= 0 && !isTutorialMode) {
      triggerShake();
      return;
    }

    // Gentle tactile tick
    playFeedback('click');

    // Save state before rotation
    setHistory((prev) => [...prev, { grid: cloneGrid(grid), movesLeft, movesUsed }]);

    setGrid((prevGrid) => {
      const gridSize = prevGrid.length;
      return prevGrid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            const allDirs: ('U' | 'R' | 'D' | 'L')[] = ['U', 'R', 'D', 'L'];
            const currIndex = allDirs.indexOf(c.direction);
            
            // Cycle through standard directions to find the next valid one that stays in bounds
            let nextDirection: 'U' | 'R' | 'D' | 'L' = c.direction;
            for (let i = 1; i <= 4; i++) {
              const checkDir = allDirs[(currIndex + i) % 4];
              const isValid = 
                !(checkDir === 'U' && ri === 0) &&
                !(checkDir === 'D' && ri === gridSize - 1) &&
                !(checkDir === 'L' && ci === 0) &&
                !(checkDir === 'R' && ci === gridSize - 1);
              if (isValid) {
                nextDirection = checkDir;
                break;
              }
            }

            const dirAngles = { U: 0, R: 90, D: 180, L: 270 };
            const targetMod = dirAngles[nextDirection];
            let nextAngle = c.rotationAngle + 90;
            while (((nextAngle % 360) + 360) % 360 !== targetMod) {
              nextAngle += 90;
            }

            return {
              ...c,
              rotationAngle: nextAngle,
              direction: nextDirection,
            };
          }
          return c;
        })
      );
    });

    if (!isTutorialMode) {
      setMovesLeft((prev) => prev - 1);
    }
    setMovesUsed((prev) => prev + 1);
  };

  // Core execute handlers for game actions (can bypass star checks if watching an ad)
  const executeReset = () => {
    setAttemptCount((prev) => prev + 1);
    setGrid(cloneGrid(initialGrid));
    setMovesLeft(movesAllowed);
    setMovesUsed(0);
    setHistory([]);
    setSimulationStatus('IDLE');
    setSimulationPath([]);
    setFailureCell(null);
  };

  const executeUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setGrid(previousState.grid);
    setMovesLeft(previousState.movesLeft);
    setMovesUsed(previousState.movesUsed);

    setSimulationStatus('IDLE');
    setSimulationPath([]);
    setFailureCell(null);
  };

  // Manual restart that cleanly wipes the active grid layout without penalties or popups
  const handleManualRestart = () => {
    if (simulationStatus === 'SIMULATING') return;
    playFeedback('undo');

    const performReset = () => {
      setGrid(cloneGrid(initialGrid));
      setMovesLeft(movesAllowed);
      setMovesUsed(0);
      setHistory([]);
      setSimulationStatus('IDLE');
      setSimulationPath([]);
      setFailureCell(null);
    };

    AdManager.showInterstitialAd(performReset)
      .catch((err) => {
        console.warn("AdManager.showInterstitialAd rejected, performing fallback reset:", err);
        performReset();
      });
  };

  // Open restart confirmation modal with star economy checks
  const resetLevel = () => {
    if (simulationStatus === 'SIMULATING') return;
    playFeedback('undo');
    setShowGameOverPopup(true);
    setShowPenaltySelection(false);
  };

  const handleGameOverReplay = () => {
    const nextGameOverCount = gameOverCount + 1;
    const nextAttemptCount = attemptCount + 1;
    setGameOverCount(nextGameOverCount);
    setAttemptCount(nextAttemptCount);

    if (nextGameOverCount < 3) {
      setShowGameOverPopup(false);
      setShowPenaltySelection(false);
      setGrid(cloneGrid(initialGrid));
      setMovesLeft(movesAllowed);
      setMovesUsed(0);
      setHistory([]);
      setSimulationStatus('IDLE');
      setSimulationPath([]);
      setFailureCell(null);
    } else {
      setShowPenaltySelection(true);
    }
  };

  const handlePayStarsPenalty = () => {
    if (totalStars >= 10) {
      const newDeduction = starDeduction + 10;
      setStarDeduction(newDeduction);
      setStorageItem(STORAGE_KEYS.STAR_DEDUCTION, newDeduction);

      setGameOverCount(0);
      setShowGameOverPopup(false);
      setShowPenaltySelection(false);

      setGrid(cloneGrid(initialGrid));
      setMovesLeft(movesAllowed);
      setMovesUsed(0);
      setHistory([]);
      setSimulationStatus('IDLE');
      setSimulationPath([]);
      setFailureCell(null);
    }
  };

  const handleWatchAdPenalty = () => {
    setIsAdPlaying(true);

    AdManager.showRewardedAd(
      () => {
        // onSuccess: clear out failed attempts tracker and reset board
        setIsAdPlaying(false);
        setAttemptCount(0);
        setGameOverCount(0);
        setShowGameOverPopup(false);
        setShowPenaltySelection(false);

        setGrid(cloneGrid(initialGrid));
        setMovesLeft(movesAllowed);
        setMovesUsed(0);
        setHistory([]);
        setSimulationStatus('IDLE');
        setSimulationPath([]);
        setFailureCell(null);
        playFeedback('success');
      },
      () => {
        // onFailure: apply the standard 10-star penalty deduction and reset board
        setIsAdPlaying(false);
        const newDeduction = starDeduction + 10;
        setStarDeduction(newDeduction);
        setStorageItem(STORAGE_KEYS.STAR_DEDUCTION, newDeduction);

        setGameOverCount(0);
        setShowGameOverPopup(false);
        setShowPenaltySelection(false);

        setGrid(cloneGrid(initialGrid));
        setMovesLeft(movesAllowed);
        setMovesUsed(0);
        setHistory([]);
        setSimulationStatus('IDLE');
        setSimulationPath([]);
        setFailureCell(null);
        playFeedback('error');
      }
    );
  };

  // Verifies star balance inside the modal before execution
  const handleConfirmRestart = () => {
    if (totalStars >= 10) {
      const newDeduction = starDeduction + 10;
      setStarDeduction(newDeduction);
      setStorageItem(STORAGE_KEYS.STAR_DEDUCTION, newDeduction);
      executeReset();
      setShowRestartConfirm(false);
    } else {
      console.log("Trigger Ad Placement for Restart Token");
      setModalAdView(true);
    }
  };

  // Restore previous board state from the history stack with star economy deductions
  const undoMove = () => {
    if (simulationStatus !== 'IDLE' || history.length === 0) return;

    if (totalStars >= 3) {
      const newDeduction = starDeduction + 3;
      setStarDeduction(newDeduction);
      setStorageItem(STORAGE_KEYS.STAR_DEDUCTION, newDeduction);

      playFeedback('undo');
      executeUndo();
    } else {
      console.log("Trigger Ad Placement for Undo Token");
      setAdReason('undo');
      triggerShake();
    }
  };

  const handleFailure = (fRow: number, fCol: number) => {
    setFailureCell({ row: fRow, col: fCol });
    setSimulationStatus('FAILURE');
    triggerShake();
    setTimeout(() => {
      setShowGameOverPopup(true);
    }, 600);
  };

  // Initiates the GridFlow chain reaction stepper
  const triggerFlow = () => {
    if (simulationStatus !== 'IDLE') return;

    // Prevent premature triggering during tutorial
    if (isTutorialMode && incorrectPathCells.length > 0) {
      triggerShake();
      return;
    }

    setSimulationStatus('SIMULATING');
    setFailureCell(null);
    
    // Grid starts at index (0,0) which is marked as Trigger
    const path: { row: number; col: number }[] = [{ row: 0, col: 0 }];
    setSimulationPath([...path]);

    const runStep = (currentPath: { row: number; col: number }[]) => {
      const current = currentPath[currentPath.length - 1];
      const cell = grid[current.row][current.col];

      // Reached the Target cell successfully!
      if (cell.isTarget) {
        setSimulationStatus('SUCCESS');
        setGameOverCount(0); // Clear on success
        playFeedback('success');
        
        // Calculate stars based on movesUsed and BFS perfectMoves output
        let stars = 1;
        if (level === 1) {
          stars = 3;
        } else {
          if (attemptCount <= 2) {
            if (movesUsed <= perfectMoves) {
              stars = 3;
            } else if (movesUsed <= perfectMoves + 3) {
              stars = 2;
            } else {
              stars = 1;
            }
          } else {
            if (movesUsed <= perfectMoves) {
              stars = 2;
            } else if (movesUsed <= perfectMoves + 3) {
              stars = 1;
            } else {
              stars = 0;
            }
          }
        }
        setStarsEarned(stars);

        // Save progress to App Data & localStorage
        const updatedStars = { ...levelStars, [level]: Math.max(levelStars[level] || 0, stars) };
        setLevelStars(updatedStars);

        let nextLvl = unlockedLevel;
        if (level === unlockedLevel && unlockedLevel < 185) {
          nextLvl = level + 1;
          setUnlockedLevel(nextLvl);
        }

        const isTutComp = level === 1 ? true : tutorialCompleted;
        if (level === 1) {
          setTutorialCompleted(true);
        }

        saveLevelComplete({
          level,
          unlockedLevel: nextLvl,
          levelStars: updatedStars,
          tutorialCompleted: isTutComp,
        });

        // Spawn beautiful celebratory particles
        setTimeout(() => {
          const targetEl = document.getElementById(`cell-${current.row}-${current.col}`);
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            setBurstTrigger({
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              count: 65,
              timestamp: Date.now(),
            });
          } else {
            setBurstTrigger({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              count: 65,
              timestamp: Date.now(),
            });
          }
        }, 80);
        return;
      }

      // Check where arrow directs the flow
      const dir = cell.direction;
      let nextRow = current.row;
      let nextCol = current.col;

      if (dir === 'U') nextRow--;
      else if (dir === 'D') nextRow++;
      else if (dir === 'L') nextCol--;
      else if (dir === 'R') nextCol++;

      // 1. Boundary check
      if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
        handleFailure(nextRow, nextCol);
        return;
      }

      const nextCell = grid[nextRow][nextCol];

      // 2. Obstacle check
      if (nextCell.isObstacle) {
        handleFailure(nextRow, nextCol);
        return;
      }

      // 3. Loop Check
      const hasVisited = currentPath.some((p) => p.row === nextRow && p.col === nextCol);
      if (hasVisited) {
        handleFailure(nextRow, nextCol);
        return;
      }

      // Progress connection forward
      const nextPath = [...currentPath, { row: nextRow, col: nextCol }];
      setSimulationPath(nextPath);

      // Play minor sequential flow sound tick (simulate haptic)
      if (soundEnabled && navigator.vibrate) {
        navigator.vibrate(10);
      }

      // Standard delay for flow pacing
      setTimeout(() => {
        runStep(nextPath);
      }, 160);
    };

    // Begin chain step simulation
    setTimeout(() => {
      runStep(path);
    }, 100);
  };

  const handleNextLevel = () => {
    AdManager.showInterstitialAd(() => {
      if (level < 50) {
        setLevel((prev) => prev + 1);
      } else {
        setShowLevelSelect(true);
      }
    });
  };

  const handleSelectLevel = (lvlNum: number) => {
    const isCompleted = levelStars[lvlNum] !== undefined && levelStars[lvlNum] > 0;
    if (isCompleted) {
      setIsAdPlaying(true);
      AdManager.showRewardedAd(
        () => {
          setIsAdPlaying(false);
          setLevel(lvlNum);
          setSimulationStatus('IDLE');
          setShowLevelSelect(false);
          setCurrentView('game');
          playFeedback('success');
        },
        () => {
          setIsAdPlaying(false);
          playFeedback('error');
        }
      );
    } else {
      AdManager.showInterstitialAd(() => {
        setLevel(lvlNum);
        setSimulationStatus('IDLE');
        setShowLevelSelect(false);
        setCurrentView('game');
      });
    }
  };

  const navigateToHome = () => {
    setStorageItem(STORAGE_KEYS.LEVEL, level);
    setStorageItem(STORAGE_KEYS.UNLOCKED, unlockedLevel);
    setStorageItem(STORAGE_KEYS.STARS, levelStars);
    setStorageItem(STORAGE_KEYS.STAR_DEDUCTION, starDeduction);
    AdManager.showInterstitialAd(() => {
      setCurrentView('landing');
      setLandingTab('home');
      setIsMenuOpen(false);
    });
  };

  const openPrivacyPolicy = async () => {
    try {
      await Browser.open({
        url: 'https://navdeep0p.github.io/gridflow-privacy/',
        toolbarColor: '#000000',
      });
    } catch (error) {
      console.warn("Capacitor Browser plugin not available, falling back to window.open:", error);
      window.open('https://navdeep0p.github.io/gridflow-privacy/', '_blank');
    }
  };

  // Stats calculation
  const calculatedStars = (Object.values(levelStars) as number[]).reduce((sum: number, s: number) => sum + s, 0);
  const totalStars = Math.max(0, calculatedStars - starDeduction);

  const getTutorialStepInfo = () => {
    if (simulationStatus === 'SIMULATING') {
      return {
        title: "Step 3: Transferring Energy",
        desc: "Watch the energy transfer along the continuous chain of arrows!",
        status: "simulating"
      };
    }
    if (simulationStatus === 'SUCCESS') {
      return {
        title: "Tutorial Complete!",
        desc: "Excellent! You connected the nodes. Tap Continue to unlock the rest of the game.",
        status: "success"
      };
    }
    if (incorrectPathCells.length > 0) {
      return {
        title: "Step 1: Align the Arrows",
        desc: "Tap the pulsing highlighted arrow to rotate it clockwise and complete the connection path.",
        status: "rotate"
      };
    }
    return {
      title: "Step 2: Trigger Flow",
      desc: "All arrows are aligned! Now tap the flashing 'Connect' button at the bottom to solve the level.",
      status: "connect"
    };
  };

  const tutorialInfo = getTutorialStepInfo();

  return (
    <div className="w-full h-[100dvh] bg-neutral-50 dark:bg-zinc-950 text-neutral-900 dark:text-zinc-50 flex flex-col justify-between items-center overflow-hidden relative select-none font-sans transition-colors duration-300">
      {/* Particle Overlay Canvas */}
      <ParticleOverlay burstTrigger={burstTrigger} />

      {/* Subtle grid background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(24,24,27,0.15),transparent_80%)] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="w-full max-w-md px-6 pt-6 pb-2 flex flex-col items-center justify-center z-20 flex-shrink-0 relative">
        <div className="text-center">
          <h1 className="font-display font-light text-2xl tracking-[0.25em] uppercase bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent select-none leading-tight">
            GridFlow
          </h1>
          <span className="text-[9px] text-neutral-500 dark:text-zinc-500 font-mono tracking-[0.15em] uppercase block mt-1">Arrow Connect</span>
        </div>
        
        {/* Hamburger Menu Trigger */}
        <button
          id="hamburger-menu-trigger"
          onClick={() => {
            setIsMenuOpen(true);
            setCurrentActiveOverlay('main');
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-neutral-200/50 dark:bg-zinc-900/40 border border-neutral-300 dark:border-zinc-800/60 hover:bg-neutral-300/60 dark:hover:bg-zinc-900 hover:border-neutral-400 dark:hover:border-zinc-700/80 active:scale-95 transition-all text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 cursor-pointer flex items-center justify-center z-20"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {currentView === 'landing' ? (
        /* LANDING VIEW WITH CYBERPUNK THEME */
        <div className="w-full max-w-md flex-1 flex flex-col justify-between items-center z-10 px-6 relative overflow-hidden pb-36">
          {landingTab === 'home' ? (
            <div className="w-full flex-1 flex flex-col overflow-hidden">
              {/* Profile greeting */}
              <div className="w-full text-left mt-2 mb-3">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 dark:text-zinc-500 uppercase">Welcome back,</span>
                <h2 className="text-xl font-display font-semibold text-neutral-800 dark:text-zinc-100 uppercase tracking-wide mt-0.5">{profileName}</h2>
              </div>

              {/* General stats */}
              <div className="w-full grid grid-cols-2 gap-3 mb-4 bg-neutral-100/50 dark:bg-zinc-900/35 border border-neutral-200 dark:border-zinc-900/60 p-3.5 rounded-2xl flex-shrink-0">
                <div className="text-center py-1">
                  <span className="text-[9px] font-mono text-neutral-500 dark:text-zinc-500 uppercase tracking-wider block">Total Stars</span>
                  <span className="text-base font-display font-bold text-amber-500 dark:text-amber-400 mt-1 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500 dark:text-amber-400" /> {totalStars}
                  </span>
                </div>
                <div className="text-center py-1 border-l border-neutral-200 dark:border-zinc-800/40">
                  <span className="text-[9px] font-mono text-neutral-500 dark:text-zinc-500 uppercase tracking-wider block">Completed</span>
                  <span className="text-base font-display font-bold text-neutral-700 dark:text-zinc-200 mt-1 block">{unlockedLevel - 1} / 185</span>
                </div>
              </div>

              {/* Phase Tabs Selector */}
              <div className="w-full flex gap-1.5 p-1 mb-4 bg-neutral-100 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-900/80 rounded-xl flex-shrink-0">
                <button
                  onClick={() => setSelectedPhaseTab(1)}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-medium tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                    selectedPhaseTab === 1
                      ? 'bg-amber-400/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                      : 'text-neutral-500 dark:text-zinc-500 hover:text-neutral-800 dark:hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  Ph 1 (1-35)
                </button>
                <button
                  onClick={() => setSelectedPhaseTab(2)}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-medium tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                    selectedPhaseTab === 2
                      ? 'bg-amber-400/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                      : 'text-neutral-500 dark:text-zinc-500 hover:text-neutral-800 dark:hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  Ph 2 (36-85)
                </button>
                <button
                  onClick={() => setSelectedPhaseTab(3)}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-medium tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                    selectedPhaseTab === 3
                      ? 'bg-amber-400/10 border border-amber-500/20 text-amber-500 dark:text-amber-400'
                      : 'text-neutral-500 dark:text-zinc-500 hover:text-neutral-800 dark:hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  Ph 3 (86-185)
                </button>
              </div>

              {/* Level Grid Container */}
              <div className="w-full flex-1 overflow-y-auto px-0.5 pb-4 no-scrollbar">
                <div className="grid grid-cols-4 gap-2.5">
                  {(() => {
                    const phaseInfo = {
                      1: { start: 1, length: 35 },
                      2: { start: 36, length: 50 },
                      3: { start: 86, length: 100 }
                    }[selectedPhaseTab];

                    return Array.from({ length: phaseInfo.length }, (_, i) => {
                      const lvlIndex = phaseInfo.start + i;
                      const isUnlocked = lvlIndex <= unlockedLevel;
                      const stars = levelStars[lvlIndex] || 0;

                      if (isUnlocked) {
                        return (
                          <button
                            key={lvlIndex}
                            id={`landing-level-${lvlIndex}`}
                            onClick={() => handleSelectLevel(lvlIndex)}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100/70 dark:bg-zinc-900/45 border border-neutral-200 dark:border-zinc-800/60 hover:bg-neutral-200 dark:hover:bg-zinc-900 hover:border-neutral-300 dark:hover:border-zinc-700/80 active:scale-95 transition-all cursor-pointer aspect-square relative group"
                          >
                            <span className="text-base font-display font-bold text-neutral-700 dark:text-zinc-200 group-hover:text-neutral-900 dark:group-hover:text-white">
                              {lvlIndex}
                            </span>
                            <div className="flex gap-0.5 mt-1 justify-center">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-2.5 h-2.5 ${
                                    starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-zinc-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      } else {
                        return (
                          <div
                            key={lvlIndex}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-200/50 dark:bg-zinc-950/40 border border-neutral-300 dark:border-zinc-900/60 opacity-35 cursor-not-allowed aspect-square"
                          >
                            <span className="text-xs font-display font-bold text-neutral-400 dark:text-zinc-600">
                              {lvlIndex}
                            </span>
                            <Lock className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-600 mt-1" />
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col overflow-y-auto pb-4 scrollbar-thin">
              {/* Settings and Profile sub-panel */}
              {settingsSubView === 'menu' && (
                <div className="w-full space-y-3.5 mt-2 flex flex-col">
                  {/* Title */}
                  <div className="w-full text-left mt-1 mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-500 dark:text-zinc-500 uppercase">System</span>
                    <h2 className="text-xl font-display font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mt-0.5">Settings</h2>
                  </div>

                  {/* PROFILE Button */}
                  <button
                    onClick={() => {
                      setTempProfileName(profileName);
                      setSettingsSubView('profile');
                    }}
                    className="w-full py-4 px-6 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/30 hover:bg-neutral-300/80 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white text-neutral-800 dark:text-neutral-200 font-display font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
                  >
                    <span className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-neutral-500 dark:text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      Profile ({profileName})
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* ABOUT GAME Button */}
                  <button
                    onClick={() => setSettingsSubView('about')}
                    className="w-full py-4 px-6 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/30 hover:bg-neutral-300/80 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white text-neutral-800 dark:text-neutral-200 font-display font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
                  >
                    <span className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-neutral-500 dark:text-zinc-500 group-hover:text-purple-500 transition-colors" />
                      About Game
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Audio Controls */}
                  <div className="w-full space-y-4 bg-neutral-200/80 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/30 p-5 rounded-2xl flex flex-col items-center mt-2">
                    <div className="flex items-center justify-between w-full border-b border-neutral-300 dark:border-zinc-900/60 pb-3 mb-1">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-800 dark:text-neutral-200 uppercase">Sound & Audio</span>
                    </div>

                    {/* Haptic Sounds */}
                    <div className="flex items-center justify-between w-full py-1">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-display text-neutral-800 dark:text-neutral-200 font-semibold uppercase tracking-wider">Master Sound Toggle</span>
                        <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">Mute or enable all sound cues</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = !soundEnabled;
                          setSoundEnabled(next);
                          setStorageItem(STORAGE_KEYS.SOUND_ENABLED, String(next));
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                          soundEnabled ? "bg-amber-500" : "bg-neutral-350 dark:bg-zinc-900"
                        } relative flex items-center cursor-pointer`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                            soundEnabled ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* SFX Volume Slider */}
                    <div className="w-full py-2 border-t border-neutral-300 dark:border-zinc-900/50 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center w-full text-left">
                        <div className="flex flex-col">
                          <span className="text-xs font-display text-neutral-800 dark:text-neutral-200 font-semibold uppercase tracking-wider">SFX Volume</span>
                          <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">Control sound effects levels</span>
                        </div>
                        <span className="text-xs font-mono text-pink-500 font-semibold">{Math.round(audioVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setAudioVolume(val);
                          setStorageItem(STORAGE_KEYS.AUDIO_VOLUME, val);
                        }}
                        className="w-full h-1 bg-neutral-300 dark:bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    {/* Haptic Feedback Slider */}
                    <div className="w-full py-2 border-t border-neutral-300 dark:border-zinc-900/50 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center w-full text-left">
                        <div className="flex flex-col">
                          <span className="text-xs font-display text-neutral-800 dark:text-neutral-200 font-semibold uppercase tracking-wider">Haptic Intensity</span>
                          <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">Adjust tactile feedback power</span>
                        </div>
                        <span className="text-xs font-mono text-pink-500 font-semibold">{Math.round(hapticIntensity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={hapticIntensity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setHapticIntensity(val);
                          setStorageItem(STORAGE_KEYS.HAPTIC_INTENSITY, val);
                          triggerHaptic('light', val);
                        }}
                        className="w-full h-1 bg-neutral-300 dark:bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    {/* Theme Selector - temporarily hidden during testing */}
                    {/*
                    <div className="w-full py-2 border-t border-neutral-300 dark:border-zinc-900/50 dark:border-zinc-800/40 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center w-full text-left">
                        <div className="flex flex-col">
                          <span className="text-xs font-display text-neutral-800 dark:text-zinc-200 font-semibold uppercase tracking-wider">System Theme</span>
                          <span className="text-[9px] font-mono text-neutral-500 dark:text-zinc-500 mt-0.5">Toggle visual interface appearance</span>
                        </div>
                      </div>
                      <div className="flex w-full bg-neutral-200/60 dark:bg-zinc-950/60 p-1 rounded-xl border border-neutral-300 dark:border-zinc-800/60 gap-1 mt-1">
                        {(['dark', 'light', 'system'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setAppTheme(t);
                              setStorageItem(STORAGE_KEYS.APP_THEME, t);
                              playFeedback('click');
                            }}
                            className={`flex-1 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                              appTheme === t
                                ? "bg-pink-500 text-white shadow-sm"
                                : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-300/40 dark:hover:bg-zinc-900/50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    */}
                  </div>

                  {/* Privacy Policy section separated cleanly by border-zinc-800 */}
                  <div className="border-t border-zinc-800 pt-3.5 mt-2">
                    <button
                      onClick={openPrivacyPolicy}
                      className="w-full py-4 px-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:bg-zinc-900/95 text-zinc-100 font-display font-medium text-xs tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                        Privacy Policy
                      </span>
                      <span className="text-amber-500 text-xs font-mono">VIEW // LAUNCH</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PROFILE View UI */}
              {settingsSubView === 'profile' && (
                <div className="w-full bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center mt-2">
                  <div className="flex items-center justify-between w-full border-b border-zinc-900/60 pb-3 mb-4">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Edit Profile</span>
                    <button
                      onClick={() => setSettingsSubView('menu')}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 uppercase underline decoration-zinc-800 underline-offset-4"
                    >
                      Back
                    </button>
                  </div>

                  <div className="w-full space-y-4 text-left">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Pilot / Player Name</label>
                    <input
                      type="text"
                      value={tempProfileName}
                      onChange={(e) => setTempProfileName(e.target.value)}
                      maxLength={18}
                      className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-700 font-sans text-xs uppercase tracking-wider outline-none transition-all"
                      placeholder="Enter pilot name"
                    />
                    <button
                      onClick={() => {
                        const cleaned = tempProfileName.trim() || 'Pilot';
                        setProfileName(cleaned);
                        setStorageItem(STORAGE_KEYS.PROFILE_NAME, cleaned);
                        setSettingsSubView('menu');
                      }}
                      className="w-full py-3 bg-zinc-50 hover:bg-zinc-200 text-black font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {/* ABOUT View UI */}
              {settingsSubView === 'about' && (
                <div className="w-full bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/30 p-5 rounded-2xl flex flex-col items-center mt-2 space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                  <div className="flex items-center justify-between w-full border-b border-neutral-300 dark:border-zinc-900/60 pb-3 mb-1">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-800 dark:text-neutral-200 uppercase">About Game</span>
                    <button
                      onClick={() => setSettingsSubView('menu')}
                      className="text-[10px] font-mono text-neutral-500 dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-zinc-300 uppercase underline decoration-neutral-300 dark:decoration-zinc-800 underline-offset-4"
                    >
                      Back
                    </button>
                  </div>

                  {/* Developer Profile Card */}
                  <div className="w-full bg-neutral-100 dark:bg-zinc-950/60 border border-neutral-300 dark:border-zinc-900/60 rounded-xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500 font-display font-black text-lg">
                      N
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-bold text-neutral-800 dark:text-neutral-100 tracking-wide uppercase">Navdeep / Nani</h3>
                      <p className="text-[10px] font-mono text-neutral-500 dark:text-zinc-500 mt-0.5">Game Developer & Engineer</p>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <a 
                        href="https://github.com/Navdeep0p" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                        title="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a 
                        href="https://www.linkedin.com/in/navdeep-reddy-518176315/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a 
                        href="mailto:navdeep333666@gmail.com" 
                        className="p-2 rounded-lg bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full border-t border-neutral-300 dark:border-zinc-800/60" />

                  {/* How To Play Section */}
                  <div className="w-full space-y-2 text-left">
                    <h4 className="text-[11px] font-display font-bold tracking-wider text-pink-500 uppercase">How to Play</h4>
                    <ul className="space-y-2 text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed list-none pl-0">
                      <li className="flex gap-2">
                        <span className="text-pink-500 font-mono font-bold">•</span>
                        <span>Connect the matching nodes on the grid by drawing paths through the directional arrow tiles.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-pink-500 font-mono font-bold">•</span>
                        <span>Paths must follow the direction indicated by each arrow tile they pass through.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-pink-500 font-mono font-bold">•</span>
                        <span>Win the level by successfully connecting the nodes within or under the specified Move Goal.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Divider */}
                  <div className="w-full border-t border-neutral-300 dark:border-zinc-800/60" />

                  {/* Strike System & Economy Section */}
                  <div className="w-full space-y-2 text-left">
                    <h4 className="text-[11px] font-display font-bold tracking-wider text-amber-500 uppercase">Strike System & Economy</h4>
                    <ul className="space-y-2 text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed list-none pl-0">
                      <li className="flex gap-2">
                        <span className="text-amber-500 font-mono font-bold">•</span>
                        <span>You have a 3-strike failure system per puzzle attempt.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-amber-500 font-mono font-bold">•</span>
                        <span>Clearing a puzzle within the move goal earns you up to 3 Stars.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-amber-500 font-mono font-bold">•</span>
                        <span>Failing a level 3 times triggers a Game Over state, applying a 10-star penalty or requiring an ad-watch to continue.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setSettingsSubView('menu')}
                    className="w-full py-2.5 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-300 border border-neutral-300 dark:border-neutral-700 font-mono text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Return to Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Permanent Home Screen Banner Placement directly above the bottom nav bar */}
          <div className="absolute bottom-18 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-950/95 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-md z-30 max-w-md mx-auto flex items-center justify-center px-4">
            <AdBanner />
          </div>

          {/* Fixed Bottom Navigation exclusively visible on the landing view */}
          <div className="absolute bottom-0 left-0 right-0 h-18 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-md flex items-center justify-around px-6 z-30 max-w-md mx-auto">
            {/* HOME Tab Button */}
            <button
              onClick={() => setLandingTab('home')}
              className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all cursor-pointer ${
                landingTab === 'home'
                  ? 'text-amber-500 dark:text-amber-400 scale-102 font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-zinc-300'
              }`}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-[0.1em]">Home</span>
            </button>

            {/* SETTINGS Tab Button */}
            <button
              onClick={() => {
                setLandingTab('settings');
                setSettingsSubView('menu');
              }}
              className={`flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all cursor-pointer ${
                landingTab === 'settings'
                  ? 'text-amber-500 dark:text-amber-400 scale-102 font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-zinc-300'
              }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-[0.1em]">Settings</span>
            </button>
          </div>
        </div>
      ) : (
        /* GAME VIEW ACTIVE PUZZLE ENVIRONMENT */
        <>
          {/* DASHBOARD BAR */}
          <section className="w-full max-w-md px-6 py-2 z-10 flex-shrink-0">
            <div className="grid grid-cols-3 border-y border-neutral-200 dark:border-zinc-800 py-3.5 text-center">
              {/* Level selection button */}
              <button
                id="lvl-selector-trigger"
                onClick={navigateToHome}
                className="flex flex-col items-center justify-center hover:bg-neutral-200/50 dark:hover:bg-zinc-900/40 py-1 rounded-xl transition-all cursor-pointer group active:scale-95"
              >
                <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono tracking-[0.1em] uppercase mb-1">Level</span>
                <span className="text-base font-display font-bold text-neutral-900 dark:text-white flex items-center gap-0.5 justify-center group-hover:text-neutral-750 dark:group-hover:text-white">
                  {level} <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-600 group-hover:text-neutral-600 dark:group-hover:text-zinc-400" />
                </span>
              </button>

              {/* Moves Gauge */}
              <div className="flex flex-col items-center justify-center border-x border-neutral-200 dark:border-zinc-800 px-2">
                <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono tracking-[0.1em] uppercase mb-1">Moves Used</span>
                <div className="flex flex-col items-center text-center">
                  <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">
                    {movesUsed}
                  </span>
                  {isTutorialMode ? (
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-zinc-400 mt-0.5">Goal: &infin;</span>
                  ) : attemptCount === 1 ? (
                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 font-medium uppercase tracking-tight">
                      3★ Goal: &le; {perfectMoves}
                    </span>
                  ) : attemptCount === 2 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 font-medium uppercase tracking-tight">
                        3★ Goal: &le; {perfectMoves}
                      </span>
                      <span className="text-[8px] font-mono text-red-500 dark:text-red-400 mt-0.5 font-semibold uppercase tracking-tight leading-none text-center">
                        Final 3-Star Opportunity
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono text-neutral-500 dark:text-zinc-400 mt-0.5 font-medium uppercase tracking-tight">
                        Goal: &le; {perfectMoves}
                      </span>
                      <span className="text-[8px] font-mono text-red-500 dark:text-red-400 mt-0.5 font-semibold uppercase tracking-tight leading-none text-center">
                        Max Stars Available: 2
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Star rating info */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono tracking-[0.1em] uppercase mb-1">Stars</span>
                <span className="text-base font-display font-bold text-neutral-900 dark:text-white flex items-center gap-1 justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500 dark:text-amber-400" />
                  {totalStars}
                </span>
              </div>
            </div>
          </section>

          {/* FAILURE ALERTS / NOTIFICATIONS */}
          <div className="w-full max-w-md px-6 h-8 flex justify-center items-center z-20">
            <AnimatePresence>
              {simulationStatus === 'FAILURE' && !showGameOverPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="bg-red-950/20 border border-red-900/30 text-red-400 text-[11px] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md font-sans"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>Flow Broken!</span>
                  <button 
                    id="failure-reset-btn"
                    onClick={resetLevel} 
                    className="ml-1 text-zinc-100 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Reset <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              )}
              {movesLeft === 0 && simulationStatus === 'IDLE' && !isTutorialMode && !showGameOverPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 text-[11px] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md font-sans"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Out of moves.</span>
                  <button 
                    id="out-of-moves-reset-btn"
                    onClick={resetLevel} 
                    className="ml-1 text-zinc-100 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Reset <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MAIN PLAYING GRID STAGE */}
          <main className="w-full max-w-md px-6 flex-1 flex flex-col justify-center items-center z-10">
            {/* TUTORIAL INSTRUCTION BOX */}
            {isTutorialMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[340px] mb-4 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-900 rounded-xl p-3.5 shadow-xl dark:shadow-zinc-950/40 flex flex-col gap-1 text-center font-sans z-20"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  <span className="font-mono text-[9px] text-neutral-500 dark:text-zinc-500 uppercase tracking-[0.15em]">
                    {tutorialInfo.title}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-600 dark:text-zinc-300 font-sans leading-relaxed mt-0.5">
                  {tutorialInfo.desc}
                </p>
              </motion.div>
            )}

            <div 
              className={`
                w-full aspect-square max-w-[340px] flex flex-col justify-center relative transition-all
                ${isShaking ? 'animate-shake' : ''}
              `}
              id="puzzle-board-container"
            >
              <div 
                className="grid gap-2.5 w-full h-full"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {grid.map((rowArr, rIdx) =>
                  rowArr.map((cell, cIdx) => {
                    const isPart = simulationPath.some((p) => p.row === rIdx && p.col === cIdx);
                    const isFlowTip = simulationPath.length > 0 && 
                                      simulationPath[simulationPath.length - 1].row === rIdx && 
                                      simulationPath[simulationPath.length - 1].col === cIdx;
                    
                    const isCellFailed = failureCell && failureCell.row === rIdx && failureCell.col === cIdx;

                    const isTutorialTarget = isTutorialMode && tutorialTargetCell && 
                                             tutorialTargetCell.row === rIdx && 
                                             tutorialTargetCell.col === cIdx;

                    const isTutorialInactive = isTutorialMode && tutorialTargetCell && 
                                               !cell.isTrigger && !cell.isTarget && 
                                               !isTutorialTarget;

                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        id={`cell-${rIdx}-${cIdx}`}
                        disabled={cell.isObstacle || cell.isTarget || simulationStatus !== 'IDLE'}
                        onClick={() => rotateCell(rIdx, cIdx)}
                        className={`
                          relative aspect-square rounded-xl flex flex-col items-center justify-center border border-black/5 dark:border-white/5 active:scale-95 transition-transform duration-300 select-none
                          ${
                            cell.isObstacle 
                              ? 'bg-neutral-300 dark:bg-black border border-neutral-400 dark:border-zinc-900 cursor-not-allowed opacity-90'
                              : cell.isTarget 
                              ? `bg-neutral-200/60 dark:bg-[#111111] border ${currentTheme.targetBorder} animate-pulse`
                              : cell.isTrigger
                              ? `bg-neutral-200/60 dark:bg-[#111111] border ${currentTheme.triggerBorder} cursor-pointer`
                              : 'bg-neutral-200/60 dark:bg-[#111111] border border-neutral-300 dark:border-zinc-800 hover:border-neutral-400 dark:hover:border-zinc-700 cursor-pointer'
                          }
                          ${isPart ? `bg-neutral-200 dark:bg-zinc-900 ${currentTheme.targetBorderSpecial}` : ''}
                          ${isCellFailed ? `bg-red-50 dark:bg-red-950/20 ${currentTheme.triggerBorderSpecial}` : ''}
                          ${isTutorialTarget ? `${currentTheme.targetBorderSpecial} ring-2 ${currentTheme.targetRing} animate-pulse` : ''}
                          ${isTutorialInactive ? 'opacity-30 pointer-events-none' : ''}
                        `}
                        style={{
                          boxShadow: cell.isTarget 
                            ? `0 0 15px ${currentTheme.targetGlow}`
                            : cell.isTrigger 
                            ? `0 0 15px ${currentTheme.triggerGlow}`
                            : isPart 
                            ? `0 0 15px ${currentTheme.targetGlowPart}`
                            : isCellFailed
                            ? `0 0 15px ${currentTheme.triggerGlowPart}`
                            : isTutorialTarget
                            ? `0 0 20px ${currentTheme.targetGlowTutorial}`
                            : 'none'
                        }}
                      >
                        {/* Visual markers depending on Cell type */}
                        {cell.isObstacle ? (
                          <div className="w-full h-full flex items-center justify-center relative p-1">
                            <div className="absolute inset-1.5 border border-neutral-300 dark:border-zinc-900 rounded-lg bg-neutral-100 dark:bg-black/60 flex items-center justify-center">
                              <span className="w-2 h-2 bg-neutral-400 dark:bg-zinc-800 rounded-sm rotate-45" />
                            </div>
                          </div>
                        ) : cell.isTarget ? (
                          <div className="flex flex-col items-center justify-center p-1">
                            <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className={`w-5 h-5 border-2 ${currentTheme.targetBorder} rounded-full flex items-center justify-center bg-blue-950/20`}
                            >
                              <div className={`w-1.5 h-1.5 ${currentTheme.targetBg} rounded-full`} />
                            </motion.div>
                          </div>
                        ) : (
                          // Arrows
                          <div className="relative w-full h-full flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: cell.rotationAngle }}
                              transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                              className={`
                                p-2 rounded-full flex items-center justify-center transition-colors
                                ${isPart ? currentTheme.targetText : cell.isTrigger ? currentTheme.triggerText : 'text-neutral-400 dark:text-zinc-500'}
                              `}
                            >
                              <ArrowUp className="w-5 h-5 stroke-[2.2]" />
                            </motion.div>
      
                            {/* Starting core indicator for the trigger block */}
                            {cell.isTrigger && (
                              <span className={`absolute w-2 h-2 rounded ${currentTheme.triggerBg}`} />
                            )}
      
                            {/* Active flow point visual wave */}
                            {isFlowTip && (
                              <span className={`absolute inset-2 rounded-lg border ${currentTheme.targetPing} animate-ping opacity-60 pointer-events-none`} />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </main>

          {/* BOTTOM ACTION BUTTONS AND GAME CONTROLS */}
          <footer className="w-full max-w-md px-6 pb-8 pt-3 z-10 flex-shrink-0 flex flex-col gap-4 items-center">
            <div className="flex items-center justify-between w-full gap-4">
              {/* Restart button (Circle button) */}
              <button
                id="reset-level-btn"
                onClick={handleManualRestart}
                disabled={simulationStatus === 'SIMULATING'}
                className="w-12 h-12 rounded-full border border-neutral-300 dark:border-zinc-800 bg-transparent text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-zinc-900 hover:border-neutral-400 dark:hover:border-zinc-700 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Restart Level"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Trigger/Connect Button */}
              <button
                id="trigger-flow-btn"
                disabled={simulationStatus === 'SIMULATING'}
                onClick={triggerFlow}
                className={`
                  flex-1 py-3.5 rounded-full font-display font-bold text-[11px] uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer
                  ${
                    simulationStatus === 'SIMULATING'
                      ? 'bg-neutral-200 dark:bg-zinc-900 text-neutral-400 dark:text-zinc-600 border border-neutral-300 dark:border-zinc-800/60 cursor-not-allowed shadow-none'
                      : simulationStatus === 'SUCCESS'
                      ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/20 font-semibold'
                      : isTutorialMode && incorrectPathCells.length === 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-lg shadow-blue-500/40 animate-pulse font-bold scale-102 ring-2 ring-blue-500/20'
                      : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black shadow-lg dark:shadow-white/5 active:scale-95'
                  }
                `}
              >
                {simulationStatus === 'SIMULATING' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                    <span>Simulating...</span>
                  </>
                ) : simulationStatus === 'SUCCESS' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-white/10" />
                    <span>Connected</span>
                  </>
                ) : (
                  <span>Connect</span>
                )}
              </button>

              {/* Undo button (Circle button) */}
              <button
                id="undo-move-btn"
                onClick={undoMove}
                disabled={simulationStatus === 'SIMULATING' || history.length === 0}
                className="w-12 h-12 rounded-full border border-zinc-800 bg-transparent text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer hover:bg-zinc-900 hover:border-zinc-700 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Undo Move"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Ad Placement Space */}
            <div className="w-full my-2">
              <AdBanner />
            </div>
          </footer>
        </>
      )}

      {/* OVERLAYS & OVERLAY BANNER DIALOGS */}

      {/* Help Dialog overlay */}
      <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Level selection Drawer overlay */}
      <LevelSelectorDrawer
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        unlockedLevel={unlockedLevel}
        currentLevel={level}
        onSelectLevel={handleSelectLevel}
        levelStars={levelStars}
      />

      {/* Level complete congratulatory overlay modal */}
      <AnimatePresence>
        {simulationStatus === 'SUCCESS' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with extreme blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Completion popover Card */}
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              id="victory-modal-card"
              className="relative w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl text-center z-10 space-y-6"
            >
              {/* Badge header */}
              <div className="flex justify-center">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <Award className="w-6 h-6 text-zinc-100" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h3 className="font-display font-light text-xl text-white tracking-[0.15em] uppercase">Level Clear</h3>
                <p className="text-[10px] text-amber-400 font-mono uppercase tracking-widest font-semibold">COSMIC SALUTATIONS, {profileName}!</p>
                <p className="text-[9px] text-zinc-500 font-mono uppercase">SOLVED IN {movesUsed} MOVES</p>
              </div>

              {/* Stars Earned pop animation */}
              <div className="flex justify-center gap-3 py-1">
                {[1, 2, 3].map((starIdx) => (
                  <motion.div
                    key={starIdx}
                    initial={{ scale: 0, rotate: -60, opacity: 0 }}
                    animate={{ 
                      scale: starIdx <= starsEarned ? 1 : 0.85, 
                      rotate: starIdx <= starsEarned ? 0 : -15,
                      opacity: 1
                    }}
                    transition={{ 
                      delay: 0.25 + starIdx * 0.22, 
                      type: 'spring', 
                      damping: 10, 
                      stiffness: 140 
                    }}
                  >
                    <Star
                      className={`
                        w-8 h-8 
                        ${
                          starIdx <= starsEarned 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                            : 'text-zinc-800 fill-zinc-950'
                        }
                      `}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Par info block */}
              <div className="bg-zinc-900/40 rounded-xl p-3.5 space-y-1 border border-zinc-900">
                <div className="flex justify-between items-center text-xs px-2">
                  <span className="text-zinc-500">Your Moves Used:</span>
                  <span className="font-mono font-bold text-zinc-200">{movesUsed}</span>
                </div>
                {level === 1 ? (
                  <div className="flex justify-between items-center text-xs px-2 border-t border-zinc-900 pt-1.5 mt-1.5">
                    <span className="text-zinc-500">Goal:</span>
                    <span className="font-mono font-bold text-amber-400">Tutorial Clear</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-xs px-2 border-t border-zinc-900 pt-1.5 mt-1.5">
                      <span className="text-zinc-500">{attemptCount <= 2 ? "3-Star Goal:" : "2-Star Goal (Max Cap):"}</span>
                      <span className="font-mono font-bold text-amber-400">
                        {`\u2264 ${perfectMoves}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs px-2 border-t border-zinc-900 pt-1.5 mt-1.5">
                      <span className="text-zinc-500">{attemptCount <= 2 ? "2-Star Goal:" : "1-Star Goal:"}</span>
                      <span className="font-mono font-bold text-zinc-300">
                        {`\u2264 ${perfectMoves + 3}`}
                      </span>
                    </div>
                    {attemptCount > 2 && (
                      <div className="text-[10px] text-red-400 font-mono pt-1.5 border-t border-zinc-900 uppercase">
                        Replay Star Capping Active (Max 2★)
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Action buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    const isCompleted = levelStars[level] !== undefined && levelStars[level] > 0;
                    if (isCompleted) {
                      setIsAdPlaying(true);
                      AdManager.showRewardedAd(
                        () => {
                          setIsAdPlaying(false);
                          executeReset();
                          playFeedback('success');
                        },
                        () => {
                          setIsAdPlaying(false);
                          playFeedback('error');
                        }
                      );
                    } else {
                      executeReset();
                    }
                  }}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-display font-bold text-[11px] tracking-[0.1em] uppercase rounded-full active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
                <button
                  id="modal-next-level-btn"
                  onClick={handleNextLevel}
                  className="flex-1 py-3 bg-zinc-50 hover:bg-zinc-200 text-black font-display font-bold text-[11px] tracking-[0.1em] uppercase rounded-full shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Level restart confirmation overlay modal */}
      <AnimatePresence>
        {showRestartConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with extreme blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowRestartConfirm(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl text-center z-10 space-y-6"
            >
              {!modalAdView ? (
                <>
                  {/* Badge header */}
                  <div className="flex justify-center">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-red-500">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="font-display font-light text-xl text-white tracking-[0.15em] uppercase">
                      Restart Level?
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      This will deduct 10 stars from your total balance.
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 rounded-xl p-3.5 space-y-1 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs px-2">
                      <span className="text-zinc-500">Your Current Stars:</span>
                      <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                        {totalStars}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs px-2 border-t border-zinc-900 pt-1.5 mt-1.5">
                      <span className="text-zinc-500">Cost to Restart:</span>
                      <span className="font-mono font-bold text-red-400">-10 Stars</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={handleConfirmRestart}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowRestartConfirm(false)}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full active:scale-98 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Switch View: Trigger Ad view inside modal */}
                  <div className="flex justify-center">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-light text-xl text-white tracking-[0.15em] uppercase">
                      Not Enough Stars
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      Restart requires 10 Stars
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed border border-zinc-900 space-y-3">
                    <p>
                      Your current balance is <strong className="text-amber-400 font-mono">{totalStars} Stars</strong>.
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Watch a quick 3-second sponsor ad to get a <strong className="text-zinc-200">Free Action Token</strong> instead!
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        setShowRestartConfirm(false);
                        setModalAdView(false);
                        setIsAdPlaying(true);
                        AdManager.showRewardedAd(
                          () => {
                            setIsAdPlaying(false);
                            executeReset();
                            playFeedback('success');
                          },
                          () => {
                            setIsAdPlaying(false);
                            playFeedback('error');
                          }
                        );
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Watch Rewarded Ad</span>
                    </button>

                    <button
                      onClick={() => setShowRestartConfirm(false)}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full active:scale-98 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Over Popup Flow */}
      <AnimatePresence>
        {showGameOverPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with extreme blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-black/95 border border-red-500/30 rounded-3xl p-6 shadow-2xl text-center z-10 space-y-6 overflow-hidden"
            >
              {/* Dark Cyberpunk Ambient Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              {!showPenaltySelection ? (
                <>
                  {/* GAME OVER HEADER */}
                  <div className="space-y-1">
                    <h2 className="font-display font-extrabold text-3xl tracking-[0.2em] text-red-500 uppercase animate-pulse">
                      Game Over
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">
                      Your flow was disrupted
                    </p>
                  </div>

                  {/* 0 STARS EARNED BREAKDOWN */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className="w-8 h-8 text-zinc-800"
                        />
                      ))}
                    </div>
                    <p className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                      0 Stars Earned
                    </p>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Failures on current level: <span className="text-zinc-300 font-bold font-mono">{gameOverCount}</span> / 3
                    </div>
                  </div>

                  {/* OPTION BUTTON: REPLAY */}
                  <button
                    onClick={handleGameOverReplay}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-display font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-red-600/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Replay
                  </button>
                </>
              ) : (
                <>
                  {/* PENALTY SELECTION VIEW */}
                  <div className="space-y-1">
                    <h2 className="font-display font-extrabold text-2xl tracking-[0.15em] text-amber-500 uppercase">
                      Continue?
                    </h2>
                    <p className="text-[9px] text-red-400 font-mono uppercase tracking-widest font-semibold">
                      3rd Strike Penalty Active
                    </p>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-2 text-left">
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                      You have failed <span className="text-red-400 font-bold">3 times</span>! To clear the board and continue, please select a payment method:
                    </p>
                    <div className="flex justify-between items-center text-xs px-1 border-t border-zinc-900 pt-2 mt-2">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Your Stars:</span>
                      <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {totalStars}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* CHOICE A: PAY 10 STARS */}
                    <div className="space-y-1">
                      <button
                        disabled={totalStars < 10}
                        onClick={handlePayStarsPenalty}
                        className={`w-full py-3 rounded-xl font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                          totalStars >= 10
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95'
                            : 'bg-zinc-950/40 border-zinc-900 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                        Pay 10 Stars
                      </button>
                      {totalStars < 10 && (
                        <p className="text-[8px] text-red-400 font-mono text-center uppercase tracking-wider font-medium">
                          Insufficient stars. Must watch an ad to continue.
                        </p>
                      )}
                    </div>

                    {/* CHOICE B: WATCH AN AD */}
                    <button
                      onClick={handleWatchAdPenalty}
                      className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-display font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Watch Ad to Recover Free
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Ad Placement Flow Overlay */}
      <AnimatePresence>
        {adReason !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with extreme blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Pre-Ad prompt card: choice to watch ad or cancel */}
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl text-center z-10 space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-light text-xl text-white tracking-[0.15em] uppercase">
                  Not Enough Stars
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                  {adReason === 'undo' ? "Undo requires 3 Stars" : "Restart requires 10 Stars"}
                </p>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed border border-zinc-900 space-y-3">
                <p>
                  Your current balance is <strong className="text-amber-400 font-mono">{totalStars} Stars</strong>.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Watch a quick sponsor ad to get a <strong className="text-zinc-200">Free Action Token</strong> instead!
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const reason = adReason;
                    setAdReason(null);
                    setIsAdPlaying(true);
                    AdManager.showRewardedAd(
                      () => {
                        setIsAdPlaying(false);
                        if (reason === 'undo') {
                          executeUndo();
                        } else if (reason === 'restart') {
                          executeReset();
                        }
                        playFeedback('success');
                      },
                      () => {
                        setIsAdPlaying(false);
                        playFeedback('error');
                      }
                    );
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Rewarded Ad</span>
                </button>

                <button
                  onClick={() => setAdReason(null)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-display font-bold text-xs tracking-[0.1em] uppercase rounded-full active:scale-98 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hamburger Menu Overlay Drawer */}
      <div
        id="hamburger-menu-drawer"
        className={`fixed inset-0 z-50 bg-white/98 dark:bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all duration-300 ease-in-out ${
          isMenuOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-105"
        }`}
      >
        {/* Close button top right */}
        <button
          id="hamburger-close-btn"
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-lg bg-neutral-100 dark:bg-zinc-900/50 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center z-50"
          title="Close Menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-w-sm flex flex-col items-center space-y-6">
          <div className="text-center mb-4">
            <div className="font-display font-light text-3xl tracking-[0.3em] uppercase bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
              GridFlow
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-zinc-500 font-mono tracking-[0.2em] uppercase mt-1">Navigation Menu</div>
          </div>

          {currentActiveOverlay === 'main' && (
            <div className="w-full space-y-3.5 flex flex-col">
              {/* HOME Button */}
              <button
                onClick={navigateToHome}
                className="w-full py-4 px-6 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-zinc-900 hover:text-neutral-900 dark:hover:text-white text-neutral-900 dark:text-white font-display font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
              >
                <span className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-neutral-500 dark:text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  Home / Active Grid
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* SETTINGS Button */}
              <button
                onClick={() => setCurrentActiveOverlay('settings')}
                className="w-full py-4 px-6 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-zinc-900 hover:text-neutral-900 dark:hover:text-white text-neutral-900 dark:text-white font-display font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-neutral-500 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
                  Settings
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* ABOUT GAME Button */}
              <button
                onClick={() => setCurrentActiveOverlay('about')}
                className="w-full py-4 px-6 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-zinc-900 hover:text-neutral-900 dark:hover:text-white text-neutral-900 dark:text-white font-display font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
              >
                <span className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-neutral-500 dark:text-zinc-500 group-hover:text-purple-500 transition-colors" />
                  About Game
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {currentActiveOverlay === 'settings' && (
            <div className="w-full space-y-4 bg-neutral-200/80 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/30 p-6 rounded-2xl flex flex-col items-center">
              <div className="flex items-center justify-between w-full border-b border-neutral-350 dark:border-zinc-800/60 pb-3 mb-1">
                <span className="text-[11px] font-mono tracking-widest text-neutral-850 dark:text-neutral-200 uppercase">Sound & Audio</span>
                <button
                  onClick={() => setCurrentActiveOverlay('main')}
                  className="text-[10px] font-mono text-neutral-500 dark:text-zinc-500 uppercase underline decoration-neutral-300 dark:decoration-zinc-750 underline-offset-4"
                >
                  Back
                </button>
              </div>

              {/* Audio Toggle in Menu */}
              <div className="flex items-center justify-between w-full py-1">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-display text-neutral-800 dark:text-neutral-200 font-semibold uppercase tracking-wider">Master Sound Toggle</span>
                  <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">Mute or enable all sound cues</span>
                </div>
                <button
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    setStorageItem(STORAGE_KEYS.SOUND_ENABLED, String(next));
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    soundEnabled ? "bg-amber-500" : "bg-neutral-300 dark:bg-zinc-800"
                  } relative flex items-center cursor-pointer`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                      soundEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* SFX Volume Slider */}
              <div className="w-full py-2 border-t border-neutral-300 dark:border-zinc-800/40 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full text-left">
                  <div className="flex flex-col">
                    <span className="text-xs font-display text-neutral-800 dark:text-neutral-200 font-semibold uppercase tracking-wider">SFX Volume</span>
                    <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">Control sound effects levels</span>
                  </div>
                  <span className="text-xs font-mono text-pink-500 font-semibold">{Math.round(audioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAudioVolume(val);
                    setStorageItem(STORAGE_KEYS.AUDIO_VOLUME, val);
                  }}
                  className="w-full h-1 bg-neutral-300 dark:bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Haptic Feedback Slider */}
              <div className="w-full py-2 border-t border-neutral-300 dark:border-zinc-800/40 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full text-left">
                  <div className="flex flex-col">
                    <span className="text-xs font-display text-neutral-800 dark:text-neutral-200 font-semibold uppercase tracking-wider">Haptic Intensity</span>
                    <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">Adjust tactile feedback power</span>
                  </div>
                  <span className="text-xs font-mono text-pink-500 font-semibold">{Math.round(hapticIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={hapticIntensity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setHapticIntensity(val);
                    setStorageItem(STORAGE_KEYS.HAPTIC_INTENSITY, val);
                    triggerHaptic('light', val);
                  }}
                  className="w-full h-1 bg-neutral-300 dark:bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Theme Selector - temporarily hidden during testing */}
              {/*
              <div className="w-full py-2 border-t border-neutral-300 dark:border-zinc-800/40 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full text-left">
                  <div className="flex flex-col">
                    <span className="text-xs font-display text-neutral-800 dark:text-zinc-200 font-semibold uppercase tracking-wider">System Theme</span>
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-zinc-500 mt-0.5">Toggle visual interface appearance</span>
                  </div>
                </div>
                <div className="flex w-full bg-neutral-200/60 dark:bg-zinc-950/60 p-1 rounded-xl border border-neutral-300 dark:border-zinc-800/60 gap-1 mt-1">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setAppTheme(t);
                        localStorage.setItem('arrow_connect_app_theme', t);
                        playFeedback('click');
                      }}
                      className={`flex-1 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        appTheme === t
                          ? "bg-pink-500 text-white shadow-sm"
                          : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-300/40 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              */}

              <button
                onClick={() => setCurrentActiveOverlay('main')}
                className="w-full mt-4 py-2.5 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-300 border border-neutral-300 dark:border-neutral-700 font-mono text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer"
              >
                Return to Menu
              </button>
            </div>
          )}

          {currentActiveOverlay === 'about' && (
            <div className="w-full bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/30 p-5 rounded-2xl flex flex-col items-center space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
              <div className="flex items-center justify-between w-full border-b border-neutral-350 dark:border-zinc-800/60 pb-3 mb-1">
                <span className="text-[11px] font-mono tracking-widest text-neutral-850 dark:text-neutral-200 uppercase">About GridFlow</span>
                <button
                  onClick={() => setCurrentActiveOverlay('main')}
                  className="text-[10px] font-mono text-neutral-500 dark:text-zinc-500 uppercase underline decoration-neutral-300 dark:decoration-zinc-700 underline-offset-4"
                >
                  Back
                </button>
              </div>

              {/* Developer Profile Card */}
              <div className="w-full bg-neutral-100 dark:bg-zinc-950/60 border border-neutral-300 dark:border-zinc-900/60 rounded-xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500 font-display font-black text-lg">
                  N
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-neutral-800 dark:text-neutral-100 tracking-wide uppercase">Navdeep / Nani</h3>
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-zinc-500 mt-0.5">Game Developer & Engineer</p>
                </div>
                <div className="flex gap-3 mt-1">
                  <a 
                    href="https://github.com/Navdeep0p" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/navdeep-reddy-518176315/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href="mailto:navdeep333666@gmail.com" 
                    className="p-2 rounded-lg bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-neutral-300 dark:border-zinc-800/60" />

              {/* How To Play Section */}
              <div className="w-full space-y-2 text-left">
                <h4 className="text-[11px] font-display font-bold tracking-wider text-pink-500 uppercase">How to Play</h4>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed list-none pl-0">
                  <li className="flex gap-2">
                    <span className="text-pink-500 font-mono font-bold">•</span>
                    <span>Connect the matching nodes on the grid by drawing paths through the directional arrow tiles.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-500 font-mono font-bold">•</span>
                    <span>Paths must follow the direction indicated by each arrow tile they pass through.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-500 font-mono font-bold">•</span>
                    <span>Win the level by successfully connecting the nodes within or under the specified Move Goal.</span>
                  </li>
                </ul>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-neutral-300 dark:border-zinc-800/60" />

              {/* Strike System & Economy Section */}
              <div className="w-full space-y-2 text-left">
                <h4 className="text-[11px] font-display font-bold tracking-wider text-amber-500 uppercase">Strike System & Economy</h4>
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed list-none pl-0">
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-mono font-bold">•</span>
                    <span>You have a 3-strike failure system per puzzle attempt.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-mono font-bold">•</span>
                    <span>Clearing a puzzle within the move goal earns you up to 3 Stars.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-mono font-bold">•</span>
                    <span>Failing a level 3 times triggers a Game Over state, applying a 10-star penalty or requiring an ad-watch to continue.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setCurrentActiveOverlay('main')}
                className="w-full py-2.5 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-300 border border-neutral-300 dark:border-neutral-700 font-mono text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer"
              >
                Return to Menu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rewarded Ad Simulated Player overlay */}
      <AnimatePresence>
        {isAdPlaying && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-neutral-100 dark:bg-zinc-950 border border-neutral-350 dark:border-zinc-900 rounded-2xl p-8 shadow-2xl text-center z-10 flex flex-col justify-center items-center space-y-6"
            >
              <div className="text-[10px] text-pink-500 font-mono tracking-[0.2em] uppercase border border-pink-500/20 px-3 py-1 rounded-full bg-pink-500/5">
                SPONSOR PRESENTATION
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-neutral-800 dark:text-white font-display text-sm uppercase tracking-widest font-semibold">
                  Playing Sponsor Video Ad...
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-zinc-400 px-4 leading-relaxed">
                  Please wait 1 second while your Action Token is being secured.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
