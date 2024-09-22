import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command, text }) => {

    if (text) {
        if (text.length <= 3) {
            await m.reply('⚠️ الرجاء كتابة الكلمة بشكل صحيح.');
            return;
        }
    } else {
        await m.reply('⚠️ قم بكتابة اسم الحديث للبحث أولاً.');
        return;
    }

    try {
        let Hadith = await searchHadith(text);

        if (!Hadith) {
            await m.reply('⚠️ لم يتم العثور على نتائج. الرجاء التحقق من الكلمة.');
        } else {
            await m.reply(Hadith);
        }

    } catch (e) {
        await m.reply(`❌ حدث خطأ أثناء البحث: ${e.message}`);
    }
};

handler.command = ['حديث'];

export default handler;

async function searchHadith(text) {
    try {
        let response = await fetch(`https://dorar.net/dorar_api.json?skey=${text}`, { method: 'GET' });

        if (!response.ok) {
            throw new Error('لم يتم العثور على الحديث.');
        }

        let data = await response.json();

        if (!data?.ahadith?.result) {
            throw new Error('البيانات المستلمة غير صحيحة.');
        }

        // إزالة الوسوم باستخدام تعبير منتظم بسيط
        let Hadith = data.ahadith.result.replace(/<\/?[^>]+(>|$)/g, '');

        // تقسيم النص إذا كان يحتوي على المزيد
        Hadith = Hadith.split('\n\n\nالمزيد')[0]?.split('\n\nالمزيد')[0];

        return Hadith;
    } catch (error) {
        console.log('Error fetching hadith:', error);
        return null;
    }
}
