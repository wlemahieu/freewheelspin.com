import { create } from "zustand";

export const DEFAULT_SPEED = 100;
export const DECAY_RATE = 0.9995;
export const ROTATION_INTERVAL_MS = 10;
export const IDLE_SPEED = 0.25;
export const DEFAULT_OPTIONS = [
  {
    text: "Wes",
    color: "lightblue",
  },
  {
    text: "Diego",
    color: "lightgreen",
  },
  {
    text: "Marcus",
    color: "orange",
  },
  {
    text: "Pedro",
    color: "red",
  },
  {
    text: "Edgar",
    color: "green",
  },
  {
    text: "Karl",
    color: "blue",
  },
  { text: "Maisey", color: "yellow" },
];

export type Slice = { text: string; color: string; degrees?: number[] };

export type PieStore = {
  audio: HTMLAudioElement | null;
  backdropVisible: boolean;
  duration: number;
  durationInterval: NodeJS.Timeout | null;
  handleCancelSpin: () => void;
  handleOpenOptionsModal: () => void;
  handleCloseOptionsModal: () => void;
  handleOpenPieTextModal: () => void;
  handleClosePieTextModal: () => void;
  hideBackdrop: () => void;
  idle: boolean | undefined;
  idleInterval: NodeJS.Timeout | null;
  incrementDuration: () => void;
  isMuted: boolean | undefined;
  isSpinning: boolean | undefined;
  mute: () => void;
  optionsModalVisible: boolean;
  paused: boolean;
  pieTextModalVisible: boolean;
  propagateWheel: () => void;
  resetDuration: () => void;
  rotateIdle: () => void;
  rotation: number;
  setAudio: (audio: HTMLAudioElement) => void;
  setBackdropVisible: (visible: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  setMuted: (muted: boolean) => void;
  setRotation: (spinSpeed: number) => void;
  setSlices: (slices: Array<Slice>) => void;
  setSpinSpeed: (spinSpeed: number) => void;
  setWinner: (winner: Slice | undefined) => void;
  showBackdrop: () => void;
  slices: Array<Slice>;
  spinSpeed: number;
  spinInterval: NodeJS.Timeout | null;
  startWheel: () => void;
  stopWheel: (paused?: boolean) => void;
  unMute: () => void;
  winner: Slice | undefined;
};

export const usePieStore = create<PieStore>((set) => ({
  audio: null,
  backdropVisible: false,
  duration: 0,
  durationInterval: null,
  handleCancelSpin: () => {
    set({ backdropVisible: false, isSpinning: true });
  },
  handleOpenPieTextModal: () => {
    set({ backdropVisible: true, pieTextModalVisible: true });
  },
  handleClosePieTextModal: () => {
    set({ backdropVisible: false, pieTextModalVisible: false });
  },
  handleOpenOptionsModal: () => {
    set({ backdropVisible: true, optionsModalVisible: true });
  },
  handleCloseOptionsModal: () => {
    set({ backdropVisible: false, optionsModalVisible: false });
  },
  hideBackdrop: () => set({ backdropVisible: false }),
  idle: undefined,
  idleInterval: null,
  incrementDuration: () => {
    return set((state) => ({ duration: state.duration + 1 }));
  },
  isMuted: true,
  isSpinning: undefined,
  mute: () => {
    localStorage.setItem("muted", JSON.stringify(true));
    return set((state) => {
      if (state.audio) {
        state.audio.pause();
      }
      return {
        isMuted: true,
      };
    });
  },
  optionsModalVisible: false,
  paused: false,
  pieTextModalVisible: false,
  propagateWheel: () => {
    set((state) => {
      if (state.spinSpeed > 0) {
        const speedOffset = DEFAULT_SPEED - state.spinSpeed;
        const expontentialDecay = speedOffset ? speedOffset / 10000 : 0;
        // without expontentialDecay, the wheel will never stop.
        // 300 default speed equates to a 0-0.03 expontentialDecay
        // create a random number to randomize the spin a bit
        const spinSpeed =
          Math.pow(state.spinSpeed, DECAY_RATE) -
          expontentialDecay; /** (Math.random() * 3)*/
        if (state.idleInterval) {
          clearInterval(state.idleInterval);
        }
        return {
          idleInterval: null,
          rotation:
            state.rotation >= 359
              ? spinSpeed
              : Math.min(360, state.rotation + spinSpeed),
          spinSpeed,
        };
      }
      return state;
    });
  },
  resetDuration: () => set({ duration: 0 }),
  rotateIdle: () => {
    set((state) => {
      if (!state.idleInterval) {
        return {
          paused: false,
          idle: true,
          idleInterval: setInterval(() => {
            return state.setRotation(IDLE_SPEED);
          }, ROTATION_INTERVAL_MS),
        };
      }
      return state;
    });
  },
  rotation: 0,
  setAudio: (audio) => set({ audio }),
  setBackdropVisible: (visible) => set({ backdropVisible: visible }),
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
  setMuted: (muted) => set({ isMuted: muted }),
  setRotation: (spinSpeed) => {
    set((state) => {
      return {
        rotation:
          state.rotation >= 359
            ? spinSpeed
            : Math.min(360, state.rotation + spinSpeed),
      };
    });
  },
  showBackdrop: () => set({ backdropVisible: true }),
  setSlices: (slices) => set({ slices }),
  setSpinSpeed: (spinSpeed) => set({ spinSpeed }),
  setWinner: (winner) => set({ winner }),
  slices: [],
  spinInterval: null,
  spinSpeed: DEFAULT_SPEED,
  startWheel: () => {
    set((state) => {
      if (state.audio) {
        state.audio.pause();
      }
      let audioElement;
      if (!state.isMuted) {
        audioElement = new Audio("/spin.m4a");
        audioElement.currentTime = 0.75;
        audioElement.volume = 0.25;
        audioElement.playbackRate = 0.8;
        audioElement?.play();
      }

      if (state.idleInterval) {
        clearInterval(state.idleInterval);
      }
      if (state.durationInterval) {
        clearInterval(state.durationInterval);
      }
      if (state.spinInterval) {
        clearInterval(state.spinInterval);
      }
      return {
        audio: audioElement,
        idle: false,
        idleInterval: null,
        isSpinning: true,
        paused: false,
        durationInterval: !state.durationInterval
          ? setInterval(state.incrementDuration, 1000)
          : state.durationInterval,
        spinInterval: !state.spinInterval
          ? setInterval(() => {
              state.propagateWheel();
            }, ROTATION_INTERVAL_MS)
          : state.spinInterval,
        winner: undefined,
      };
    });
  },
  stopWheel: (paused = false) => {
    set((state) => {
      if (state.audio) {
        state.audio.pause();
      }
      if (state.durationInterval) {
        clearInterval(state.durationInterval);
      }
      if (state.spinInterval) {
        clearInterval(state.spinInterval);
      }
      if (state.idleInterval) {
        clearInterval(state.idleInterval);
      }
      return {
        audio: null,
        duration: 0,
        durationInterval: null,
        isSpinning: false,
        idleInterval: null,
        paused,
        spinInterval: null,
        spinSpeed: DEFAULT_SPEED,
      };
    });
  },
  unMute: () => {
    localStorage.setItem("muted", JSON.stringify(false));
    return set((state) => {
      if (state.isSpinning && !state.idle) {
        if (state.audio) {
          state.audio.play();
          return {
            isMuted: false,
          };
        }
        const audioElement = new Audio("/spin.m4a");
        audioElement.currentTime = 0.75;
        audioElement.volume = 0.25;
        audioElement.playbackRate = 0.8;
        audioElement?.play();
        return {
          isMuted: false,
          audio: audioElement,
        };
      }

      return {
        isMuted: false,
      };
    });
  },
  winner: undefined,
}));
