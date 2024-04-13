import { z } from "zod";

export const PieTextSchema = z.object({
  slices: z.array(
    z.object({
      text: z.string(),
      color: z.string(),
    })
  ),
});
