import {
  useAnimateSpinningWheel,
  useElevateSelectedSlice,
  useCalculateSelectedName,
  useSyncSceneRemovedSlices,
  usePresentWinner,
} from "./useEffects";
import SegmentSlice from "./_Spinner/SegmentSlice";
import { useSpinnerStore } from "./useStore";
import SpinnerHitbox from "./_Spinner/SpinnerHitbox";

export default function Spinner() {
  useAnimateSpinningWheel();
  useCalculateSelectedName();
  useElevateSelectedSlice();
  useSyncSceneRemovedSlices();
  usePresentWinner();

  const slices = useSpinnerStore((s) => s.slices);

  return (
    <group
      ref={(el) => {
        useSpinnerStore.getState().spinnerRef = el;
      }}
    >
      <SpinnerHitbox />
      {slices.map((slice, index) => (
        <SegmentSlice
          key={`slice-${index}-${slice.name}`}
          index={index}
          slice={slice}
        />
      ))}
    </group>
  );
}
