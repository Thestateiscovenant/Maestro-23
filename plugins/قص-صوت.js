import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تحديد dirname في بيئة ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, text }) => {

    let q = m.quoted || m;
    let mime = (q.msg || q).mimetype || '';

    if (!m.quoted) return conn.reply(m.chat, 'حدد الملف أولاً.', m);

    let [inTime, toTime] = text.split('-');

    // التحقق من صحة الأوقات المدخلة
    if (!inTime || !toTime || isNaN(inTime) || isNaN(toTime)) {
        return conn.reply(m.chat, 'حدد الأوقات بشكل صحيح باستخدام صيغة (من-إلى) بالأرقام مثل: 15-20', m);
    }

    if (!/audio/.test(mime)) return conn.reply(m.chat, 'حدد ملف صوت فقط', m);

    let media = await q.download?.();

    if (!media) throw 'خطأ في تحميل الملف.';

    // قم بحفظ الملف الصوتي مؤقتاً
    let inputFilePath = path.join(__dirname, 'input-audio.mp3');
    let outputFilePath = path.join(__dirname, 'output-audio.mp3');
    
    fs.writeFileSync(inputFilePath, media);

    // حساب المدة الزمنية للقص
    let duration = toTime - inTime;

    // إعلام المستخدم ببدء عملية القص
    await conn.reply(m.chat, 'بدأت عملية قص المقطع...', m);

    // استخدم ffmpeg لقص الصوت
    ffmpeg(inputFilePath)
        .setStartTime(inTime) // الوقت الذي يبدأ منه القص
        .setDuration(duration) // المدة المراد قصها
        .output(outputFilePath)
        .on('progress', (progress) => {
            // إعلام المستخدم بتقدم العملية
            conn.reply(m.chat, `جاري معالجة المقطع... ${Math.round(progress.percent)}%`, m);
        })
        .on('end', async () => {
            // إعلام المستخدم بانتهاء العملية
            conn.reply(m.chat, 'تم قص المقطع بنجاح! يتم الآن إرساله...', m);

            // تحميل المقطع الذي تم قصه وإرساله
            let clippedAudio = fs.readFileSync(outputFilePath);
            
            await conn.sendMessage(m.chat, {audio: clippedAudio, mimetype: 'audio/mpeg', fileName: 'output-audio.mp3'}, {quoted: m});
            
           // await conn.sendFile(m.chat, clippedAudio, 'output-audio.mp3', 'تم قص المقطع بنجاح!', m);

            // حذف الملفات المؤقتة
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
        })
        .on('error', (err) => {
            console.error(err);
            conn.reply(m.chat, 'حدث خطأ أثناء قص الملف الصوتي.', m);
        })
        .run();
};

// تعديل الأمر ليصبح "مقطع"
handler.command = /^(مقطع)$/i;

export default handler;
