import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData } from "@remix-run/react";
import { useRef } from "react";
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
      console.log("", { parsed });
      if (parsed.status === "success") {
        // const { value } = parsed;
        //const { slices } = value;
        //localStorage.setItem("slices", JSON.stringify(slices));
        handleCloseOptionsModal();
      }
      return parsed;
    },
    defaultValue: (() => {
      /*const storedSlices = localStorage.getItem("slices");
      if (storedSlices) {
        return {
          slices: JSON.parse(storedSlices) as Array<Slice>,
        };
      }*/
      return {
        winnersRemoved: true,
      };
    })(),
  });

  return (
    <FormProvider context={form.context}>
      <Form {...getFormProps(form)} method="post">
        <div className="p-4 md:p-5 space-y-4"></div>
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
  const pageRef = useRef(null);

  return (
    <Modal
      className="overflow-y-auto"
      handleCloseModal={handleCloseOptionsModal}
      modalVisible={optionsModalVisible}
      title="Change settings"
    >
      <div className="flex flex-col gap-y-2" ref={pageRef}>
        {pageRef.current ? <WheelOptionsForm /> : null}
      </div>
    </Modal>
  );
}
