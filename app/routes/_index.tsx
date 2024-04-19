import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { Backdrop } from "~/components/Backdrop";
import { FooterBar } from "~/components/FooterBar";
import { Navbar } from "~/components/Navbar";
import { UpdateTextModal } from "~/components/UpdateTextModal";
import Wheel from "~/components/Wheel";
import { WheelOptionsModal } from "~/components/WheelOptionsModal";
import { PieTextSchema } from "~/schemas/schemas";

export const meta: MetaFunction = () => {
  return [
    { title: "Free Wheel Spin" },
    {
      name: "description",
      content: "Spin a wheel with your friends, family or colleagues!",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: PieTextSchema,
  });

  return json(submission.reply());
}

export default function Index() {
  return (
    <>
      <Backdrop />
      <main className="h-screen overflow-hidden relative flex flex-col justify-between items-center">
        <Navbar />
        <Wheel />
        <FooterBar />
      </main>
      <UpdateTextModal />
      <WheelOptionsModal />
    </>
  );
}
