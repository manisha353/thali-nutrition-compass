import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { analyzeNutritionPhoto } from "./nutrition.server";

export const analyzeNutrition = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        imageDataUrl: z
          .string()
          .max(12_000_000)
          .regex(/^data:image\/(?:jpeg|png|webp);base64,/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => analyzeNutritionPhoto(data.imageDataUrl));