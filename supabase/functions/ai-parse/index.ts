import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, language = "ru" } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GROQ_API_KEY") || "";

    if (apiKey) {
      try {
        const systemPrompt = `You are OmniCart AI shopping list parser. Extract grocery/shopping items from the text. Respond ONLY with JSON in this format: {"items": [{"name": "string", "quantity": 1, "unit": "шт", "estimated_price": null}]}`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed && Array.isArray(parsed.items)) {
            return new Response(JSON.stringify(parsed), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (_e) {
        // Fallback to local parsing on AI failure
      }
    }

    // Fallback regex parsing
    const lines = text.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean);
    const items = lines.map((line: string) => {
      const match = line.match(/^(\d+(?:[.,]\d+)?)\s*(кг|г|л|мл|шт|уп|пач|бут)?\s*(.*)$/i) ||
                    line.match(/^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(кг|г|л|мл|шт|уп|пач|бут)?$/i);
      if (match) {
        return {
          name: match[3] || match[1] || line,
          quantity: parseFloat((match[1] || match[2] || "1").replace(",", ".")),
          unit: match[2] || match[3] || "шт",
          estimated_price: null,
        };
      }
      return {
        name: line,
        quantity: 1,
        unit: "шт",
        estimated_price: null,
      };
    });

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, items: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
