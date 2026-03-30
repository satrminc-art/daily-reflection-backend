import OpenAI from "openai";
import type {
  ReflectionFollowUpData,
  ReflectionFollowUpRequest,
} from "../src/types/ai";

const DEFAULT_MODEL = "gpt-5.4-mini";

function buildSystemPrompt() {
  return [
    "You write short follow-up reflection prompts for a quiet journaling app.",
    "Return 1 or 2 brief prompts only.",
    "Tone: calm, minimal, thoughtful, non-therapeutic, non-judgmental, not pushy.",
    "Do not give advice, interpretation, reassurance, or analysis.",
    "Do not mention therapy, healing, diagnosis, or mental health treatment.",
    "Each prompt should feel elegant, reflective, and easy to continue writing from.",
    "Do not include numbering or commentary.",
  ].join(" ");
}

function buildUserPrompt(input: ReflectionFollowUpRequest) {
  return [
    `App language: ${input.appLanguage}`,
    `Reflection language: ${input.reflectionLanguage}`,
    input.category ? `Category: ${input.category}` : null,
    `Reflection: ${input.reflectionText.trim()}`,
    `User note: ${input.userNote.trim()}`,
    `Write the follow-up prompts in this language: ${input.appLanguage}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateReflectionFollowUps(
  input: ReflectionFollowUpRequest,
): Promise<ReflectionFollowUpData> {
  // Server-only: never import this module into Expo client code.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const model = process.env.OPENAI_REFLECTION_MODEL?.trim() || DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: buildUserPrompt(input),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "reflection_follow_up_prompts",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              prompts: {
                type: "array",
                minItems: 1,
                maxItems: 2,
                items: {
                  type: "string",
                  minLength: 1,
                  maxLength: 220,
                },
              },
            },
            required: ["prompts"],
          },
        },
      },
    });

    const outputText = response.output_text?.trim();
    if (!outputText) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsed = JSON.parse(outputText) as { prompts?: unknown };
    const prompts = Array.isArray(parsed.prompts)
      ? parsed.prompts
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
          .slice(0, 2)
      : [];

    if (!prompts.length) {
      throw new Error("OpenAI response did not include prompts.");
    }

    return {
      prompts,
      model,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed.";
    throw new Error(`OpenAI request failed: ${message}`);
  }
}
