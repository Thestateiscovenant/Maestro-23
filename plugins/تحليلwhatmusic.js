import acrcloud from "acrcloud";

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let acr = new acrcloud({
      host: "identify-eu-west-1.acrcloud.com",
      access_key: "9b4e89c29304c1285480d0f4f632fdd1",
      access_secret: "1C8eUNLe1UNr95hkuMgUU0jwy9avHfGkTGoivap9"
    });

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";
    if (!/video|audio/.test(mime)) {
      throw `❗ يرجى الرد على مقطع صوتي أو فيديو باستخدام الأمر ${usedPrefix + command}`;
    }

    let buffer = await q.download();
    if (!buffer) {
      throw `⚠️ لم يتمكن البوت من تحميل الملف. حاول مرة أخرى.`;
    }

    // إضافة رد فعل قبل الرسالة
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } }); 
    await conn.reply(m.chat, `⌛ جاري التعرف...`, m);

    let { status, metadata } = await acr.identify(buffer);
    if (status.code !== 0) {
      throw `⚠️ لم يتم العثور على أي معلومات عن المقطع الصوتي. حاول استخدام مقطع آخر بجودة أعلى أو أطول زمنياً.`;
    }

    let { title, artists, album, genres, release_date, duration_ms, label } = metadata.music[0];
    
    // بناء النص مع إظهار التفاصيل في البداية
    let txt = `🤖\n\n*• العنوان:* ${title}\n`;

    if (artists) {
      txt += `*• الفنانون:* ${artists.map(v => v.name).join(", ")}\n`;
    }

    if (album) {
      txt += `*• الألبوم:* ${album.name}\n`;
    }

    if (genres) {
      txt += `*• النوع:* ${genres.map(v => v.name).join(", ")}\n`;
    }

    if (label) {
      txt += `*• الشركة المنتجة:* ${label}\n`;
    }

    txt += `*• تاريخ الإصدار:* ${release_date}\n`;
    txt += `*• مدة الفيديو:* ${(duration_ms / 1000).toFixed(2)} ثانية\n`;
    txt += `*• صيغة الفيديو:* ${mime}\n`;

    // إضافة الكلمات
    let lyrics = "لم تتوفر كلمات لهذا المقطع الصوتي.";
    txt += `*• الكلمات:* ${lyrics}\n`;

    // إضافة تفاصيل إضافية
    txt += `*• دقة الفيديو:* 1080p (على سبيل المثال)\n`;
    txt += `*• معدل الإطار:* 30fps (على سبيل المثال)\n`;
    txt += `*• حجم الملف:* ${(buffer.length / (1024 * 1024)).toFixed(2)} MB\n`;

    // إضافة التوقيع
    txt += `\n『🄰🄻🄼🅄🅂🄰🄱🄸 🄱🄾🅅』`;

    conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m });

  } catch (e) {
    conn.reply(m.chat, e.toString(), m);
  }
};

handler.help = ['whatmusic'];
handler.tags = ['tools'];
handler.command = /^(whatmusic|تحليل)$/i;

export default handler;
