import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await supabase.auth.getClaims(token);
    
    if (authError || !data?.claims) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = data.claims.sub;
    console.log('Authenticated user:', userId);

    const { topic, position, difficulty, timeLimit, noTimeLimit, numberOfPoints, evidenceLevel } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const difficultyInstructions = {
      easy: "Use simple vocabulary, straightforward logic, and short explanations. Keep it beginner-friendly.",
      medium: "Use moderate vocabulary with clear logical progression. Include some nuance. High-school debate level.",
      hard: "Use advanced vocabulary with complex, layered arguments. Include nuanced reasoning and anticipate counterarguments. Competitive debate level."
    };

    const evidenceInstructions = {
      low: "Minimal evidence. Primarily use logical reasoning. Optional single statistic or quote total.",
      medium: "Each speaking point must include at least one statistic OR one direct quote from a credible source (government agencies, academic institutions, reputable organizations, major research studies).",
      high: "Each speaking point must include multiple statistics and/or direct quotes with explicit attribution to credible sources. Evidence must directly support the claim."
    };

    const timeInstructions = noTimeLimit
      ? "Generate fully expanded, in-depth speaking points with deeper reasoning and elaboration."
      : `Speaking points must realistically fit within ${timeLimit} minutes of speaking time. ${timeLimit <= 3 ? 'Use concise phrasing.' : timeLimit >= 10 ? 'Include expanded explanations.' : 'Balance conciseness with detail.'}`;

    const systemPrompt = `You are an expert debate coach helping users practice debate skills. Generate structured, persuasive speaking points for debate topics.

CRITICAL RULES:
1. Generate arguments ONLY for the "${position.toUpperCase()}" position
2. Never mix positions - all points must support the ${position === 'for' ? 'affirmative' : 'negative'} side
3. Each point must directly address the specific topic provided
4. Do NOT fabricate sources or statistics - only use well-known, verifiable facts

${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}
${evidenceInstructions[evidenceLevel as keyof typeof evidenceInstructions]}
${timeInstructions}

Generate EXACTLY ${numberOfPoints} speaking points.`;

    const userPrompt = `Generate ${numberOfPoints} speaking points ${position === 'for' ? 'IN FAVOR OF' : 'AGAINST'} the following debate topic:

"${topic}"

Each speaking point must:
1. Have a clear, specific title related to this exact topic
2. Make a claim that directly addresses "${topic}"
3. Provide an explanation with reasoning specific to this topic
${evidenceLevel !== 'low' ? '4. Include evidence (statistics or quotes) that directly supports the argument about this specific topic' : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_speaking_points",
              description: "Generate structured debate speaking points",
              parameters: {
                type: "object",
                properties: {
                  speakingPoints: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "A clear, topic-specific title for this argument" },
                        claim: { type: "string", description: "The main claim or assertion being made" },
                        explanation: { type: "string", description: "Detailed reasoning supporting the claim" },
                        evidence: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["statistic", "quote"] },
                              content: { type: "string", description: "The statistic or quote text" },
                              source: { type: "string", description: "The credible source attribution" }
                            },
                            required: ["type", "content", "source"]
                          }
                        }
                      },
                      required: ["title", "claim", "explanation"]
                    }
                  }
                },
                required: ["speakingPoints"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_speaking_points" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log("AI response received:", JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid response structure from AI");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const points = parsed.speakingPoints.map((point: any, index: number) => ({
      id: crypto.randomUUID(),
      title: point.title,
      claim: point.claim,
      explanation: point.explanation,
      evidence: point.evidence || undefined
    }));

    return new Response(JSON.stringify({ speakingPoints: points }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating debate points:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
