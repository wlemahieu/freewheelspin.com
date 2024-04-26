import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Modal } from "~/components/Modal";
import { action } from "~/routes/_index";
import { OptionsSchema } from "~/schemas/schemas";
import { PieStore, usePieStore } from "~/store/usePieStore";

function WheelOptionsForm() {
  const { handleCloseOptionsModal } = usePieStore<PieStore>((state) => state);
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    constraint: getZodConstraint(OptionsSchema),
    lastResult: actionData,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      const parsed = parseWithZod(formData, {
        schema: OptionsSchema,
      });
      if (parsed.status === "success") {
        const { value } = parsed;
        const options = value;
        localStorage.setItem("options", JSON.stringify(options));
        handleCloseOptionsModal();
      }
      return parsed;
    },
    defaultValue: (() => {
      const storedOptions = localStorage.getItem("options");
      if (storedOptions) {
        const options = JSON.parse(storedOptions) as z.infer<
          typeof OptionsSchema
        >;
        return options;
      }
      return {
        winnersRemoved: true,
        winnerOnPause: false,
      };
    })(),
  });

  return (
    <FormProvider context={form.context}>
      <Form {...getFormProps(form)} method="post">
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex items-center mb-4">
            <input
              {...getInputProps(fields.winnersRemoved, { type: "checkbox" })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor={fields.winnersRemoved.id}
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Winners are removed
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              {...getInputProps(fields.winnerOnPause, { type: "checkbox" })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor={fields.winnerOnPause.id}
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Winner on pause
            </label>
          </div>
        </div>
        <div className="flex items-center p-4 md:p-5 rounded-b justify-end">
          <button
            type="submit"
            className="text-white bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
          >
            Save
          </button>
        </div>
      </Form>
    </FormProvider>
  );
}

export function WheelOptionsModal() {
  const { handleCloseOptionsModal, optionsModalVisible } =
    usePieStore<PieStore>((state) => state);

  if (!optionsModalVisible) return null;

  return (
    <Modal
      className="overflow-y-auto"
      handleCloseModal={handleCloseOptionsModal}
      modalVisible={optionsModalVisible}
      title="Change settings"
    >
      <div className="flex flex-col gap-y-2">
        <WheelOptionsForm />
      </div>
    </Modal>
  );
}
