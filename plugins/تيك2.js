import fetch from 'node-fetch';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {

  if (!text) {
  
  await conn.sendMessage(m.chat, { text: `*❲ ❗ ❳ لم يتم إدخال رابط.*\nيرجي ادخال رابط مثال :\n> ➤  ${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/` }, { quoted: m });
  
  await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
  
  return;
  }
  
    if (!/tiktok/.test(text)) {
  
  await conn.sendMessage(m.chat, { text: `*❲ ❗ ❳ حدث خطأ عند البحث عن الرابط .*\nيرجي ادخال رابط صحيح مثال :\n> ➤  ${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/` }, { quoted: m });
  
  await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  
  return;
  }
  
await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

try {

const response = await fetch(`https://deliriusapi-official.vercel.app/download/tiktok?url=${text}`);

const data = await response.json()
const { author, title, meta} = data.data


const cap2 = `تفضل طلبك يا صديقي 🍿❤️\n⌲ العنوان : ${title}\n⌲ الصانع : ${author.nickname}\n⌲ الحجم : ${meta.media[0].size_hd}`;


//await conn.sendMessage(m.chat, {video: {url: meta.media[0].hd}, mimetype: , tiktok.mp4, caption: cap2}, {quoted: m});

await conn.sendMessage(m.chat, {video: {url: meta.media[0].hd}, mimetype: 'video/mp4', fileName: 'tiktok.mp4', caption: cap2}, {quoted: m});

await conn.sendMessage(m.chat, {audio: {url: meta.media[0].hd}, mimetype: 'audio/mpeg', fileName: 'tiktok.mp3'}, {quoted: m});

//conn.sendFile(m.chat, meta.media[0].hd, 'tiktok.mp4', cap2, m) mimetype: fileName

await conn.sendMessage(m.chat, { react: { text: '👌🏻', key: m.key } });

} catch {
 await conn.sendMessage(m.chat, { text: `*\`❲ ❗ ❳ حدث خطأ عند البحث عن الرابط .\`*\nيرجي ادخال رابط صحيح مثال :\n> ➤  ${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/` }, { quoted: m });
 
 await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.command = /^(تيك2)$/i;
export default handler;
