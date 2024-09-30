import axios from 'axios';
import cheerio from 'cheerio';
import { mediafiredl } from '@bochilteam/scraper';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });
    throw `_*< التحميلات - MEDIAFIRE />*_\n\n*[ ℹ️ ] أدخل رابط ميديا ​​فاير.*\n\n*[ 💡 ] مثال:* _${usedPrefix + command} https://www.mediafire.com/file/ra80nactsirv0nt/HA2WhatsApp_2.24.11.79.apk/file/?dkey=ns7v2an08ry&r=266_\n\n『🄱🄾🅃 🄰🄻🄼🅄🅂🄰🄱🄸』`;
  }

  try {
    // بدء معالجة الرابط
    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

    const resEX = await mediafiredl(args[0]);
    const captionES = `_*< التحميلات - MEDIAFIRE />*_\n
▢ *إسم:* ${resEX.filename}
▢ *مقاس:* ${resEX.filesizeH}
▢ *امتداد:* ${resEX.ext}\n\n
*[ ℹ️ ] يتم الآن إرسال الملف. انتظر...*`.trim() + '\n\n『🄱🄾🅃 🄰🄻🄼🅄🅂🄰🄱🄸』';
    
    await m.reply(captionES);
    await conn.sendFile(m.chat, resEX.url, resEX.filename, '', m, null, { mimetype: resEX.ext, asDocument: true });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch {
    try {
      const res = await mediafireDl(args[0]);
      const { name, size, mime, link } = res;
      const caption = `_*< التحميلات - MEDIAFIRE />*_\n
▢ *إسم:* ${name}
▢ *مقاس:* ${size}
▢ *امتداد:* ${mime}\n\n
*[ ℹ️ ] يتم الآن إرسال الملف. انتظر...*`.trim() + '\n\n『🄱🄾🅃 🄰🄻🄼🅄🅂🄰🄱🄸』';
      
      await m.reply(caption);
      await conn.sendFile(m.chat, link, name, '', m, null, { mimetype: mime, asDocument: true });
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch {
      await m.reply('_*< التحميلات - MEDIAFIRE />*_\n\n*[ ℹ️ ] حدث خطأ. الرجاء معاودة المحاولة في وقت لاحق.*\n\n『🄱🄾🅃 🄰🄻🄼🅄🅂🄰🄱🄸』');
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
  }
};

handler.command = /^(mediafire|ميديافاير|mf)$/i;
export default handler;

async function mediafireDl(url) {
  const res = await axios.get(`https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`);
  const $ = cheerio.load(res.data);
  const link = $('#downloadButton').attr('href');
  const name = $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title').replace(/\s+/g, ' ').trim();
  const size = $('#downloadButton').text().replace('Download', '').replace(/[()\n\s]+/g, ' ').trim();
  let mime = '';
  const rese = await axios.head(link);
  mime = rese.headers['content-type'];
  return { name, size, mime, link };
}
