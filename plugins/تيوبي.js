import axios from 'axios'
import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';

import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

const {proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice} = (await import("@whiskeysockets/baileys")).default

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
      await conn.sendMessage(m.chat, { text: `*❲ ❗ ❳ يرجي إدخال نص للبحث في يوتيوب .*\nمثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p` }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      return;
    }
    
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

try {
let results = []

const vsearch = await search(text);
await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
shuffleArray(vsearch)
let selectedResults = vsearch.splice(0, 5)

const qu = '720';
        const q = qu + 'p';
        
for (let result of selectedResults) {

         await conn.sendMessage(m.chat, { react: { text: '🕕', key: m.key } });
         
         const v = result.url;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const vidurl = await yt.video[q].download();
         
         await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
         
results.push({
body: proto.Message.InteractiveMessage.Body.fromObject({ text: `\n\n➤ النشر : ${result.ago}\n➤ الطول : ${secondString(result.duration.seconds)}\n➤ الرابط : ${result.url}\n➤ المشاهدات : ${MilesNumber(result.views)}\n➤ الصانع : ${result.author.name}\n➤ القناة : ${result.author.url}\n`.trim() }),
footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: wm }),
header: proto.Message.InteractiveMessage.Header.fromObject({
title: `\n*❲ العنوان : ${result.title} ❳*\n`,
hasMediaAttachment: true,
videoMessage: await createVideoMessage(vidurl)
}),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [
{
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "MP3",
                id: `${usedPrefix}mp3.1 ${v}`
              })
            }
] })})

await conn.sendMessage(m.chat, { react: { text: '🕛', key: m.key } });
}



const responseMessage = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.create({ text: '[❗️] نتائج البحث عن : ' + text }),
footer: proto.Message.InteractiveMessage.Footer.create({ text: '🔎 `بحــث يوتيوب ...`' }),
header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })})}}
}, { quoted: m })

await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id })
await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
} catch (error) {
await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
await conn.reply(m.chat, error.toString(), m)
}}

handler.help = ['youtubearch <txt>']
handler.tags = ['buscador']
handler.command = ['تيوبي']
export default handler

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'ar', gl: 'AR', ...options });
  return search.videos;
}
async function createVideoMessage(url) {
const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer })
return videoMessage
}
async function shuffleArray(array) {
for (let i = array.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[array[i], array[j]] = [array[j], array[i]]
}
}
function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}
function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
