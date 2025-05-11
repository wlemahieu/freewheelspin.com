import * as THREE from "three";

export default function Picker({
  pickerRef,
}: {
  pickerRef: React.RefObject<THREE.Mesh | null>;
}) {
  return (
    <>
      <mesh
        ref={pickerRef}
        position={[-6, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        visible={false}
      >
        <boxGeometry args={[1, 2, 0.1]} />
      </mesh>
      <mesh position={[-6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshPhongMaterial />
      </mesh>
    </>
  );
}
