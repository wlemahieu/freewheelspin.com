import { FormProvider, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useActionData } from "@remix-run/react";
import { Fragment, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { Backdrop } from "~/components/Backdrop";
import { FooterBar } from "~/components/FooterBar";
import { Navbar } from "~/components/Navbar";
import { SpinButton } from "~/components/SpinButton";
import { UpdateTextModal } from "~/components/UpdateTextModal";
import { PieTextSchema } from "~/schemas/pie-text";
import { PieStore, usePieStore } from "~/usePieStore";

export const meta: MetaFunction = () => {
  return [
    { title: "Free Wheel Spin" },
    { name: "description", content: "Spin a wheel with your colleagues!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: PieTextSchema,
  });

  return json(submission.reply());
}

const defaultFormValues = {
  slices: [
    {
      text: "Wes",
      color: "lightblue",
    },
    {
      text: "Diego",
      color: "lightgreen",
    },
    {
      text: "Marcus",
      color: "violet",
    },
    {
      text: "Pedro",
      color: "red",
    },
  ],
};

export default function Index() {
  const {
    handleClosePieTextModal,
    localRotation,
    rotation,
    rotateIdle,
    showBackdrop,
    spinSpeed,
    stopWheel,
  } = usePieStore<PieStore>((state) => state);
  const isSmall = useMediaQuery({ query: "(max-width: 640px)" });
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    constraint: getZodConstraint(PieTextSchema),
    lastResult: actionData,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      const parsed = parseWithZod(formData, {
        schema: PieTextSchema,
      });
      return parsed;
    },
    onSubmit(event) {
      event.preventDefault();
      // save data to local storage
      handleClosePieTextModal();
    },
    defaultValue: defaultFormValues,
  });
  const slices = fields.slices.getFieldList();
  const rotationCount = localRotation / 360;
  const rotations = Math.floor(rotationCount);

  useEffect(() => {
    rotateIdle();
  }, [rotateIdle]);

  useEffect(() => {
    if (spinSpeed <= 0) {
      stopWheel();
      showBackdrop();
    }
  }, [showBackdrop, spinSpeed, stopWheel]);

  return (
    <>
      <main className="h-screen relative">
        <Backdrop />
        <div className="h-full flex flex-col gap-y-4 overflow-hidden">
          <Navbar />
          <section className="flex flex-col gap-y-4 items-center h-screen px-4">
            <SpinButton />
            {/* wheel */}
            <div className="flex justify-center items-center relative pr-12 pl-12">
              <div
                className="w-[500px] h-[500px] flex justify-center items-center relative"
                style={{
                  animation: "spin 50ms exponential infinite",
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {slices.map((sliceField, index) => {
                  const slice = sliceField.initialValue;
                  if (!slice) return null;
                  if (slices.length === 1) {
                    return (
                      <div
                        key={index}
                        className="absolute top-0 w-full h-full"
                        style={{
                          backgroundColor: slice.color,
                          borderRadius: "50%",
                          clipPath: `circle()`,
                        }}
                      />
                    );
                  }
                  const angle = 360 / slices.length;
                  const startAngle = index * angle;
                  const endAngle = (index + 1) * angle;
                  // Convert angles to radians
                  const startAngleRad = (startAngle * Math.PI) / 180;
                  const endAngleRad = (endAngle * Math.PI) / 180;
                  const w = 250;
                  // Calculate coordinates for the points of the slice
                  const x1 = Math.cos(startAngleRad) * w + w;
                  const y1 = Math.sin(startAngleRad) * w + w;
                  const x2 = Math.cos(endAngleRad) * w + w;
                  const y2 = Math.sin(endAngleRad) * w + w;

                  // Calculate the large-arc-flag for the arc command
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                  const titleAngle = startAngle + angle / 2; // Calculate the angle for the title

                  // Convert title angle to radians
                  const titleAngleRad = (titleAngle * Math.PI) / 180;

                  // Calculate the coordinates for positioning the title
                  const titleX = Math.cos(titleAngleRad) * (w / 2) + w; // Adjust radius as needed
                  const titleY = Math.sin(titleAngleRad) * (w / 2) + w; // Adjust radius as needed

                  return (
                    <Fragment key={index}>
                      <div
                        className="absolute top-0 left-0 w-full h-full flex justify-center text-center align-middle items-center"
                        style={{
                          backgroundColor: slice.color,
                          clipPath: `path('M ${w} ${w} L ${w} ${w} L ${x1} ${y1} A ${w} ${w} 0 ${largeArcFlag} 1 ${x2} ${y2} Z')`,
                        }}
                      />
                      <div
                        className="z-10 absolute text-5xl"
                        style={{
                          left: `${titleX}px`,
                          top: `${titleY}px`,
                          transform: `translate(-50%, -50%) rotate(${titleAngle}deg)`, // Center the title
                        }}
                      >
                        {slice.text}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </section>
          <section className="flex justify-center items-center px-4">
            <FooterBar />
          </section>
        </div>
      </main>
      <FormProvider context={form.context}>
        <UpdateTextModal formId={form.id} />
      </FormProvider>
    </>
  );
}
