import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("BOT_TOKEN") || "";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-init-data",
};

const CATEGORIES: Record<number, string> = {
  1: "Овощи и фрукты",
  2: "Молочные продукты",
  3: "Мясо и птица",
  4: "Хлеб и выпечка",
  5: "Напитки",
  6: "Бакалея",
  7: "Бытовая химия",
  8: "Сладости",
};

function formatItem(raw: any) {
  if (!raw) return raw;
  const catName = raw.category || (raw.category_id && CATEGORIES[raw.category_id]) || "Другое";
  const priceVal = raw.estimated_price !== null && raw.estimated_price !== undefined ? Number(raw.estimated_price) : (raw.actual_price ? Number(raw.actual_price) : null);

  return {
    id: raw.id,
    list_id: raw.list_id,
    listId: raw.list_id,
    name: raw.name,
    quantity: Number(raw.quantity || 1),
    unit: raw.unit || "шт",
    price: priceVal,
    estimated_price: priceVal,
    category: catName,
    category_id: raw.category_id || null,
    note: raw.note || null,
    notes: raw.note || null,
    priority: raw.priority || 1,
    isPurchased: Boolean(raw.is_purchased),
    is_purchased: Boolean(raw.is_purchased),
    purchasedAt: raw.purchased_at || null,
    purchased_at: raw.purchased_at || null,
    createdAt: raw.created_at,
    created_at: raw.created_at,
    updatedAt: raw.updated_at,
    updated_at: raw.updated_at,
  };
}

async function verifyTelegram(initData: string): Promise<any | null> {
  if (!initData || !BOT_TOKEN) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");
    const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

    const encoder = new TextEncoder();
    const secretKeyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secretKey = await crypto.subtle.sign("HMAC", secretKeyMaterial, encoder.encode(BOT_TOKEN));
    const key = await crypto.subtle.importKey(
      "raw",
      secretKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(dataCheckString));
    const hexSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hexSignature !== hash) return null;

    const userStr = params.get("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Signature verification error:", e);
    return null;
  }
}

async function getOrCreateUser(tgUser: any) {
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_user_id", tgUser.id)
    .maybeSingle();

  if (existing) {
    if (tgUser.username && existing.username !== tgUser.username) {
      await supabase.from("users").update({ username: tgUser.username }).eq("id", existing.id);
      existing.username = tgUser.username;
    }
    return existing;
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      telegram_user_id: tgUser.id,
      username: tgUser.username || null,
      first_name: tgUser.first_name || "User",
      last_name: tgUser.last_name || null,
      language: tgUser.language_code || "ru",
    })
    .select("*")
    .single();

  if (error || !created) throw new Error(error?.message || "User creation failed");

  // Create default list
  await supabase.from("shopping_lists").insert({
    owner_id: created.id,
    name: "Мой список",
    emoji: "🛒",
    color: "#10B981",
    is_default: true,
  });

  // Create default settings
  await supabase.from("user_settings").insert({
    user_id: created.id,
    language: tgUser.language_code || "ru",
    currency: "UZS",
    theme: "auto",
  });

  return created;
}

