import fetch from "node-fetch";
import * as cheerio from "cheerio";

// إنشاء كلاس لخدمات الذكاء الاصطناعي
class AIService {
  // دالة عامة لمعالجة المحادثات
  async processChat(baseLink, message) {
    try {
      const html = await (await fetch(baseLink)).text();
      const info = cheerio.load(html)(".wpaicg-chat-shortcode").map((_, el) => Object.fromEntries(Object.entries(el.attribs))).get();
      const formData = new FormData();
      formData.append("_wpnonce", info[0]["data-nonce"]);
      formData.append("post_id", info[0]["data-post-id"]);
      formData.append("action", "wpaicg_chatbox_message");
      formData.append("message", message);
      const response = await fetch(`${baseLink}/wp-admin/admin-ajax.php`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const { data } = await response.json();
      return data || "";
    } catch (error) {
      console.error("An error occurred:", error.message);
      throw error;
    }
  }

  // دوال لخدمات مختلفة
  async chatgptss(message) {
    return await this.processChat("https://chatgptss.org", message);
  }

  async bardaifree(message) {
    return await this.processChat("https://bardaifree.com", message);
  }

  async bartai(message) {
    return await this.processChat("https://bartai.org", message);
  }

  async freegpt4(prompt) {
    try {
      const response = await fetch(`https://api.freegpt4.ddns.net/?text=${encodeURIComponent(prompt)}`);
      return await response.text();
    } catch (error) {
      throw new Error("Error fetching data from AI service.");
    }
  }

  async gpt4on(prompt) {
    try {
      const response = await fetch(`https://gpt4withcustommodel.onrender.com/gpt?query=${encodeURIComponent(prompt)}&model=gpt-4-32k-0314`);
      return (await response.json())?.response;
    } catch (error) {
      throw new Error("Error fetching data from AI service.");
    }
  }

  async lalaland(content) {
    try {
      const response = await fetch("https://lalaland.chat/api/companion/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "unknown",
          messages: [{
            role: "user",
            content: content
          }]
        })
      });
      const str = await response.text();
      const hasil = JSON.parse('["' + str.split("\n").map(s => s.slice(3, -1)).join('","') + '"]').join("");
      return hasil;
    } catch (error) {
      throw new Error("Error fetching data from AI service.");
    }
  }
}

// إنشاء كائن من الكلاس لخدمات الذكاء الاصطناعي
const aiService = new AIService();

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // التحقق من وجود نص أو رسالة مقتبسة
  const text = args.length >= 1 ? args.join(" ") : m.quoted?.text || null;
  if (!text) return m.reply(`الرجاء كتابة النص أو الرد على رسالة.\nمثال: *${usedPrefix}${command} مرحبًا*`);

  // إرسال رسالة انتظار
  await m.reply("⌛ جاري المعالجة...");

  // قائمة الخدمات التي سيتم استخدامها
  const providers = [
    aiService.gpt4on.bind(aiService),
    aiService.lalaland.bind(aiService),
    aiService.freegpt4.bind(aiService),
    aiService.bardaifree.bind(aiService),
    aiService.chatgptss.bind(aiService),
    aiService.bartai.bind(aiService)
  ];

  let resultFound = false;

  for (const service of providers) {
    try {
      const output = await service(text); // محاولة استخدام كل خدمة
      if (output) {
        await conn.reply(m.chat, `${output}\n\n『🄰🄻🄼🅄🅂🄰🄱🄸 🄱🄾🅃』`, m); // الرد بالمخرجات مع التوقيع
        resultFound = true;
        break;
      }
    } catch (e) {
      console.log(e); // تسجيل أي خطأ
    }
  }

  if (!resultFound) {
    await m.reply("❌ لم يتم العثور على نتيجة.");
  }

  // إضافة رد فعل (رمز تعبيري) باستخدام conn.sendMessage
  await conn.sendMessage(m.chat, { react: { text: "👍", key: m.key } });
};

// تعريف الأمر "روك"
handler.help = ["بوت"];
handler.tags = ["ai"];
handler.command = /^(بوت)$/i; // تعريف الأمر "روك"

export default handler;
