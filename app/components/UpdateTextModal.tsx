import {
  FieldMetadata,
  FormId,
  FormProvider,
  getFormProps,
  getInputProps,
  useFormMetadata,
} from "@conform-to/react";
import { Form } from "@remix-run/react";
import { ChevronDown } from "flowbite-react-icons/outline";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { Modal } from "~/components/Modal";
import { PieTextSchema } from "~/schemas/pie-text";
import { PieStore, usePieStore } from "~/usePieStore";

const defaultColors = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "brown",
  "black",
  "lightyellow",
  "lightgreen",
  "lightblue",
  "gray",
  "violet",
];

type UpdateTextModalProps = {
  formId: FormId<z.infer<typeof PieTextSchema>>;
};

export function UpdateTextModal({ formId }: UpdateTextModalProps) {
  const form = useFormMetadata(formId);
  const fields = form.getFieldset();
  const { handleClosePieTextModal, pieTextModalVisible } =
    usePieStore<PieStore>((state) => state);

  const slices = fields.slices.getFieldList();

  function handleSelectColor(color: string, colorField: FieldMetadata) {
    form.update({
      name: colorField.name,
      value: color,
    });
  }

  return (
    <Modal
      className="overflow-y-hidden"
      handleCloseModal={handleClosePieTextModal}
      modalVisible={pieTextModalVisible}
      title="Update text"
    >
      <div className="flex flex-col gap-y-2">
        <Form {...getFormProps(form)} method="post">
          <div className="p-4 md:p-5 space-y-4">
            {slices.map((sliceField) => {
              const { text, color } = sliceField.getFieldset();
              const selectedColor = color.initialValue;
              const filteredColors = defaultColors.reduce((newColors, c) => {
                if (
                  selectedColor === c ||
                  !slices.find((s) => s.initialValue?.color === c)
                ) {
                  return [...newColors, c];
                }
                return newColors;
              }, [] as Array<string>);
              return (
                <div key={text.initialValue} className="flex gap-x-2">
                  <div
                    key={text.initialValue}
                    className="relative z-0 w-full group"
                  >
                    <input {...getInputProps(color, { type: "hidden" })} />
                    <input
                      {...getInputProps(text, { type: "text" })}
                      autoComplete="off"
                      className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />
                    <label
                      htmlFor="floating_email"
                      className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Slice Text
                    </label>
                  </div>
                  <div className="group relative">
                    <button
                      className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 text-center inline-flex items-center"
                      style={{
                        backgroundColor: selectedColor,
                      }}
                      type="button"
                    >
                      <ChevronDown className="w-6 h-6" />
                    </button>
                    <div className="z-10 hidden absolute top-0 ml-[-231px] w-[280px] bg-white rounded-lg shadow dark:bg-gray-800 group-hover:flex flex-col p-3">
                      <span className="text-sm text-white font-semibold text-center w-full">
                        Choose a color:
                      </span>
                      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 grid grid-flow-row-dense grid-cols-4 w-full">
                        {filteredColors.map((fc) => {
                          const selected = fc === selectedColor;
                          return (
                            <li
                              key={fc}
                              className={twMerge(
                                "border-[3px] mx-2 my-1 border-gray-700 hover:border-blue-700 cursor-pointer h-6 flex flex-col items-center",
                                selected && "border-[6px] border-green-500"
                              )}
                            >
                              <button
                                className="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white h-full w-full"
                                style={{
                                  backgroundColor: fc,
                                }}
                                onClick={() => handleSelectColor(fc, color)}
                                type="button"
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center p-4 md:p-5 rounded-b justify-end">
            <button
              type="submit"
              className="text-white bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
            >
              Done
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
