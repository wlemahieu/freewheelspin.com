import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Spinner from "./Spinner";
import * as THREE from "three";
import Picker from "./Picker";
import {
  ORBIT_CONTROL_MIN_DISTANCE,
  ORBIT_CONTROL_MAX_DISTANCE,
  CAMERA_POSITIONS,
  useAppStore,
  useCameraStore,
} from "./useStore";
import { usePlayAudioSliceChange } from "./useEffects";
import { Sparklesss } from "./Sparkles";

export default function Scene() {
  usePlayAudioSliceChange();
  const axesHelperEnabled = useAppStore((s) => s.axesHelperEnabled);
  const view = useCameraStore((s) => s.view);

  const { x, y, z } = CAMERA_POSITIONS[view];

  return (
    <Canvas
      camera={{ position: [x, y, z], fov: 60 }}
      gl={{ powerPreference: "high-performance" }}
      onCreated={(state) => {
        state.gl.setClearColor("#000000");
        useCameraStore.setState({
          camera: state.camera as THREE.OrthographicCamera,
        });
      }}
    >
      <Sparklesss />

      {axesHelperEnabled && <axesHelper args={[5]} />}
      <directionalLight
        color="white"
        position={[3, 3, 0]}
        intensity={1}
        lookAt={[0, 0, 0]}
      />
      <directionalLight
        color="white"
        position={[-3, 3, 0]}
        intensity={1}
        lookAt={[0, 0, 0]}
      />
      <directionalLight
        color="white"
        position={[0, 3, 3]}
        intensity={1}
        lookAt={[0, 0, 0]}
      />
      <directionalLight
        color="white"
        position={[0, 3, -3]}
        intensity={1}
        lookAt={[0, 0, 0]}
      />
      <OrbitControls
        autoRotate={false}
        maxPolarAngle={Math.PI / 3} // Prevent going under the wheel
        enablePan={false}
        enableRotate={view === "3D"}
        enableZoom={true}
        minDistance={ORBIT_CONTROL_MIN_DISTANCE}
        maxDistance={ORBIT_CONTROL_MAX_DISTANCE}
      />
      <Picker />
      <Spinner />
    </Canvas>
  );
}
