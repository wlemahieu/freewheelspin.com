import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Spinner from "./Spinner";
import * as THREE from "three";
import Picker from "./Picker";
import { useCameraStore, useSpinnerStore } from "./useStore";
import { usePlayAudioSliceChange } from "./useEffects";

export default function Scene() {
  usePlayAudioSliceChange();
  const isSpinning = useSpinnerStore((s) => s.isSpinning);
  const view = useCameraStore((s) => s.view);
  const setCamera = useCameraStore((s) => s.setCamera);

  return (
    <Canvas
      camera={{ position: [0, 15, 10], fov: 60 }}
      onCreated={(state) => {
        state.gl.setClearColor("#000000");
        setCamera(state.camera as THREE.OrthographicCamera);
      }}
    >
      <directionalLight
        color="white"
        position={[-10, 15, 0]}
        intensity={2}
        scale={1}
      />
      <OrbitControls
        autoRotate={!isSpinning}
        maxPolarAngle={Math.PI / 4} // Prevent going under the wheel
        enablePan={false}
        enableRotate={view === "3D"}
        enableZoom={true}
        minDistance={10}
        maxDistance={15}
      />
      <Picker />
      <Spinner />
    </Canvas>
  );
}
