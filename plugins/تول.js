import fetch from "node-fetch";
import translate from '@vitalets/google-translate-api';

const handler = async (m, {conn, text, usedPrefix, command}) => {

  let into;

    if (text) {
        into = text;
    } else if (m.quoted) {
        into = m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
    } else {
        throw '*`❲ ❗ ❳ يرجى إدخال نص سؤالك.`*';
    }
  
  m.reply('*`❲ 👊🏻 ❳ استني افكر شوية .`*');
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
  
  try {
    
conn.sendPresenceUpdate('composing', m.chat);

const lang1 = 'ar';
const lang2 = 'en';

//const tren = await translate(into, {to: lang2, autoCorrect: true});
//tren.text

let result = await ToolbotAI(into);

await conn.sendMessage(m.chat, { react: { text: '💡', key: m.key } });


const trar = await translate(result.result, {to: lang1, autoCorrect: true});

await conn.sendMessage(m.chat, { react: { text: '👊🏻', key: m.key } });

m.reply(trar.text);

  } catch (e) {
  await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
  
    m.reply(e);
  }
};

handler.command = ['تول'];
export default handler;

async function ToolbotAI(desire) {
  try {
    const data = await fetchData("https://www.toolbot.ai/api/generate", {
        desire: desire
      }),
      {
        description,
        prompt
      } = data.result[0];
      
    return await fetchData("https://www.toolbot.ai/api/query", {
      toolDescription: description,
      query: prompt
    });
    
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

async function fetchData(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    return await response.json();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
