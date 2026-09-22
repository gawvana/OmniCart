import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("BOT_TOKEN") || "";
const WEBAPP_URL = Deno.env.get("TELEGRAM_WEBAPP_URL") || "https://frontend-umber-seven-66.vercel.app";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ── Telegram API Helpers ──────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(num: number): string {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function editTelegramMessage(chatId: number | string, messageId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "HTML",
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function answerTelegramCallback(callbackQueryId: string, text?: string, showAlert: boolean = false) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  const body: any = { callback_query_id: callbackQueryId };
  if (text) body.text = text;
  if (showAlert) body.show_alert = true;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function sendChatAction(chatId: number | string, action: string = "typing") {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  }).catch(() => {});
}

// ── Persistent Reply Keyboard ─────────────────────────────────────────────

function getMainReplyKeyboard() {
  return {
    keyboard: [
      [
        { text: "📋 Мой список" },
        { text: "💡 Регулярные" },
      ],
      [
        { text: "🛒 Открыть OmniCart", web_app: { url: WEBAPP_URL } },
      ],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

// ── Category & Item Categorization ────────────────────────────────────────

const CATEGORIES: Record<number, { name: string; emoji: string }> = {
  1: { name: "Овощи и фрукты", emoji: "🥦" },
  2: { name: "Молочные продукты", emoji: "🥛" },
  3: { name: "Мясо и птица", emoji: "🥩" },
  4: { name: "Хлеб и выпечка", emoji: "🥖" },
  5: { name: "Напитки", emoji: "🧃" },
  6: { name: "Бакалея", emoji: "🌾" },
  7: { name: "Бытовая химия", emoji: "🧼" },
  8: { name: "Сладости", emoji: "🍫" },
};

function detectCategory(name: string): { id: number; name: string; emoji: string } {
  const lower = name.toLowerCase();
  if (/помидор|томат|огур|картоф|морков|лук|чеснок|зелен|укроп|петруш|капуст|яблок|банан|апельсин|мандарин|виноград|лимон|фрукт|овощ|ягод|груш|персик|абрикос|клубник|малин|арбуз|дыня/i.test(lower)) {
    return CATEGORIES[1];
  }
  if (/молок|сыр|творог|сметан|масло слив|йогурт|кефир|сливк|ряженк|брынз|каймак|сулугуни/i.test(lower)) {
    return CATEGORIES[2];
  }
  if (/мясо|говядин|баранин|куриц|индейк|фарш|колбас|сосиск|стейк|рыб|лосос|семг|филе|окороч|шашлык/i.test(lower)) {
    return CATEGORIES[3];
  }
  if (/хлеб|лепешк|батон|булочк|лаваш|бублик|круассан|пирог|выпечк|сухар|тост/i.test(lower)) {
    return CATEGORIES[4];
  }
  if (/вод|сок|чай|кофе|кола|напит|лимонад|морс|квас|пив|вино|пепси|энергетик/i.test(lower)) {
    return CATEGORIES[5];
  }
  if (/мыло|шампунь|порошок|паста зубн|губк|салфетк|туалетн|чистящ|моющее|белизн|гель для душ/i.test(lower)) {
    return CATEGORIES[7];
  }
  if (/шоколад|конфет|печень|торт|вафл|морожен|мармелад|зефир|халв|пастил|пирожн/i.test(lower)) {
    return CATEGORIES[8];
  }
  if (/рис|гречк|макарон|паст|мука|сахар|соль|масло растит|масло подсолн|масло оливк|специ|перец|горох|фасол|чечевиц|овсянк|хлопь|кетчуп|майонез|соус|крупа/i.test(lower)) {
    return CATEGORIES[6];
  }
  return { id: 6, name: "Бакалея и разное", emoji: "📦" };
}

// ── User & List DB Resolver ───────────────────────────────────────────────

async function resolveUserAndList(from: any): Promise<{ user: any; listId: string }> {
  // 1. Get or create user
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_user_id", from.id)
    .maybeSingle();

  let user = existingUser;
  if (!user) {
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        telegram_user_id: from.id,
        username: from.username || null,
        first_name: from.first_name || "Пользователь",
        last_name: from.last_name || null,
        language: from.language_code || "ru",
      })
      .select("*")
      .single();
    if (error) throw error;
    user = newUser;
  } else {
    // Update name/username if changed
    if ((from.username && user.username !== from.username) || (from.first_name && user.first_name !== from.first_name)) {
      await supabase
        .from("users")
        .update({ username: from.username, first_name: from.first_name })
        .eq("id", user.id);
    }
  }

  // 2. Get or create default list
  let { data: defaultList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!defaultList) {
    const { data: newList } = await supabase
      .from("shopping_lists")
      .insert({
        owner_id: user.id,
        name: "Мой список",
        emoji: "🛒",
        color: "#10B981",
        is_default: true,
      })
      .select("id")
      .single();
    defaultList = newList;
  }

  return { user, listId: defaultList.id };
}

// ── Interactive Checklist Renderer ────────────────────────────────────────

async function renderChecklist(listId: string, userId: string): Promise<{ text: string; keyboard: any }> {
  const { data: items = [], error } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("list_id", listId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !items || items.length === 0) {
    const text =
      "<b>📋 Ваш список покупок пуст</b>\n\n" +
      "• Отправьте боту текст: <i>«Молоко 2л, яблоки 1кг 20000, хлеб»</i>\n" +
      "• Или отправьте <b>голосовое сообщение</b> 🎙\n" +
      "• Или нажмите <b>«💡 Добавить регулярные»</b> для базового набора!";

    const keyboard = {
      inline_keyboard: [
        [{ text: "💡 Добавить регулярные товары", callback_data: "add_staples" }],
        [{ text: "🛒 Открыть OmniCart", web_app: { url: WEBAPP_URL } }],
      ],
    };
    return { text, keyboard };
  }

  const pendingItems = items.filter((i: any) => !i.is_purchased);
  const purchasedItems = items.filter((i: any) => i.is_purchased);

  // Calculate estimated total
  let totalCost = 0;
  for (const item of pendingItems) {
    const p = Number(item.estimated_price || item.actual_price || 0);
    const q = Number(item.quantity || 1);
    if (p > 0) totalCost += p * q;
  }

  const lines: string[] = [
    "<b>📋 Чек-лист покупок OmniCart</b>",
    `Осталось купить: <b>${pendingItems.length}</b> | Куплено: <b>${purchasedItems.length}</b>`,
  ];

  if (totalCost > 0) {
    lines.push(`💰 Примерная сумма: <b>${formatNumber(totalCost)} сум</b>\n`);
  } else {
    lines.push("");
  }

  // Group pending items by category
  const grouped: Record<string, any[]> = {};
  for (const item of pendingItems) {
    const cat = item.category || (item.category_id && CATEGORIES[item.category_id]?.name) || "📦 Разное";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const inlineRows: any[] = [];
  let itemNum = 1;

  for (const [catName, catItems] of Object.entries(grouped)) {
    const catEmoji = Object.values(CATEGORIES).find((c) => c.name === catName)?.emoji || "📦";
    lines.push(`<b>${catEmoji} ${escapeHtml(catName)}</b>`);

    for (const item of catItems) {
      const q = Number(item.quantity || 1);
      const qtyStr = q === Math.round(q) ? q.toString() : q.toFixed(1);
      const priceVal = Number(item.estimated_price || item.actual_price || 0);
      const priceStr = priceVal > 0 ? ` <i>(~${formatNumber(priceVal)} сум)</i>` : "";

      lines.push(`  ${itemNum}. [ ] <b>${escapeHtml(item.name)}</b> — ${qtyStr} ${escapeHtml(item.unit || "шт")}${priceStr}`);

      // Inline button to check off this item
      inlineRows.push([
        {
          text: `✓ ${item.name.slice(0, 20)}`,
          callback_data: `chk_toggle:${item.id}`,
        },
      ]);
      itemNum++;
    }
    lines.push("");
  }

  if (purchasedItems.length > 0) {
    lines.push("<b>Куплено:</b>");
    for (const p of purchasedItems.slice(0, 6)) {
      lines.push(`  <s>[x] ${escapeHtml(p.name)}</s>`);
    }
    if (purchasedItems.length > 6) {
      lines.push(`  <i>...и ещё ${purchasedItems.length - 6} товаров</i>`);
    }
    lines.push("");
  }

  // Action rows
  inlineRows.push([
    { text: "💡 Регулярные", callback_data: "add_staples" },
    { text: "🧹 Очистить", callback_data: "chk_clear" },
  ]);
  inlineRows.push([
    { text: "👥 Поделиться", callback_data: "chk_share" },
    { text: "🛒 Открыть OmniCart", web_app: { url: WEBAPP_URL } },
  ]);

  return {
    text: lines.join("\n"),
    keyboard: { inline_keyboard: inlineRows },
  };
}

// ── Staples Inserter ──────────────────────────────────────────────────────

async function insertStaples(listId: string): Promise<number> {
  const staples = [
    { name: "Говядина мякоть", quantity: 1.5, unit: "кг", estimated_price: 135000, category_id: 3, category: "Мясо и птица" },
    { name: "Картофель", quantity: 3.0, unit: "кг", estimated_price: 15000, category_id: 1, category: "Овощи и фрукты" },
    { name: "Лук репчатый", quantity: 2.0, unit: "кг", estimated_price: 6000, category_id: 1, category: "Овощи и фрукты" },
    { name: "Масло растительное", quantity: 1.0, unit: "л", estimated_price: 19000, category_id: 6, category: "Бакалея" },
    { name: "Хлеб / Лепешки", quantity: 2.0, unit: "шт", estimated_price: 8000, category_id: 4, category: "Хлеб и выпечка" },
    { name: "Молоко 3.2%", quantity: 1.0, unit: "л", estimated_price: 12000, category_id: 2, category: "Молочные продукты" },
  ];

  const rows = staples.map((s) => ({
    list_id: listId,
    name: s.name,
    quantity: s.quantity,
    unit: s.unit,
    estimated_price: s.estimated_price,
    category_id: s.category_id,
    category: s.category,
    currency: "UZS",
    is_purchased: false,
  }));

  const { data, error } = await supabase.from("shopping_items").insert(rows).select("id");
  if (error) console.error("Error inserting staples:", error);
  return data?.length || 0;
}

// ── Smart Natural Language Parser ─────────────────────────────────────────

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  category: string;
  category_id: number;
}

function parseTextLocally(text: string): ParsedItem[] {
  const segments = text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("/"));

  const results: ParsedItem[] = [];

  for (const seg of segments) {
    let name = seg;
    let quantity = 1;
    let unit = "шт";
    let price: number | undefined = undefined;

    // 1. Price pattern (e.g. 25000 сум, 25k, 15000)
    const priceMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(?:сум|sum|uzs|k|тыс\.?)\b/i) ||
                       name.match(/\b(\d{4,7})\b/);
    if (priceMatch) {
      let p = parseFloat(priceMatch[1].replace(",", "."));
      if (/k|тыс/i.test(priceMatch[0])) p *= 1000;
      price = p;
      name = name.replace(priceMatch[0], "").trim();
    }

    // 2. Quantity and unit pattern (e.g. 2 кг, 1.5 л, 3 шт)
    const qtyUnitMatch =
      name.match(/(\d+(?:[.,]\d+)?)\s*(кг|г|л|мл|шт|уп|пач|бут|упак|пакет)/i) ||
      name.match(/(\d+(?:[.,]\d+)?)/);

    if (qtyUnitMatch) {
      quantity = parseFloat(qtyUnitMatch[1].replace(",", "."));
      if (qtyUnitMatch[2]) {
        unit = qtyUnitMatch[2].toLowerCase();
      }
      name = name.replace(qtyUnitMatch[0], "").trim();
    }

    name = name.replace(/^[-+•*~]\s*/, "").trim();
    if (!name) continue;

    const cat = detectCategory(name);
    results.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quantity,
      unit,
      price,
      category: cat.name,
      category_id: cat.id,
    });
  }

  return results;
}

