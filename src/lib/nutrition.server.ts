import {
  generateChatCompletion,
  GatewayError,
  PaymentRequiredError,
  PermissionDeniedError,
  RateLimitError,
} from "@lovable.dev/ai-gateway";

import { nutritionResponseSchema, sumNutrition } from "./nutrition-schema";

export async function analyzeNutritionPhoto(imageDataUrl: string) {
  try {
    const response = await generateChatCompletion({
      model: "openai/gpt-6-astra",
      messages: [
        {
          role: "system",
          content:
            "You estimate nutrition from food photos. Identify every visible substantial food on a single dish or multi-item plate such as an Indian thali, and estimate realistic portions from the image. Return only valid JSON with keys isFood (boolean), mealName (string), summary (one short plain-language sentence), and items (array). Each item must have name, serving, calories (integer kcal), proteinGrams, carbsGrams, fatGrams, fiberGrams, sugarGrams (numbers in grams), sodiumMilligrams (integer), and confidence (number from 0 to 1). Include separate foods individually; do not combine distinct bowls or compartments. Skip tiny garnishes. Use 0 for nutrients that cannot reasonably be estimated. If the image does not show food, return isFood false, an empty items array, mealName 'No food detected', and a brief summary. Estimates are approximate, not medical advice.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Estimate the portions and nutrition for each food visible in this meal photo.",
            },
            {
              type: "image_url",
              image_url: { url: imageDataUrl, detail: "high" },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message.content;
    if (typeof content !== "string") {
      throw new Error("The image analysis returned no readable result.");
    }

    const analysis = nutritionResponseSchema.parse(JSON.parse(content));
    return { ...analysis, totals: sumNutrition(analysis.items) };
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      throw new Error("Photo analysis is temporarily unavailable. Please ask the site owner to check AI credits.");
    }
    if (error instanceof PermissionDeniedError) {
      throw new Error("Photo analysis is not available in this workspace right now.");
    }
    if (error instanceof RateLimitError) {
      throw new Error("The scanner is busy. Please give it a moment and try again.");
    }
    if (error instanceof GatewayError) {
      console.error("Nutrition photo analysis gateway failure", {
        code: error.code,
        httpStatus: error.httpStatus,
        outcome: error.outcome,
        recovery: error.recovery,
        ids: error.ids,
      });
    } else {
      console.error("Nutrition photo analysis failed", error);
    }
    throw new Error("We couldn’t read that photo. Try a clear, well-lit picture of your food.");
  }
}