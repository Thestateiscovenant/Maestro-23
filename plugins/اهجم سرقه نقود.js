let ro = 3000;
let maxRobAmount = 1000; // الحد الأقصى للسرقة في محاولة واحدة

let handler = async (m, { conn, usedPrefix, command }) => {
    let now = new Date();
    let lastRob = global.db.data.users[m.sender].lastrob || 0;
    let timeSinceLastRob = now - lastRob;
    let cooldown = 7200000; // 2 ساعات بالميلي ثانية

    if (timeSinceLastRob < cooldown) {
        let remainingTime = cooldown - timeSinceLastRob;
        throw `⏳ مهلا، يجب عليك الانتظار ${msToTime(remainingTime)} قبل أن تتمكن من السرقة مرة أخرى.`;
    }

    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    } else {
        throw `[❗] يجب أن يتم استخدام هذا الأمر في مجموعة.`;
    }

    if (!who) {
        throw `[❗] يجب عليك ذكر الشخص الذي تريد سرقته.`;
    }

    if (!(who in global.db.data.users)) {
        throw `[❗] المستخدم الذي تحاول سرقته غير موجود في قاعدة البيانات.`;
    }

    let users = global.db.data.users[who];
    let robAmount = Math.floor(Math.random() * Math.min(ro, maxRobAmount));

    if (users.exp < robAmount) {
        return m.reply(`😔 عذرًا، @${who.split('@')[0]} لا يمتلك كمية كافية من XP. حاول سرقة شخص آخر.`, null, { mentions: [who] });
    }

    global.db.data.users[m.sender].exp += robAmount;
    global.db.data.users[who].exp -= robAmount;
    global.db.data.users[m.sender].lastrob = now.getTime();

    m.reply(`💸 *نجحت في سرقة ${robAmount} XP من @${who.split('@')[0]}! 😎*`, null, { mentions: [who] });

    // Optional: Log the robbery action
    if (!global.db.data.logs) global.db.data.logs = [];
    global.db.data.logs.push({
        type: 'rob',
        from: m.sender,
        to: who,
        amount: robAmount,
        timestamp: now.getTime()
    });
}

handler.help = [''];
handler.tags = ['اقتصاد'];
handler.command = ['اهجم', ''];

export default handler;

function msToTime(duration) {
    let milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return `${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
}
