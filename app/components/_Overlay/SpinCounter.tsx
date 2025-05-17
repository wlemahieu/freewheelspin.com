import { useSubscribeMetricsData } from "../useEffects";
import { useFirestoreData } from "../useStore";

export default function SpinCounter() {
  useSubscribeMetricsData();
  const { totalSpins } = useFirestoreData();
  return (
    <span className="text-cyan-400 flex gap-x-1 items-center">
      <span className="underline bold italic">all-time spins:</span>
      <span className="text-2xl font-extrabold">{totalSpins}</span>
    </span>
  );
}
