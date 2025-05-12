import { usePickerStore } from "./useStore";

export default function Picker() {
  const setPickerRef = usePickerStore((state) => state.setPickerRef);
  return (
    <>
      <mesh
        ref={(el) => {
          if (el) {
            setPickerRef(el);
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
