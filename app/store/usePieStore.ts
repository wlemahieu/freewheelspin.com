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
  idleInterval: NodeJS.Timeout | null;
  incrementDuration: () => void;
  isSpinning: boolean | undefined;
  optionsModalVisible: boolean;
  pieTextModalVisible: boolean;
  propagateWheel: () => void;
  resetDuration: () => void;
  rotateIdle: () => void;
  rotation: number;
  setAudio: (audio: HTMLAudioElement) => void;
  setBackdropVisible: (visible: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  setRotation: (spinSpeed: number) => void;
  setSpinSpeed: (spinSpeed: number) => void;
  showBackdrop: () => void;
  spinSpeed: number;
  spinInterval: NodeJS.Timeout | null;
  startWheel: () => void;
  stopWheel: () => void;
  winner: Slice | undefined;
  setWinner: (winner: Slice | undefined) => void;
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
  idleInterval: null,
  incrementDuration: () => {
    return set((state) => ({ duration: state.duration + 1 }));
  },
  isSpinning: undefined,
  optionsModalVisible: false,
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
  setRotation: (spinSpeed) =>
    set((state) => {
      return {
        rotation:
          state.rotation >= 359
            ? spinSpeed
            : Math.min(360, state.rotation + spinSpeed),
      };
    }),
  showBackdrop: () => set({ backdropVisible: true }),
  setSpinSpeed: (spinSpeed) => set({ spinSpeed }),
  spinInterval: null,
  spinSpeed: DEFAULT_SPEED,
  startWheel: () => {
    set((state) => {
      if (state.audio) {
        state.audio.pause();
      }
      const audioElement = new Audio("/spin.m4a");
      audioElement.currentTime = 0.75;
      audioElement.volume = 0.25;
      audioElement.playbackRate = 0.8;
      audioElement?.play();

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
        idleInterval: null,
        isSpinning: true,
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
  stopWheel: () => {
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
        spinInterval: null,
        spinSpeed: DEFAULT_SPEED,
      };
    });
  },
  winner: undefined,
  setWinner: (winner: Slice | undefined) => set({ winner }),
}));
