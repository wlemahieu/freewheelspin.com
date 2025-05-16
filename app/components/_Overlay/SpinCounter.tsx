import { useRealtimeFirestoreData } from "../useEffects";
import { useDataStore } from "../useStore";

export default function SpinCounter() {
  useRealtimeFirestoreData();
  const { totalSpins } = useDataStore();
  return <span>total spins: {totalSpins}</span>;
}
