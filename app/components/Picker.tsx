export default function Picker() {
  return (
    <mesh position={[-1.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
      <boxGeometry args={[0.0125, 0.4, 0.0125]} />
      <meshPhongMaterial />
    </mesh>
  );
}
