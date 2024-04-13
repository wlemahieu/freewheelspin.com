import { Close } from "flowbite-react-icons/outline";
import { twMerge } from "tailwind-merge";

type ModalProps = {
  className: string;
  children: JSX.Element;
  handleCloseModal: () => void;
  modalVisible: boolean;
  title: string;
};

export function Modal({
  className,
  children,
  handleCloseModal,
  modalVisible,
  title,
}: ModalProps) {
  return (
    <div
      tabIndex={-1}
      className={twMerge(
        "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full",
        modalVisible && "flex",
        className
      )}
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full items-center">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={handleCloseModal}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="default-modal"
            >
              <Close className="w-6 h-6" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
