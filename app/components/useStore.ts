import { create } from "zustand";
import * as THREE from "three";

const DEV_HITBOXES = false; // Set to true to enable hitboxes for debugging
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

type SpinnerStore = {
  currentName: string;
  selectedName: string;
  setSelectedName: (name: string) => void;
  setCurrentName: (name: string) => void;
  names: string[];
  setNames: (names: string[]) => void;
  spinCompleted: boolean;
  setSpinCompleted: () => void;
  spinWheel: () => void;
  spinVelocity: number;
  setSpinVelocity: (spinVelocity: number) => void;
  isSpinning: boolean;
  setSpinning: () => void;
  visibleHitboxes: boolean;
};

type RefStore = {
  pickerRef: THREE.Mesh | null;
  setPickerRef: (pickerRef: THREE.Mesh) => void;
  segmentRefs: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[];
  setSegmentRefs: (segmentRefs: RefStore["segmentRefs"]) => void;
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

export const useSpinnerStore = create<SpinnerStore>((set, get) => ({
  currentName: "",
  selectedName: "",
  setCurrentName: (name: string) => set({ currentName: name }),
  setSelectedName: (name: string) => set({ selectedName: name }),
  names,
  setNames: (names: string[]) => set({ names }),
  isSpinning: false,
  spinVelocity: 0,
  spinWheel: () => {
    return set({ isSpinning: true, spinVelocity: 0.2 });
  },
  setSpinVelocity: (spinVelocity: number) => set({ spinVelocity }),
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

export const useRefstore = create<RefStore>((set) => ({
  pickerRef: null,
  setPickerRef: (pickerRef: THREE.Mesh) => set({ pickerRef }),
  segmentRefs: [],
  setSegmentRefs: (
    segmentRefs: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  ) => set({ segmentRefs }),
}));
