import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// تحديد dirname في بيئة ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قائمة المؤثرات الصوتية المتاحة
const effects = {
    'طبيعي': [], // المؤثر الطبيعي: لا تأثيرات
    'صدى': ['-af', 'aecho=0.8:0.9:1000:0.3'],
    'تسريع': ['-filter:a', 'atempo=1.5'],
    'إبطاء': ['-filter:a', 'atempo=0.8'],
    'تردد': ['-af', 'areverb'],
    'عكس': ['-filter_complex', 'areverse'],
    'تضخيم': ['-filter:a', 'volume=1.5'],
    'خفض الصوت': ['-filter:a', 'volume=0.5'],
    'تردد مرتفع': ['-filter:a', 'asetrate=44100*1.5,aresample=44100'],
    'تردد منخفض': ['-filter:a', 'asetrate=44100*0.75,aresample=44100'],
    'الدبة': ['-af', 'bass=g=20'], // مؤثر الدبة باستخدام bass لتضخيم الترددات المنخفضة
    'عزل الموسيقى': ['-af', 'highpass=f=300, lowpass=f=3000'] // مؤثر لعزل الموسيقى باستخدام highpass و lowpass
};

let handler = async (m, { conn, text }) => {
    let q = m.quoted || m;
    let mime = (q.msg || q).mimetype || '';

    if (!m.quoted) return conn.reply(m.chat, 'حدد الملف أولاً.', m);

    let effectInput = text.trim();

    // التحقق من صحة المؤثر المدخل
    if (!effects[effectInput] && effectInput !== 'طبيعي') {
        return conn.reply(m.chat, 'مؤثر غير صالح. اختر مؤثرًا من القائمة.', m);
    }

    if (!/audio/.test(mime)) return conn.reply(m.chat, 'حدد ملف صوت فقط', m);

    let media = await q.download?.();

    if (!media) throw 'خطأ في تحميل الملف.';

    // قم بحفظ الملف الصوتي مؤقتاً
    let inputFilePath = path.join(__dirname, 'input-audio.mp3');
    let outputFilePath = path.join(__dirname, 'output-audio.mp3');
    
    fs.writeFileSync(inputFilePath, media);

    // اختيار المؤثر الطبيعي في حال لم يتم اختيار أي مؤثر
    let effect = effects[effectInput] || effects['طبيعي'];

    // إعلام المستخدم ببدء العملية
    await conn.reply(m.chat, `بدأت عملية تطبيق المؤثر "${effectInput || 'طبيعي'}"...`, m);

    // استخدم ffmpeg لتطبيق المؤثر
    ffmpeg(inputFilePath)
        .outputOptions(effect) // تطبيق المؤثر المختار
        .output(outputFilePath)
        .on('progress', (progress) => {
            // إعلام المستخدم بتقدم العملية
            conn.reply(m.chat, `جاري معالجة الملف... ${Math.round(progress.percent)}%`, m);
        })
        .on('end', async () => {
            // إعلام المستخدم بانتهاء العملية
            conn.reply(m.chat, 'تم تطبيق المؤثر بنجاح! يتم الآن إرساله...', m);

            // تحميل الملف المعدل وإرساله
            let modifiedAudio = fs.readFileSync(outputFilePath);
            
            await conn.sendMessage(m.chat, {audio: modifiedAudio, mimetype: 'audio/mpeg', fileName: 'output-audio.mp3'}, {quoted: m});

            // حذف الملفات المؤقتة
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
        })
        .on('error', (err) => {
            console.error(err);
            conn.reply(m.chat, 'حدث خطأ أثناء تطبيق المؤثر.', m);
        })
        .run();
};

// تعديل الأمر ليصبح "تأثير"
handler.command = /^(تاثير)$/i;

export default handler;