async function parseWithGroq(text: string): Promise<ParsedItem[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are OmniCart grocery parser. Extract items from user text. Return ONLY a valid JSON array of objects with keys: " +
              'name (string), quantity (number), unit (string: шт, кг, л, уп, etc.), price (number or null). No explanations, no markdown formatting.',
          },
          { role: "user", content: text },
        ],
        temperature: 0.1,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "";
      const cleaned = content.replace(/^```json/, "").replace(/```$/, "").trim();
      const items = JSON.parse(cleaned);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((it: any) => {
          const cat = detectCategory(it.name || "");
          return {
            name: it.name || "Товар",
            quantity: Number(it.quantity) || 1,
            unit: it.unit || "шт",
            price: it.price ? Number(it.price) : undefined,
            category: cat.name,
            category_id: cat.id,
          };
        });
      }
    }
  } catch (err) {
    console.warn("Groq parse fallback to regex:", err);
  }
  return parseTextLocally(text);
}

// ── Voice Transcription via Groq Whisper ─────────────────────────────────

async function transcribeAudio(fileId: string): Promise<string | null> {
  try {
    // 1. Get file path from Telegram
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) return null;

    // 2. Download audio file
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    const audioRes = await fetch(downloadUrl);
    const audioBuffer = await audioRes.arrayBuffer();

    // 3. Send to Groq Whisper
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: "audio/ogg" });
    formData.append("file", blob, "voice.ogg");
    formData.append("model", "whisper-large-v3");
    formData.append("language", "ru");

    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: formData,
    });

    if (!whisperRes.ok) {
      console.error("Whisper error status:", whisperRes.status);
      return null;
    }

    const whisperData = await whisperRes.json();
    return whisperData.text || null;
  } catch (err) {
    console.error("Audio transcription failed:", err);
    return null;
  }
}

