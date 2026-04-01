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

function normalizePrompts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 2);
}

function selectBestPrompt(prompts: string[]) {
  return prompts[0]?.trim() || null;
}

function extractPromptsFromResponse(response: {
  output_parsed?: unknown;
  output_text?: string | null;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string; parsed?: unknown }> }>;
}) {
  const parsedFromStructured =
    response.output_parsed &&
    typeof response.output_parsed === "object" &&
    !Array.isArray(response.output_parsed)
      ? normalizePrompts((response.output_parsed as { prompts?: unknown }).prompts)
      : [];

  if (parsedFromStructured.length) {
    return parsedFromStructured;
  }

  const parsedFromText = response.output_text?.trim();
  if (parsedFromText) {
    try {
      const parsed = JSON.parse(parsedFromText) as { prompts?: unknown };
      const prompts = normalizePrompts(parsed.prompts);
      if (prompts.length) {
        return prompts;
      }
    } catch {
      // Fall through to inspect structured content items.
    }
  }

  for (const item of response.output ?? []) {
    if (item.type !== "message") {
      continue;
    }

    for (const content of item.content ?? []) {
      if (content.type === "output_text") {
        const promptsFromContent =
          content.parsed && typeof content.parsed === "object" && !Array.isArray(content.parsed)
            ? normalizePrompts((content.parsed as { prompts?: unknown }).prompts)
            : [];

        if (promptsFromContent.length) {
          return promptsFromContent;
        }

        if (content.text?.trim()) {
          try {
            const parsed = JSON.parse(content.text) as { prompts?: unknown };
            const prompts = normalizePrompts(parsed.prompts);
            if (prompts.length) {
              return prompts;
            }
          } catch {
            // Ignore non-JSON content and continue.
          }
        }
      }
    }
  }

  return [];
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
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        route: "/api/reflection/follow-up",
        event: "openai_follow_up_started",
        model,
        noteLength: input.userNote.trim().length,
      }),
    );

    const response = await client.responses.parse({
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

    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        route: "/api/reflection/follow-up",
        event: "openai_follow_up_response_received",
        hasOutputParsed: Boolean(response.output_parsed),
        outputTextLength: response.output_text?.trim().length ?? 0,
        outputItems: response.output?.length ?? 0,
      }),
    );

    const prompts = extractPromptsFromResponse(response);

    if (!prompts.length) {
      throw new Error("OpenAI response did not include prompts.");
    }

    const selectedPrompt = selectBestPrompt(prompts);
    if (!selectedPrompt) {
      throw new Error("OpenAI response did not include a usable prompt.");
    }

    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        route: "/api/reflection/follow-up",
        event: "follow_up_generated",
        model,
        promptCount: prompts.length,
        selectedPrompt: selectedPrompt.slice(0, 120),
      }),
    );

    return {
      text: selectedPrompt,
      model,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed.";
    throw new Error(`OpenAI request failed: ${message}`);
  }
}
