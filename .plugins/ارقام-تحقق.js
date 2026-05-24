const { extractJid } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'ارقام',
    category: 'tools',

    async execute(sock, msg, args) {
        try {
            // جلب النص كامل من الرسالة (يدعم القوائم)
            const text =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                '';

            if (!text) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '❗ ارسل الأرقام بهذا الشكل:\n.ارقام\n+9665xxxxxxx\n+9665xxxxxxx'
                });
            }

            // استخراج كل الأرقام التي تبدأ بـ +
            const numbers = text.match(/\+\d+/g);

            if (!numbers || numbers.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '❗ ما لقيت أرقام بصيغة صحيحة (لازم تبدأ بـ +)'
                });
            }

            let valid = [];
            let invalid = [];

            for (let num of numbers) {
                try {
                    const jid = num.replace('+', '') + '@s.whatsapp.net';

                    const [result] = await sock.onWhatsApp(jid);

                    if (result?.exists) {
                        valid.push(num);
                    } else {
                        invalid.push(num);
                    }
                } catch {
                    invalid.push(num);
                }
            }

            let reply = `📊 نتيجة التحقق:\n\n`;

            reply += `✅ مسجلة في واتساب:\n`;
            reply += valid.length ? valid.join('\n') : 'لا يوجد';

            reply += `\n\n❌ غير مسجلة:\n`;
            reply += invalid.length ? invalid.join('\n') : 'لا يوجد';

            await sock.sendMessage(msg.key.remoteJid, { text: reply });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ حصل خطأ أثناء التحقق'
            });
        }
    }
};
