import { usePicker } from "../useStore";

export default function Picker() {
  const setPicker = usePicker((state) => state.setPicker);
  return (
    <>
      <mesh
        ref={(el) => {
          if (el) {
            setPicker(el);
          }
        }}
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
