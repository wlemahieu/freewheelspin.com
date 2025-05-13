import { usePickerStore, useSpinnerStore } from "./useStore";

export default function Picker() {
  const visibleHitboxes = useSpinnerStore((state) => state.visibleHitboxes);
  const setPickerRef = usePickerStore((state) => state.setPickerRef);

  return (
    <>
      <mesh
        ref={(el) => {
          if (el) {
            setPickerRef(el);
          }
        }}
        position={[-1.15, 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        visible={visibleHitboxes}
      >
        <boxGeometry args={[0.0125, 0.4, 0.0125]} />
        {visibleHitboxes && <meshBasicMaterial color={"red"} />}
      </mesh>
      <mesh position={[-1.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.0125, 0.4, 0.0125]} />
        <meshPhongMaterial />
      </mesh>
    </>
  );
}
