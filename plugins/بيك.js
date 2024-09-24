import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'  // لتحويل import.meta.url إلى مسار فعلي

// استخراج مسار الملف الحالي
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { text, conn, usedPrefix, command }) => {
    if (!text || typeof text !== 'string') {
        throw `*[❗] الرجاء إدخال اسم الصورة التي تريد البحث عنها.*`
    }

    try {
        // عرض رسالة تفيد بأن البحث جارٍ
        await conn.reply(m.chat, '*[🔍] جارٍ البحث عن الصورة...*', m)

        // جلب الصورة من بحث جوجل
        const res = await googleImage(text)
        let image = res.getRandom()

        if (!image) {
            throw `*[❗] لم يتم العثور على صورة لمصطلح البحث المطلوب.*`
        }

        // استخراج اسم الصورة الافتراضي من النص المدخل
        const imageName = `${text.replace(/\s+/g, '_')}.jpg`

        // استخراج الموقع من الرابط (المجال الأساسي)
        const imageUrl = new URL(image)
        const website = imageUrl.hostname

        // تنزيل الصورة على الجهاز مؤقتًا
        const response = await fetch(image)
        const buffer = await response.buffer()
        const tempFilePath = path.join(__dirname, imageName)
        fs.writeFileSync(tempFilePath, buffer)

        // استخدام مكتبة sharp للحصول على معلومات الصورة
        const imageInfo = await sharp(tempFilePath).metadata()

        // إرسال معلومات الصورة
        let caption = `*تفضل طلبك يا صديقي*\n\n`
        caption += `*اسم الصورة:* ${imageName}\n`
        caption += `*أبعاد الصورة:* ${imageInfo.width}x${imageInfo.height}\n`
        caption += `*صيغة الصورة:* ${imageInfo.format}\n`
        caption += `*حجم الملف:* ${Math.round(buffer.length / 1024)} KB\n`
        caption += `*الموقع:* ${website}\n`

        // إرسال الصورة مع الأزرار
        await conn.sendButton(m.chat, caption, wm, image, [['التالي', `${usedPrefix + command} ${text}`]], null, [['الموقع', image, image]], m)

        // حذف الصورة المؤقتة بعد الاستخدام
        fs.unlinkSync(tempFilePath)

    } catch (error) {
        // التعامل مع الأخطاء وإرسال رسالة توضيحية
        await conn.reply(m.chat, `*[❗] حدث خطأ أثناء البحث عن الصورة أو جلب المعلومات:*\n${error}`, m)
    }
}

handler.command = ['بيك']
export default handler
