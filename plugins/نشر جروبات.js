import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { randomBytes } from 'crypto';

// دالة تأخير بين الإرسال لتجنب الحظر
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// رقم المطور الرئيسي الذي يستطيع استخدام الأمر
const developerNumber = "+201145624848"; // استبدل رقم المطور برقمك

// دالة للتحقق ما إذا كان المستخدم هو البوت أو المطور
const isDeveloperOrBot = (m, conn) => {
  const botNumber = conn.user.jid;
  return m.sender === botNumber || m.sender === developerNumber + '@s.whatsapp.net';
};

// دالة لنشر الرسائل لجميع المجموعات
const publishToAllGroups = async (conn, mediax, caption, mentions) => {
  const groups = Object.keys(await conn.groupFetchAllParticipating()); // الحصول على كل المجموعات التي البوت عضو فيها
  for (let groupId of groups) {
    await delay(1500); // تأخير 1.5 ثانية بين كل رسالة لتجنب الحظر
    await conn.sendMessage(groupId, {
      video: mediax,
      caption: caption, // النص مع المنشن المخفي
      mentions: mentions
    });
  }
};

// الكود الأساسي للنشر
const handler = async (m, { conn, text, participants }) => {
  try {
    // التحقق من أن الأمر يتم تنفيذه فقط من المطور أو البوت نفسه
    if (!isDeveloperOrBot(m, conn)) {
      return conn.sendMessage(m.chat, { 
        text: "❌ [ ℹ️ ] هذا الأمر يمكن استخدامه فقط من المطور أو رقم البوت."
      });
    }

    // جمع المستخدمين الذين سيتم منشنهم
    const users = participants.map((u) => conn.decodeJid(u.id));
    const signature = `『🄰🄻🄼🅄🅂🄰🄱🄸 🄱🄾🅃』\n⚙️ المطور: wa.me/${developerNumber.replace('+', '')}`; // التوقيع مع الرقم القابل للنقر
    const more = String.fromCharCode(8206);
    const longSpace = more.repeat(3000); // جعل الرسالة أطول لتجنب الحظر
    const masss = more.repeat(850); // لتكرار المنشن المخفي

    // النص المستخدم في الفيديو أو النص العادي
    const htextos = text ? text : '';
    
    // تحسين زخرفة النصوص
    const decoratedText = `
    🎉 *${htextos}* 🎉
    
    📢 *تم النشر من قِبَل المطورين!* 📢
    
    🔔 "أتمنى لك يومًا سعيدًا مليئًا بالفرح"
    ${signature}
    `;

    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video/.test(mime);
    
    // إذا كان المنشور يحتوي على فيديو
    if (isMedia && quoted.mtype === 'videoMessage') {
      var mediax = await quoted.download?.();
      
      // نشر الفيديو مع المنشن المخفي
      await publishToAllGroups(conn, mediax, `${longSpace}\n${masss}\n${decoratedText}`, users);

    } else {
      // نشر النص فقط إذا لم يكن هناك وسائط
      await publishToAllGroups(conn, null, `${longSpace}\n${masss}\n${decoratedText}`, users);
    }

    // إرسال رسالة نهائية واحدة فقط بعد النشر
    conn.sendMessage(m.chat, { 
      text: `🔔 من قبل المطورين`
    });

  } catch (err) {
    console.error('Error:', err);
    conn.sendMessage(m.chat, { 
      text: `❌ حدث خطأ أثناء النشر! حاول مرة أخرى.`
    });
  }
};

// تحديد الأمر والمجموعة والقيود
handler.command = /^(نشر جروب)$/i;
handler.group = true; // الأمر يعمل فقط في المجموعات، ولكن البوت والمطور يستطيعون في الخاص.
handler.admin = false; // تم إلغاء شرط أن يكون المستخدم مشرفًا

export default handler;