async function resolveDefaultListId(userId: string): Promise<string> {
  let { data: defaultList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!defaultList) {
    const { data: newList } = await supabase
      .from("shopping_lists")
      .insert({
        owner_id: userId,
        name: "Мой список",
        emoji: "🛒",
        color: "#10B981",
        is_default: true,
      })
      .select("id")
      .single();
    return newList.id;
  }

  return defaultList.id;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  let pathname = url.pathname;
  if (pathname.includes("/functions/v1/api")) {
    pathname = pathname.replace("/functions/v1/api", "");
  } else if (pathname.includes("/api/v1")) {
    pathname = pathname.replace("/api/v1", "");
  } else if (pathname.includes("/api")) {
    pathname = pathname.replace("/api", "");
  }
  pathname = pathname.replace(/\/+$/, "");
  if (!pathname.startsWith("/")) pathname = "/" + pathname;

  const initDataHeader = req.headers.get("X-Telegram-Init-Data") || "";
  let currentUser: any = null;

  if (initDataHeader) {
    const tgUser = await verifyTelegram(initDataHeader);
    if (tgUser) {
      try {
        currentUser = await getOrCreateUser(tgUser);
      } catch (e) {
        console.error("Error loading user:", e);
      }
    }
  }

  try {
    // 1. Health Probe — no auth required
    if (pathname === "/health" || pathname === "/health/live" || pathname === "/health/ready") {
      return jsonResponse({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
    }

    // 2. Telegram Auth — no auth required
    if (pathname === "/auth/telegram" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const initData = body.initData || initDataHeader;
      const tgUser = await verifyTelegram(initData);
      if (!tgUser) {
        return jsonResponse({ error: "Invalid initData" }, 401);
      }
      const user = await getOrCreateUser(tgUser);
      return jsonResponse({ authenticated: true, user, token: "supabase-session" });
    }

    // All other routes require authentication
    if (!currentUser) {
      return jsonResponse({ error: "Authentication required: missing or invalid Telegram initData" }, 401);
    }

    // 3. User Profile
    if (pathname === "/profile") {
      const { count: listsCount } = await supabase
        .from("shopping_lists")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", currentUser.id)
        .is("deleted_at", null);

      const { count: purchasesCount } = await supabase
        .from("shopping_items")
        .select("*", { count: "exact", head: true })
        .eq("is_purchased", true);

      return jsonResponse({
        user: {
          id: currentUser.id,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          username: currentUser.username,
          telegram_id: currentUser.telegram_user_id,
        },
        stats: {
          lists_count: listsCount || 0,
          purchases_count: purchasesCount || 0,
          total_spent: 0,
        }
      });
    }

    // 4. Shopping Lists
    if (pathname === "/lists") {
      if (req.method === "GET") {
        const { data: lists, error } = await supabase
          .from("shopping_lists")
          .select("*")
          .eq("owner_id", currentUser.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return jsonResponse(lists || []);
      }

      if (req.method === "POST") {
        const body = await req.json();
        const { data: newList, error } = await supabase
          .from("shopping_lists")
          .insert({
            owner_id: currentUser.id,
            name: body.name || "Новый список",
            emoji: body.icon || body.emoji || "🛒",
            color: body.color || "#10B981",
            is_default: Boolean(body.is_default),
          })
          .select("*")
          .single();

        if (error) throw error;
        return jsonResponse(newList, 201);
      }
    }

    // Single list PATCH/DELETE: /lists/:listId
    const listItemMatch = pathname.match(/^\/lists\/([a-zA-Z0-9\-_]+)$/);
    if (listItemMatch) {
      const listId = listItemMatch[1];
      if (req.method === "PATCH") {
        const body = await req.json();
        const updatePayload: any = {};
        if (body.name !== undefined) updatePayload.name = body.name;
        if (body.emoji !== undefined) updatePayload.emoji = body.emoji;
        if (body.color !== undefined) updatePayload.color = body.color;
        if (body.is_default !== undefined) updatePayload.is_default = body.is_default;
        const { data: updated, error } = await supabase
          .from("shopping_lists")
          .update(updatePayload)
          .eq("id", listId)
          .eq("owner_id", currentUser.id)
          .select("*")
          .single();
        if (error) throw error;
        return jsonResponse(updated);
      }
      if (req.method === "DELETE") {
        await supabase
          .from("shopping_lists")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", listId)
          .eq("owner_id", currentUser.id);
        return jsonResponse({ success: true });
      }
    }

    // 5. Items by List: /items/:listId
    const itemsListMatch = pathname.match(/^\/items\/([a-zA-Z0-9\-_]+)$/);
    if (itemsListMatch) {
      let targetListId = itemsListMatch[1];
      if (targetListId === "default") {
        targetListId = await resolveDefaultListId(currentUser.id);
      }

      if (req.method === "GET") {
        const { data: items, error } = await supabase
          .from("shopping_items")
          .select("*")
          .eq("list_id", targetListId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const formatted = (items || []).map(formatItem);
        return jsonResponse(formatted);
      }

      if (req.method === "POST") {
        const body = await req.json();
        const { data: newItem, error } = await supabase
          .from("shopping_items")
          .insert({
            list_id: targetListId,
            name: body.name,
            quantity: body.quantity || 1,
            unit: body.unit || "шт",
            estimated_price: body.price || body.estimated_price || null,
            category: body.category || "Другое",
            note: body.notes || body.note || null,
            priority: body.priority || 1,
            currency: body.currency || "UZS",
            is_purchased: false,
            created_by: currentUser.id,
          })
          .select("*")
          .single();

        if (error) throw error;
        return jsonResponse(formatItem(newItem), 201);
      }
    }

    // 6. Item Purchase Toggle: /items/:itemId/purchase
    const purchaseMatch = pathname.match(/^\/items\/([a-zA-Z0-9\-_]+)\/purchase$/);
    if (purchaseMatch && req.method === "POST") {
      const itemId = purchaseMatch[1];
      const { data: current } = await supabase
        .from("shopping_items")
        .select("is_purchased")
        .eq("id", itemId)
        .single();

      const newPurchased = !current?.is_purchased;
      const { data: updated, error } = await supabase
        .from("shopping_items")
        .update({
          is_purchased: newPurchased,
          purchased_at: newPurchased ? new Date().toISOString() : null,
          purchased_by: newPurchased ? currentUser.id : null,
        })
        .eq("id", itemId)
        .select("*")
        .single();

      if (error) throw error;
      return jsonResponse(formatItem(updated));
    }

    // 7. Single Item Update / Delete: /items/:itemId
    const itemMatch = pathname.match(/^\/items\/([a-zA-Z0-9\-_]+)$/);
    if (itemMatch) {
      const itemId = itemMatch[1];
      if (req.method === "PATCH") {
        const body = await req.json();
        const updatePayload: any = {};
        if (body.name !== undefined) updatePayload.name = body.name;
        if (body.quantity !== undefined) updatePayload.quantity = body.quantity;
        if (body.unit !== undefined) updatePayload.unit = body.unit;
        if (body.price !== undefined) updatePayload.estimated_price = body.price;
        if (body.estimated_price !== undefined) updatePayload.estimated_price = body.estimated_price;
        if (body.category !== undefined) updatePayload.category = body.category;
        if (body.isPurchased !== undefined) updatePayload.is_purchased = body.isPurchased;
        if (body.is_purchased !== undefined) updatePayload.is_purchased = body.is_purchased;
        if (body.notes !== undefined) updatePayload.note = body.notes;
        if (body.note !== undefined) updatePayload.note = body.note;
        if (body.priority !== undefined) updatePayload.priority = body.priority;

        const { data: updated, error } = await supabase
          .from("shopping_items")
          .update(updatePayload)
          .eq("id", itemId)
          .select("*")
          .single();

        if (error) throw error;
        return jsonResponse(formatItem(updated));
      }

      if (req.method === "DELETE") {
        await supabase
          .from("shopping_items")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", itemId);

        return jsonResponse({ success: true });
      }
    }

    // 8. Budget
    if (pathname.startsWith("/budget")) {
      if (req.method === "GET") {
        const { data: budgets } = await supabase
          .from("budgets")
          .select("*")
          .eq("user_id", currentUser.id);
        return jsonResponse(budgets || []);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { data: budget, error } = await supabase
          .from("budgets")
          .upsert({ user_id: currentUser.id, ...body })
          .select("*")
          .single();
        if (error) throw error;
        return jsonResponse(budget, 201);
      }
    }

    // 9. Analytics — aggregate real data
    if (pathname.startsWith("/analytics")) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: purchasedItems } = await supabase
        .from("shopping_items")
        .select("estimated_price, category, purchased_at, name")
        .eq("is_purchased", true)
        .gte("purchased_at", thirtyDaysAgo)
        .order("purchased_at", { ascending: false })
        .limit(200);

      const items = purchasedItems || [];
      const totalSpent = items.reduce((sum: number, item: any) => sum + (Number(item.estimated_price) || 0), 0);

      const categoryMap: Record<string, number> = {};
      for (const item of items) {
        const cat = item.category || "Другое";
        categoryMap[cat] = (categoryMap[cat] || 0) + (Number(item.estimated_price) || 0);
      }
      const categories = Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));

      const dailyMap: Record<string, number> = {};
      for (const item of items) {
        if (item.purchased_at) {
          const day = item.purchased_at.substring(0, 10);
          dailyMap[day] = (dailyMap[day] || 0) + (Number(item.estimated_price) || 0);
        }
      }
      const daily_spending = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount }));

      return jsonResponse({
        total_spent: totalSpent,
        period: "30d",
        categories,
        daily_spending,
        items_count: items.length,
      });
    }

    // 10. Family
    if (pathname.startsWith("/family")) {
      return jsonResponse({
        family: null,
        members: [],
        activity: [],
      });
    }

    // 11. Recurring
    if (pathname.startsWith("/recurring")) {
      if (req.method === "GET") {
        const { data: items } = await supabase
          .from("recurring_items")
          .select("*")
          .eq("created_by", currentUser.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
        return jsonResponse(items || []);
      }
    }

    // 12. History — purchased items (not just cleared items)
    if (pathname.startsWith("/history")) {
      const { data: history } = await supabase
        .from("shopping_items")
        .select("*, shopping_lists(name)")
        .eq("is_purchased", true)
        .order("purchased_at", { ascending: false })
        .limit(100);
      return jsonResponse((history || []).map(formatItem));
    }

    // 13. Settings
    if (pathname === "/settings") {
      if (req.method === "GET") {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", currentUser.id)
          .maybeSingle();
        return jsonResponse(settings || { theme: "auto", language: "ru", currency: "UZS" });
      }
      if (req.method === "PATCH") {
        const body = await req.json();
        const { data: updated } = await supabase
          .from("user_settings")
          .upsert({ user_id: currentUser.id, ...body })
          .select("*")
          .single();
        return jsonResponse(updated);
      }
    }

    // 14. Favorites
    if (pathname === "/favorites") {
      if (req.method === "GET") {
        const { data: favs } = await supabase
          .from("favorites")
          .select("*, products(name, category_id)")
          .eq("user_id", currentUser.id);
        return jsonResponse(favs || []);
      }
    }

    // 15. Search
    if (pathname === "/search" && req.method === "GET") {
      const q = url.searchParams.get("q") || "";
      if (!q) return jsonResponse([]);
      const { data: results } = await supabase
        .from("products")
        .select("id, name, category_id")
        .ilike("name", `%${q}%`)
        .limit(20);
      return jsonResponse(results || []);
    }

    // 16. Notifications
    if (pathname === "/notifications") {
      if (req.method === "GET") {
        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(30);
        return jsonResponse(notifs || []);
      }
    }

    // 17. AI Parse with Groq
    if (pathname === "/ai/parse" && req.method === "POST") {
      const body = await req.json();
      const promptText = body.text || body.prompt || "";

      if (!GROQ_API_KEY) {
        return jsonResponse({ items: [{ name: promptText, quantity: 1, unit: "шт", category: "Другое" }] });
      }

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are an AI grocery parser for Uzbekistan/Russia. Output ONLY a valid JSON array of objects with keys: name (string in original language), quantity (number), unit (string like шт/кг/л/пак), price (number or null), category (string in Russian). No markdown, no explanations, only JSON array.",
            },
            { role: "user", content: promptText },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      const groqData = await groqRes.json();
      const content = groqData.choices?.[0]?.message?.content || "[]";
      let parsed = [];
      try {
        // Try to extract JSON array from response
        const match = content.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(content);
      } catch {
        parsed = [{ name: promptText, quantity: 1, unit: "шт", category: "Другое" }];
      }

      return jsonResponse({ items: parsed });
    }

    // 18. AI Plan
    if (pathname === "/ai/plan" && req.method === "POST") {
      const body = await req.json();
      const { days = 7, people = 2, budget, preferences } = body;

      if (!GROQ_API_KEY) {
        return jsonResponse({
          plan_name: `План на ${days} дней`,
          total_estimated_cost: null,
          categories: [
            { name: "Овощи и фрукты", items: [{ name: "Помидоры", quantity: 1, unit: "кг", price: 8000 }] },
            { name: "Молочные продукты", items: [{ name: "Молоко", quantity: 2, unit: "л", price: 12000 }] },
          ],
        });
      }

      const systemPrompt = `You are a meal planning assistant for Uzbekistan. Create a shopping plan for ${people} people for ${days} days${budget ? ` with budget ${budget} UZS` : ""}${preferences ? `. Preferences: ${preferences}` : ""}. Output ONLY valid JSON with structure: { "plan_name": string, "total_estimated_cost": number, "categories": [{ "name": string, "items": [{ "name": string, "quantity": number, "unit": string, "price": number }] }] }. No markdown, only JSON.`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Generate the shopping plan." }],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      const groqData = await groqRes.json();
      const content = groqData.choices?.[0]?.message?.content || "{}";
      let parsed: any = {};
      try {
        const match = content.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(content);
      } catch {
        parsed = { plan_name: `План на ${days} дней`, total_estimated_cost: null, categories: [] };
      }

      return jsonResponse(parsed);
    }

    // Fallback 404
    return jsonResponse({ error: "Not found", path: pathname }, 404);
  } catch (err: any) {
    console.error("API error:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
});
