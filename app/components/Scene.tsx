import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
import { useRef, useEffect } from "react";

function MouseCamera() {
  const { camera } = useThree();
  const view = useCameraStore((s) => s.view);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    if (view === "3D") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    } else {
      // Reset targets when switching away from 3D
      targetX.current = 0;
      targetY.current = 0;
      mouseX.current = 0;
      mouseY.current = 0;
    }
  }, [view]);

  useFrame(() => {
    if (view === "3D") {
      targetX.current += (mouseX.current * 2 - targetX.current) * 0.08;
      targetY.current += (mouseY.current * 1.5 - targetY.current) * 0.08;
      
      const basePosition = CAMERA_POSITIONS["3D"];
      camera.position.x = basePosition.x + targetX.current;
      camera.position.y = basePosition.y + targetY.current;
      camera.position.z = basePosition.z;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

function CameraController() {
  const { camera } = useThree();
  const view = useCameraStore((s) => s.view);
  
  useEffect(() => {
    const { x, y, z } = CAMERA_POSITIONS[view];
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [view, camera]);
  
  return view === "3D" ? <MouseCamera /> : null;
}

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
          camera: state.camera as THREE.PerspectiveCamera,
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
      <CameraController />
      {view === "2D" && (
        <OrbitControls
          autoRotate={false}
          maxPolarAngle={Math.PI / 3}
          enablePan={false}
          enableRotate={false}
          enableZoom={true}
          minDistance={ORBIT_CONTROL_MIN_DISTANCE}
          maxDistance={ORBIT_CONTROL_MAX_DISTANCE}
        />
      )}
      <Picker />
      <Spinner />
    </Canvas>
  );
}
