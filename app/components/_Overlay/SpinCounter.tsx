import { useSubscribeMetricsData } from "../useEffects";
import { useDataStore } from "../useStore";

export default function SpinCounter() {
  useSubscribeMetricsData();
  const { totalSpins } = useDataStore();
  return <span>total spins: {totalSpins}</span>;
}
