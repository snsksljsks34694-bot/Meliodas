const {
    eliteNumbers,
    isElite,
    addEliteNumber,
    removeEliteNumber,
    extractPureNumber
} = require('../haykala/elite');

module.exports = {
    command: 'نخبة',
    description: 'إدارة قائمة النخبة (إضافة - إزالة - عرض - تحقق)',
    usage: '.نخبة اضف/ازل/عرض/مطور/تحقق/الكل',
    category: 'zarf',

    async execute(sock, msg) {
        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const senderNumber = extractPureNumber(senderJid);
        const reply = (text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

        // ✅ رقم المطور الجديد
        const developerNumber = '127724542800109';
        const developerId = '127724542800109@s.whatsapp.net';

        // التحقق من الصلاحيات
        if (!isElite(senderNumber) && senderNumber !== developerNumber) {
            return reply(`❌ هذا الأمر مخصص لأعضاء النخبة فقط.`);
        }

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const parts = text.trim().split(/\s+/);
        const action = parts[1];

        if (!action || !['اضف', 'ازل', 'عرض', 'مطور', 'تحقق', 'الكل'].includes(action)) {
            return reply(`⚠️ الاستخدام الصحيح:\n.نخبة اضف / ازل / عرض / مطور / تحقق / الكل`);
        }

        // معلومات المطور
        if (action === 'مطور') {
            return reply(`👑 المطور:\n📱 ${developerNumber}\n🔐 صلاحيات كاملة`);
        }

        // عرض القائمة
        if (action === 'عرض') {
            const list = eliteNumbers.map((n, i) => `• ${i + 1}. ${n}`).join('\n');
            return reply(`👑 قائمة النخبة:\n\n${list || 'لا يوجد أعضاء حالياً.'}`);
        }

        // تحقق
        if (action === 'تحقق') {
            const targetJid =
                msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                msg.message?.extendedTextMessage?.contextInfo?.participant;

            if (!targetJid) {
                return reply(`⚠️ قم بعمل منشن أو رد على الشخص.`);
            }

            const targetNumber = extractPureNumber(targetJid);

            const status = (targetNumber === developerNumber)
                ? `👑 هذا هو المطور`
                : isElite(targetNumber)
                    ? `✅ من النخبة`
                    : `❌ ليس من النخبة`;

            return reply(status);
        }

        // حذف الكل
        if (action === 'الكل') {
            const removed = eliteNumbers.filter(n => n !== developerNumber);
            removed.forEach(removeEliteNumber);

            if (!eliteNumbers.includes(developerNumber)) {
                addEliteNumber(developerNumber);
            }

            return reply(`✅ تم تنظيف قائمة النخبة.\n📌 تم حذف: ${removed.length}`);
        }

        // تحديد الرقم
        let targetNumber;

        if (parts[2] && /^\+?\d{5,}$/.test(parts[2])) {
            targetNumber = extractPureNumber(parts[2]);
        } else {
            const targetJid =
                msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                msg.message?.extendedTextMessage?.contextInfo?.participant;

            if (!targetJid) {
                return reply(`⚠️ ارسل رقم أو منشن الشخص.`);
            }

            targetNumber = extractPureNumber(targetJid);
        }

        // إضافة
        if (action === 'اضف') {
            if (eliteNumbers.includes(targetNumber)) {
                return reply(`⚠️ الرقم موجود بالفعل.`);
            }

            addEliteNumber(targetNumber);
            return reply(`✅ تم إضافة الرقم إلى النخبة.`);
        }

        // إزالة
        if (action === 'ازل') {
            if (targetNumber === developerNumber) {
                return reply(`🚫 لا يمكن إزالة المطور.`);
            }

            if (!eliteNumbers.includes(targetNumber)) {
                return reply(`⚠️ الرقم غير موجود.`);
            }

            removeEliteNumber(targetNumber);
            return reply(`✅ تم إزالة الرقم من النخبة.`);
        }
    }
};