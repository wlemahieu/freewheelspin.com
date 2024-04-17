import { z } from "zod";

export const PieTextSchema = z.object({
  slices: z.array(
    z.object({
      text: z.string({ required_error: "Text required" }),
      color: z.string({ required_error: "Color required" }),
    })
  ),
});

export const OptionsSchema = z.object({
  winnersRemoved: z
    .boolean()
    .optional()
    .transform((arg) => Boolean(arg)),
});
