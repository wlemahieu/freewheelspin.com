import { create } from "zustand";

export const DEFAULT_SPEED = 300;
export const ROTATION_INTERVAL_MS = 10;
export const DECAY_RATE = 0.9991;
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
];

type Slice = { text: string; color: string; degrees: number[] };

export type PieStore = {
  backdropVisible: boolean;
  duration: number;
  durationInterval: NodeJS.Timeout | null;
  handleCancelSpin: () => void;
  handleOpenPieTextModal: () => void;
  handleClosePieTextModal: () => void;
  hideBackdrop: () => void;
  idleInterval: NodeJS.Timeout | null;
  incrementDuration: () => void;
  isSpinning: boolean | undefined;
  pieTextModalVisible: boolean;
  propagateWheel: () => void;
  resetDuration: () => void;
  rotateIdle: () => void;
  rotation: number;
  setBackdropVisible: (visible: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  setPieTextModalVisible: (visible: boolean) => void;
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
  hideBackdrop: () => set({ backdropVisible: false }),

  idleInterval: null,
  incrementDuration: () => {
    return set((state) => ({ duration: state.duration + 1 }));
  },
  isSpinning: undefined,
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
          Math.pow(state.spinSpeed, DECAY_RATE) - expontentialDecay;
        if (state.idleInterval) {
          clearInterval(state.idleInterval);
        }
        return {
          idleInterval: null,
          rotation: state.rotation >= 359 ? 0 : state.rotation + spinSpeed,
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
  setBackdropVisible: (visible) => set({ backdropVisible: visible }),
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
  setPieTextModalVisible: (visible) => set({ pieTextModalVisible: visible }),
  setRotation: (spinSpeed) =>
    set((state) => ({
      rotation: state.rotation === 359 ? 0 : state.rotation + spinSpeed,
    })),
  showBackdrop: () => set({ backdropVisible: true }),
  setSpinSpeed: (spinSpeed) => set({ spinSpeed }),
  spinInterval: null,
  spinSpeed: DEFAULT_SPEED,
  startWheel: () => {
    set((state) => {
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
