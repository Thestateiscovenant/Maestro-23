let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let too = `[❗] افصل النص يحب بـ *+*\n\n *مـثــال* :\n*${usedPrefix + command}* زورو معانا+زورو ضايع`

  if (!text) throw too
  if (!text.includes('+')) throw too  
  let [a, b] = text.split`+`   
  let lr = (`https://api.popcat.xyz/pooh?text1=${a}&text2=${b}`)
  conn.sendFile(m.chat, lr, 'drake.png', `تم بواسطه ✅
  المصعبي⚡`, m)
}
handler.help = ['drake']
handler.tags = ['maker']
handler.command = ['2ميم','بوه']

export default handler
