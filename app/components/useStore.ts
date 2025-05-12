import { create } from "zustand";
import * as THREE from "three";

const DEV_HITBOXES = false;
const names = shuffleArray([
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
]);

function shuffleArray(array: string[]) {
  return array.sort(() => Math.random() - 0.5);
}

type AppStore = {
  userInteracted: boolean;
  setUserInteracted: (userInteracted: boolean) => void;
};

type CameraStore = {
  camera: THREE.OrthographicCamera | null;
  setCamera: (camera: THREE.OrthographicCamera | null) => void;
  view: "2D" | "3D" | null;
  view2D: () => void;
  view3D: () => void;
};

type PickerStore = {
  picker: THREE.Mesh | null;
  setPicker: (picker: THREE.Mesh | null) => void;
};

type SpinnerStore = {
  currentName: string;
  selectedName: string;
  setSelectedName: (name: string) => void;
  setCurrentName: (name: string) => void;
  names: string[];
  setNames: (names: string[]) => void;
  spinCompleted: boolean;
  setSpinCompleted: () => void;
  isSpinning: boolean;
  setSpinning: () => void;
  visibleHitboxes: boolean;
};

export const useAppStore = create<AppStore>((set) => ({
  userInteracted: false,
  setUserInteracted: (userInteracted: boolean) => set({ userInteracted }),
}));

export const useCameraStore = create<CameraStore>((set, get) => ({
  camera: null,
  setCamera: (camera: THREE.OrthographicCamera | null) => set({ camera }),
  view: "3D",
  view2D: () => {
    const camera = get().camera;
    if (!camera) return;
    camera.position.set(0, 15, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    set({ view: "2D" });
  },
  view3D: () => {
    const camera = get().camera;
    if (!camera) return;
    camera.position.set(0, 15, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    set({ view: "3D" });
  },
}));

export const usePicker = create<PickerStore>((set) => ({
  picker: null,
  setPicker: (picker: THREE.Mesh | null) => set({ picker }),
}));

export const useSpinnerStore = create<SpinnerStore>((set, get) => ({
  currentName: "",
  selectedName: "",
  setCurrentName: (name: string) => set({ currentName: name }),
  setSelectedName: (name: string) => set({ selectedName: name }),
  names,
  setNames: (names: string[]) => set({ names }),
  isSpinning: false,
  setSpinCompleted: () => {
    const selectedName = get().currentName;
    return set({ spinCompleted: true, isSpinning: false, selectedName });
  },
  setSpinning: () => {
    set({ spinCompleted: false, isSpinning: true });
    return set({ selectedName: "" });
  },
  spinCompleted: false,
  visibleHitboxes: DEV_HITBOXES,
}));
