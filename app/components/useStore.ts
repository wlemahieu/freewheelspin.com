import { create } from "zustand";
import * as THREE from "three";

const DEV_HITBOXES = false; // Set to true to enable hitboxes for debugging
const names = [
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
].sort(() => Math.random() - 0.5);

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
  pickerRef: THREE.Mesh | null;
  pickerPosition: THREE.Vector3;
  raycaster: THREE.Raycaster;
  rayDirection: THREE.Vector3;
  setPickerRef: (pickerRef: THREE.Mesh) => void;
  segmentRefs: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[];
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
  spinnerRef: THREE.Group | null;
  spinVelocity: number;
  setSpinVelocity: (spinVelocity: number) => void;
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

export const usePickerStore = create<PickerStore>((set) => ({
  pickerRef: null,
  pickerPosition: new THREE.Vector3(),
  raycaster: new THREE.Raycaster(),
  rayDirection: new THREE.Vector3(5, 0, 0),
  setPickerRef: (pickerRef: THREE.Mesh) => set({ pickerRef }),
  segmentRefs: [],
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
    const previousWinner = get().selectedName;
    const names = get().names.filter((name) => name !== previousWinner);
    return set({
      isSpinning: true,
      spinVelocity: 0.2,
      selectedName: "",
      names,
    });
  },
  spinnerRef: null,
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
