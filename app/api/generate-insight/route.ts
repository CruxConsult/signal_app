import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function tryParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleaned);
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing from .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      stakeholderName,
      stakeholderRole,
      stakeholderSummary,
      interactions,
    } = body;

    if (!stakeholderName || !Array.isArray(interactions) || interactions.length === 0) {
      return NextResponse.json(
        { error: "Missing stakeholder name or interactions" },
        { status: 400 }
      );
    }

    const interactionText = interactions
      .map((interaction: any, index: number) => {
        return `Interaction ${index + 1}
Date: ${interaction.interaction_date || "Unknown"}
Source type: ${interaction.source_type || "Unknown"}
Title: ${interaction.title || "Untitled"}
Content:
${interaction.content || "No content provided"}`;
      })
      .join("\n\n---\n\n");

    const prompt = `
You are analysing stakeholder relationship intelligence for a professional stakeholder management tool.

Your job is to assess the current state of a stakeholder relationship based ONLY on the evidence provided.

Stakeholder:
- Name: ${stakeholderName}
- Role: ${stakeholderRole || "Unknown"}
- Existing summary: ${stakeholderSummary || "None"}

Most recent interactions (focus on these as the current state):
${interactionText}

Return ONLY valid JSON.
Do not use markdown fences.
Do not add any extra commentary.

1. stakeholder_sentiment
This means the stakeholder's stance toward the initiative, programme, or change.
- supportive → clearly positive, engaged, or aligned
- neutral → mixed, cautious, or unclear
- resistant → negative, sceptical, or opposed

2. personal_sentiment
This means the stakeholder's apparent sentiment toward the user personally.

Assess this using signals such as:
- tone (warm, neutral, cold, defensive)
- level of respect and receptiveness
- openness vs guardedness
- willingness to engage constructively
- signs of friction, tension, or defensiveness

Guidance:
- positive → warm, open, constructive, respectful
- neutral → professional, polite, but limited emotional signal
- negative → defensive, resistant, tense, or dismissive
- unclear → not enough evidence to judge

3. relationship_strength
This means how strong and established the working relationship appears to be.

Assess this using observable signals such as:
- warmth and tone (friendly, transactional, tense)
- level of trust (openness, sharing information, candour)
- responsiveness and engagement
- familiarity and ease of interaction
- evidence of access or influence
- whether communication feels collaborative or guarded

Guidance:
- strong → high trust, open, collaborative, easy interaction
- moderate → functional, some trust, but not deeply established
- weak → distant, formal, guarded, or strained
- unknown → insufficient evidence

Use exactly this shape:
{
  "stakeholder_sentiment": "supportive",
  "personal_sentiment": "positive",
  "relationship_strength": "moderate",
  "evidence_strength": "medium",
  "confidence": 0.78,
  "summary": "short overall stakeholder summary",
  "what_changed": "what seems to have shifted over time",
  "suggested_approach": "how to approach this stakeholder next",
  "rationale": "brief explanation of the judgement",
  "supporting_signals": ["signal 1", "signal 2", "signal 3"],
  "counter_signals": ["signal 1", "signal 2"],
  "uncertainties": ["uncertainty 1", "uncertainty 2"],
  "key_signals": ["signal 1", "signal 2", "signal 3"]
}

Rules:
- stakeholder_sentiment must be one of: supportive, neutral, resistant
- personal_sentiment must be one of: positive, neutral, negative, unclear
- relationship_strength must be one of: strong, moderate, weak, unknown
- evidence_strength must be one of: low, medium, high
- evidence_strength should reflect how much usable evidence exists in the interactions
- low = very limited, thin, ambiguous, or weak evidence
- medium = some usable evidence, but still partial or mixed
- high = clear, repeated, and consistent signals across interactions
- confidence must be a number between 0 and 1
- supporting_signals must be an array with 2 to 4 short items
- counter_signals must be an array with 0 to 3 short items
- uncertainties must be an array with 1 to 3 short items
- key_signals must be an array with 3 short items
- be cautious, balanced, and evidence-based
- do not overclaim
- if evidence is weak or ambiguous, prefer neutral / unclear / unknown
- distinguish carefully between:
  1. the stakeholder's stance toward the work or initiative
  2. the stakeholder's sentiment toward the user personally
  3. the strength of the relationship between the stakeholder and the user
- rationale should explain why the judgement was reached in plain English
- supporting_signals should capture evidence pushing toward the conclusion
- counter_signals should capture evidence that complicates or weakens the conclusion
- uncertainties should state what is still unclear or under-evidenced
- keep summary, what_changed, suggested_approach, and rationale practical and concise
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const rawText = response.output_text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "The model returned an empty response." },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = tryParseJson(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "The model returned text that was not valid JSON.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: parsed });
  } catch (error: any) {
    console.error("Generate insight error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          error?.error?.message ||
          "Failed to generate insight",
      },
      { status: 500 }
    );
  }
}