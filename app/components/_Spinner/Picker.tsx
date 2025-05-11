import * as THREE from "three";

export default function Picker({
  pickerRef,
}: {
  pickerRef: React.RefObject<THREE.Mesh | null>;
}) {
  return (
    <mesh
      ref={pickerRef}
      position={[-6, -0.1, 0]}
      rotation={[0, 0, Math.PI / 2]}
    >
      <boxGeometry args={[0.5, 2, 0.1]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}
