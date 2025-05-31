import { useSubscribeMetricsData } from "../useEffects";
import { useFirestoreStore } from "../useStore";

export default function SpinCounter() {
  useSubscribeMetricsData();
  const { totalSpins } = useFirestoreStore();
  return (
    <span className="text-cyan-400 flex gap-x-1 items-center">
      <span className="underline bold italic">all-time spins:</span>
      <span className="text-2xl font-extrabold">{totalSpins}</span>
    </span>
  );
}
