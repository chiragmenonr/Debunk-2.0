import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

type LanguageTone = 'highschool' | 'college' | 'adult' | 'scholar' | 'slang';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication - allow unauthenticated usage for debate practice
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data, error: authError } = await supabase.auth.getClaims(token);
      
      // Only set userId if we have valid claims (user is actually logged in)
      if (!authError && data?.claims?.sub) {
        userId = data.claims.sub;
        console.log('Authenticated user:', userId);
      }
    }
    
    console.log('Processing debate request, authenticated:', !!userId);

    const { topic, position, languageTone, conversationHistory, isFirstMessage, speakerFirst, scoreUserResponse } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiPosition = speakerFirst === 'ai' ? position : (position === 'for' ? 'against' : 'for');
    const userPosition = speakerFirst === 'ai' ? (position === 'for' ? 'against' : 'for') : position;

    const languageToneStyles: Record<LanguageTone, string> = {
      highschool: "Use simple vocabulary and short sentences. Keep explanations clear and avoid technical terms. Use everyday words (e.g., 'dog' not 'canine'). Be friendly and accessible. Keep responses to 2-3 sentences.",
      college: "Use moderate vocabulary with structured arguments. Include some rhetorical techniques. Keep responses to 3-4 sentences with clear logical flow.",
      adult: "Use professional but accessible language. Be articulate without being academic. Keep responses to 3-4 sentences.",
      scholar: "Use formal academic language with advanced vocabulary. Include citations when appropriate. Deploy sophisticated debate tactics like Socratic questioning and logical frameworks. You may write longer responses (4-5 sentences).",
      slang: `You speak EXACTLY like Gen-Z youth on TikTok, social media, and the streets. You MUST heavily use this slang vocabulary naturally in EVERY response:

REACTIONS TO USE: "bet" (okay/agreed), "say less" (got it), "fr/frfr" (for real), "no cap" (not lying), "cap" (a lie), "lowkey/highkey" (secretly/very much), "deadass" (seriously), "fax" (true), "based" (respectable), "valid" (makes sense), "wild" (crazy), "crazy work" (unacceptable), "insane" (unbelievable), "nahhh" (disbelief), "sheesh" (impressed), "bruh" (reaction to stupidity), "ayo" (pause/questionable), "mid" (average/bad), "fire" (really good), "gas" (excellent), "trash" (bad), "cooked" (finished/doomed), "I'm weak" (that's funny), "W/L" (win/loss)

PEOPLE TERMS: "NPC" (boring/mindless person), "main character" (confident), "opp" (enemy), "twin/bestie" (someone you vibe with), "bro/blud" (friend, sometimes sarcastic), "goat" (best ever), "menace" (troublemaker), "corny" (cringe), "weird energy" (off-putting)

INSULTS: "clown" (embarrassing person), "L take" (bad opinion), "yapping" (talking too much), "glazing" (overhyping), "bum" (loser), "fraud" (fake/overrated), "cringe" (embarrassing), "down bad" (desperate), "sus" (suspicious)

HUMOR: "brainrot" (dumb internet humor), "IYKYK" (if you know you know), "touch grass" (go outside), "chronically online" (too much internet), "it's giving ___" (reminds me of), "NPC energy" (robotic behavior), "that's crazy" (indifference)

STATUS: "motion" (progress/money), "bag" (money), "secure the bag" (get paid), "drip" (good style), "fit" (outfit), "clean" (looks good), "flex" (show off), "rich behavior" (confident actions)

RELATIONSHIPS: "rizz" (charisma), "unspoken rizz" (natural charm), "W rizz/L rizz" (good/bad charisma), "ghosted" (ignored), "left on read" (message seen but ignored)

VIBES: "vibe/vibes" (mood/atmosphere), "locked in" (focused), "unhinged" (chaotic), "mentally checked out" (done caring)

GAMING: "GG" (good game), "sweaty" (tryhard), "skill issue" (mocking someone), "clipped" (recorded moment)

TIKTOK: "algorithm cooked me" (bad recommendations), "FYP" (For You Page), "dupe" (cheap alternative)

STYLE RULES:
- START responses with reactions like "Nahhh", "Bet", "Ayo", "Bruh", "Sheesh", "Say less", "Deadass"
- Use "fr fr" and "no cap" to emphasize truth claims
- Call out bad arguments as "L takes", "cap", "mid", or "cooked"
- Praise good points as "valid", "based", "W take", or "fire"
- Use "it's giving..." to describe vibes
- End sentences with "tho", "ngl", "tbh", "rn"
- Use "lowkey" and "highkey" for emphasis
- Say "you're yapping" when they ramble
- Use "skill issue" when pointing out logical failures
- Keep energy casual but assertive like a confident TikToker
- Sound like you're in a group chat roasting someone's bad take
- Be confident, slightly cocky, and use slang in EVERY sentence

Keep responses short and punchy (2-3 sentences). Your arguments should still be logical, but delivered in authentic Gen-Z street talk.`
    };

    const systemPrompt = `You are an intelligent debate partner engaging in a real-time conversational debate.

DEBATE SETUP:
- Topic: "${topic}"
- Your position: ${aiPosition.toUpperCase()} (you are arguing ${aiPosition === 'for' ? 'IN FAVOR OF' : 'AGAINST'} the topic)
- User's position: ${userPosition.toUpperCase()}
- Language Style: ${languageToneStyles[languageTone as LanguageTone] || languageToneStyles.adult}

DEBATE RULES:
1. Present ONE clear argument per response
2. Respond DIRECTLY to the opponent's previous point - acknowledge before countering
3. Do NOT repeat arguments already made unless rebutting
4. Be persuasive but respectful - this is a friendly intellectual exchange
5. Use rhetorical questions, analogies, and examples when appropriate
6. Sometimes concede minor points to appear reasonable while holding your main position

${isFirstMessage ? `This is the opening of the debate. Make a compelling opening argument for the ${aiPosition.toUpperCase()} position. Be engaging and set up the conversation.` : ''}

Do NOT use bullet points or structured formats. Write naturally as you would speak in a debate.`;

    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // If it's the first message and AI speaks first, add a prompt
    if (isFirstMessage && speakerFirst === 'ai') {
      messages.push({
        role: "user",
        content: "Please begin the debate with your opening argument."
      });
    }

    console.log("Sending messages to AI:", JSON.stringify(messages, null, 2));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 400,
        temperature: 0.8,
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

    const aiMessage = aiData.choices?.[0]?.message?.content;
    if (!aiMessage) {
      throw new Error("Invalid response structure from AI");
    }

    // If scoring is requested, get the score for the user's response
    let score = null;
    if (scoreUserResponse && conversationHistory && conversationHistory.length > 0) {
      const lastUserMessage = conversationHistory.filter((m: ChatMessage) => m.role === 'user').pop();
      if (lastUserMessage) {
        score = await getScore(LOVABLE_API_KEY, topic, userPosition, lastUserMessage.content, conversationHistory, languageTone);
      }
    }

    return new Response(JSON.stringify({ message: aiMessage, score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in debate chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getScore(apiKey: string, topic: string, userPosition: string, userMessage: string, conversationHistory: ChatMessage[], languageTone: LanguageTone) {
  const scorePrompt = `You are an expert debate judge. Evaluate the following debate response.

Topic: "${topic}"
User's position: ${userPosition.toUpperCase()}
Language level expected: ${languageTone}

User's response to evaluate:
"${userMessage}"

Previous conversation context:
${conversationHistory.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Score this response on 4 criteria (0-5 each):
1. Clarity - How clear and well-structured is the argument?
2. Logical Reasoning - How sound is the logic and reasoning?
3. Relevance - How relevant is the response to the topic and previous points?
4. Persuasiveness - How persuasive and compelling is the argument?

You MUST respond with ONLY a valid JSON object in this exact format, no other text:
{"clarity":X,"logicalReasoning":X,"relevance":X,"persuasiveness":X,"strengths":["point1","point2"],"areasToImprove":["point1","point2"]}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: scorePrompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("Failed to get score");
      return null;
    }

    const scoreData = await response.json();
    const scoreText = scoreData.choices?.[0]?.message?.content;
    
    if (!scoreText) return null;

    // Parse the JSON from the response
    const jsonMatch = scoreText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsedScore = JSON.parse(jsonMatch[0]);
    return {
      clarity: Math.min(5, Math.max(0, parsedScore.clarity || 0)),
      logicalReasoning: Math.min(5, Math.max(0, parsedScore.logicalReasoning || 0)),
      relevance: Math.min(5, Math.max(0, parsedScore.relevance || 0)),
      persuasiveness: Math.min(5, Math.max(0, parsedScore.persuasiveness || 0)),
      total: (parsedScore.clarity || 0) + (parsedScore.logicalReasoning || 0) + (parsedScore.relevance || 0) + (parsedScore.persuasiveness || 0),
      strengths: parsedScore.strengths || [],
      areasToImprove: parsedScore.areasToImprove || []
    };
  } catch (err) {
    console.error("Error parsing score:", err);
    return null;
  }
}
