import { Modal } from "~/components/Modal";
import { PieStore, usePieStore } from "~/store/usePieStore";
import { SpinButton } from "./SpinButton";

export function WinnerModal() {
  const { handleCloseWinnerModal, winner } = usePieStore<PieStore>(
    (state) => state
  );

  if (!winner) return null;

  return (
    <Modal
      className="overflow-y-auto"
      handleCloseModal={handleCloseWinnerModal}
      hideHeader={true}
      modalVisible={Boolean(winner)}
    >
      <div className="flex text-4xl text-white text-center items-center justify-between opacity-90 w-auto h-30 px-8 py-4 bg-gray-800 rounded-lg gap-x-3 ">
        <div className="relative w-full">
          <span className="font-bold">{winner?.text} - You won!</span>
          <SpinButton
            className="absolute right-0 text-lg px-2 py-2"
            text="Spin again"
          />
        </div>
      </div>
    </Modal>
  );
}
