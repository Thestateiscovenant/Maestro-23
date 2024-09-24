import * as cheerio from "cheerio";
import fetch from "node-fetch";

// مجموعة من الرسائل العشوائية باللهجة اليمنية
const randomMessages = [
  "❲ 🤔 ❳ صبر لي شوي بس بفكر...",
  "❲ 😎 ❳ لحظة بالله عليك، جاري المعالجة...",
  "❲ 💡 ❳ أها، جات الفكرة! استنى شوية...",
  "❲ 😴 ❳ يا عيني، خليني أحسبها وبرد لك...",
  "❲ ⚡ ❳ أوه تمام، قربت أنتهي!"
];

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.length >= 1 ? args.slice(0).join(" ") : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;

  if (!text) {
    return m.reply(`❗ دخل النص أو رد على رسالة، مثال: *${usedPrefix}${command} كيف حالك؟*`);
  }

  // اختيار رسالة عشوائية باللهجة اليمنية
  const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  m.reply(randomMessage);

  try {
    let result = await wxGpt(text);
    
    // تنظيف النص من التنسيقات غير الضرورية
    result = cleanText(result);
    
    // إرسال النتيجة بعد المعالجة مع توقيع
    m.reply(`${result}\n\n『🄰🄻🄼🅄🅂🄰🄱🄸 🄱🄾🅃』`);
  } catch (e) {
    console.error(e);
    m.reply("❗ حصلت مشكلة، حاول مرة ثانية.");
  }
};

handler.help = ["لي"];
handler.tags = ["internet", "ai", "gpt"];
handler.command = /^(لي)$/i;

export default handler;

async function wxGpt(you_qus) {
  let baseURL = "https://free-api.cveoy.top/";
  try {
    const response = await fetch(baseURL + "v3/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "https://ai1.chagpt.fun",
        Referer: baseURL
      },
      body: JSON.stringify({
        prompt: you_qus
      })
    });

    // التحقق من استجابة API
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error(error);
    throw new Error("❗ حصل خطأ في جلب البيانات.");
  }
}

// دالة لتنظيف النص من التنسيقات غير الضرورية
function cleanText(text) {
  return text.replace(/<[^>]*>/g, '').replace(/欢迎使用 公益站! 站长合作邮箱：wxgpt@qq.com/g, '').trim();
}