// ── HTTP Entrypoint ───────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const update = await req.json();
    console.log("Telegram update:", JSON.stringify(update));

    const message = update.message;
    const callbackQuery = update.callback_query;

    // ── 1. Handle Callback Queries (Inline Buttons) ──────────────────────
    if (callbackQuery) {
      const chatId = callbackQuery.message?.chat?.id;
      const messageId = callbackQuery.message?.message_id;
      const data = callbackQuery.data || "";
      const from = callbackQuery.from;

      if (!chatId || !from) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      const { user, listId } = await resolveUserAndList(from);

      // Toggle item purchased
      if (data.startsWith("chk_toggle:")) {
        const itemId = data.replace("chk_toggle:", "");
        const { data: item } = await supabase
          .from("shopping_items")
          .select("id, name, is_purchased")
          .eq("id", itemId)
          .single();

        if (item) {
          const nextState = !item.is_purchased;
          await supabase
            .from("shopping_items")
            .update({
              is_purchased: nextState,
              purchased_at: nextState ? new Date().toISOString() : null,
            })
            .eq("id", itemId);

          const alertText = nextState ? `${item.name}: куплено! ✓` : `${item.name}: возвращено в список`;
          await answerTelegramCallback(callbackQuery.id, alertText);

          // Update checklist in-place
          const { text: updatedText, keyboard: updatedKb } = await renderChecklist(listId, user.id);
          await editTelegramMessage(chatId, messageId, updatedText, updatedKb).catch(() => {});
        } else {
          await answerTelegramCallback(callbackQuery.id, "Товар не найден");
        }
      }
      // Clear completed items
      else if (data === "chk_clear") {
        await supabase
          .from("shopping_items")
          .update({ deleted_at: new Date().toISOString() })
          .eq("list_id", listId)
          .eq("is_purchased", true)
          .is("deleted_at", null);

        await answerTelegramCallback(callbackQuery.id, "Купленные товары удалены! 🧹");
        const { text: updatedText, keyboard: updatedKb } = await renderChecklist(listId, user.id);
        await editTelegramMessage(chatId, messageId, updatedText, updatedKb).catch(() => {});
      }
      // Add staple goods
      else if (data === "add_staples") {
        const added = await insertStaples(listId);
        await answerTelegramCallback(callbackQuery.id, `Добавлено регулярных товаров: ${added} шт 💡`);
        const { text: updatedText, keyboard: updatedKb } = await renderChecklist(listId, user.id);
        await editTelegramMessage(chatId, messageId, updatedText, updatedKb).catch(() => {});
      }
      // Share family list
      else if (data === "chk_share") {
        await answerTelegramCallback(callbackQuery.id);
        const shareLink = `https://t.me/OmniCartV2_bot?start=cart_${user.id}`;
        const shareText =
          `👥 <b>Семейный список OmniCart</b>\n\n` +
          `Отправьте эту ссылку близким, чтобы вести список покупок вместе:\n` +
          `<a href="${shareLink}">${shareLink}</a>\n\n` +
          `Все товары будут синхронизироваться автоматически в реальном времени!`;

        await sendTelegramMessage(chatId, shareText, {
          inline_keyboard: [
            [
              {
                text: "📲 Переслать ссылку",
                url: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent("Давай вести список покупок вместе в OmniCart!")}`,
              },
            ],
          ],
        });
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ── 2. Handle Text & Voice Messages ──────────────────────────────────
    if (message) {
      const chatId = message.chat.id;
      const from = message.from;
      if (!from) return new Response(JSON.stringify({ ok: true }), { status: 200 });

      const { user, listId } = await resolveUserAndList(from);
      const text = (message.text || "").trim();

      // Handle Voice / Audio Notes
      if (message.voice || message.audio) {
        await sendChatAction(chatId, "record_voice");
        const statusMsg = await sendTelegramMessage(chatId, "🎙 <i>Слушаю голосовое сообщение...</i>");
        const statusMsgId = statusMsg?.result?.message_id;

        const fileId = message.voice?.file_id || message.audio?.file_id;
        const transcript = await transcribeAudio(fileId);

        if (!transcript || !transcript.trim()) {
          if (statusMsgId) {
            await editTelegramMessage(chatId, statusMsgId, "⚠️ Не удалось распознать голос. Пожалуйста, повторите или напишите текстом.");
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        const safeTranscript = escapeHtml(transcript.trim());
        if (statusMsgId) {
          await editTelegramMessage(chatId, statusMsgId, `🗣 <i>«${safeTranscript}»</i>\n✨ <b>Добавляю в список...</b>`);
        }

        // Parse extracted transcript
        const parsedItems = await parseWithGroq(transcript);
        if (parsedItems.length > 0) {
          const insertRows = parsedItems.map((it) => ({
            list_id: listId,
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            estimated_price: it.price || null,
            category: it.category,
            category_id: it.category_id,
            currency: "UZS",
            is_purchased: false,
          }));
          await supabase.from("shopping_items").insert(insertRows);

          if (statusMsgId) {
            await editTelegramMessage(
              chatId,
              statusMsgId,
              `🗣 <i>«${safeTranscript}»</i>\n✅ <b>Добавлено в список: ${parsedItems.length} ${parsedItems.length === 1 ? "товар" : "товара"}</b>`
            );
          }

          const { text: chkText, keyboard: chkKb } = await renderChecklist(listId, user.id);
          await sendTelegramMessage(chatId, chkText, chkKb);
        } else {
          if (statusMsgId) {
            await editTelegramMessage(chatId, statusMsgId, `🗣 <i>«${safeTranscript}»</i>\n⚠️ Товары не распознаны.`);
          }
        }

        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Handle /start command
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const startArg = parts[1] || "";

        // Deep-link join: /start cart_<ownerUserId>
        if (startArg.startsWith("cart_")) {
          const targetOwnerId = startArg.replace("cart_", "").trim();
          if (targetOwnerId && targetOwnerId !== user.id) {
            const { data: targetList } = await supabase
              .from("shopping_lists")
              .select("id, name")
              .eq("owner_id", targetOwnerId)
              .is("deleted_at", null)
              .maybeSingle();

            if (targetList) {
              await sendTelegramMessage(
                chatId,
                `🎉 <b>Вы успешно подключились к общему списку!</b>\n\nТеперь все покупки синхронизируются для вас и вашей семьи.`,
                getMainReplyKeyboard()
              );
              const { text: chkText, keyboard: chkKb } = await renderChecklist(targetList.id, user.id);
              await sendTelegramMessage(chatId, chkText, chkKb);
              return new Response(JSON.stringify({ ok: true }), { status: 200 });
            }
          }
        }

        const safeFirstName = escapeHtml(from.first_name || "Пользователь");
        const welcomeText =
          `<b>Привет, ${safeFirstName}! 🛒</b>\n\n` +
          `Добро пожаловать в <b>OmniCart AI</b> — умный список покупок с мгновенной синхронизацией!\n\n` +
          `• 💬 Пишите товары в чат: <i>«Молоко 2л, хлеб, яблоки 1кг 20000»</i>\n` +
          `• 🎙 Отправляйте голосовые сообщения\n` +
          `• ✓ Вычёркивайте купленное кнопками прямо в Telegram\n` +
          `• 📱 Открывайте красивый Mini App по кнопке внизу`;

        // Send persistent reply keyboard
        await sendTelegramMessage(chatId, welcomeText, getMainReplyKeyboard());

        // Render checklist right in chat
        const { text: chkText, keyboard: chkKb } = await renderChecklist(listId, user.id);
        await sendTelegramMessage(chatId, chkText, chkKb);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Handle /help command
      if (text.startsWith("/help")) {
        const helpText =
          `<b>📖 Справка OmniCart AI:</b>\n\n` +
          `1. <b>Добавление товаров:</b>\n` +
          `Просто напишите список в чат или отправьте голосовое сообщение. AI сам поймёт количество, единицы и цены.\n\n` +
          `2. <b>Чек-лист:</b>\n` +
          `Нажмите кнопку <b>«✓ Название»</b> прямо под списком, чтобы отметить товар купленным.\n\n` +
          `3. <b>Очистка:</b>\n` +
          `Кнопка <b>«🧹 Очистить»</b> уберёт все вычеркнутые позиции.\n\n` +
          `4. <b>Семейный доступ:</b>\n` +
          `Кнопка <b>«👥 Поделиться»</b> создаст ссылку для совместных покупок.\n\n` +
          `5. <b>Mini App:</b>\n` +
          `Нажмите <b>«🛒 Открыть OmniCart»</b> для доступа к аналитике, умному бюджету и удобному интерфейсу.`;

        await sendTelegramMessage(chatId, helpText, {
          inline_keyboard: [
            [{ text: "🛒 Открыть OmniCart", web_app: { url: WEBAPP_URL } }],
          ],
        });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Handle "📋 Мой список" or "/list"
      if (text === "📋 Мой список" || text === "/list" || text.toLowerCase() === "список") {
        const { text: chkText, keyboard: chkKb } = await renderChecklist(listId, user.id);
        await sendTelegramMessage(chatId, chkText, chkKb);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Handle "💡 Регулярные" or "/staples"
      if (text === "💡 Регулярные" || text === "🛒 Добавить регулярные" || text === "/staples") {
        const count = await insertStaples(listId);
        await sendTelegramMessage(chatId, `✅ <b>Добавлены регулярные товары (${count} шт)</b>`, getMainReplyKeyboard());
        const { text: chkText, keyboard: chkKb } = await renderChecklist(listId, user.id);
        await sendTelegramMessage(chatId, chkText, chkKb);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Handle Natural Language Text (Item Addition)
      await sendChatAction(chatId, "typing");
      const parsedItems = await parseWithGroq(text);

      if (parsedItems.length > 0) {
        const insertRows = parsedItems.map((it) => ({
          list_id: listId,
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          estimated_price: it.price || null,
          category: it.category,
          category_id: it.category_id,
          currency: "UZS",
          is_purchased: false,
        }));

        await supabase.from("shopping_items").insert(insertRows);

        const countText = parsedItems.length === 1 ? "1 товар" : `${parsedItems.length} товара(-ов)`;
        await sendTelegramMessage(chatId, `✅ <b>Добавлено в список: ${countText}</b>`);

        const { text: chkText, keyboard: chkKb } = await renderChecklist(listId, user.id);
        await sendTelegramMessage(chatId, chkText, chkKb);
      } else {
        await sendTelegramMessage(
          chatId,
          "❓ Не удалось распознать товар. Попробуйте написать в формате:\n<i>«Молоко 2л, хлеб 2шт, мясо 1кг 130000»</i>"
        );
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error("Bot webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
