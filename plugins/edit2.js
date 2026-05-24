const fs = require('fs');
const { join } = require('path');
const { isElite } = require('../haykala/elite.js');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const zarfPath = join(process.cwd(), 'zarf2.json');
const imagePath = join(process.cwd(), 'image2.jpeg');
const audioPath = join(process.cwd(), 'sounds', 'AUDIO2.mp3');
const stickerDir = join(process.cwd(), 'stickers');

module.exports = {
    command: 'e',
    description: 'تعديل إعدادات الزرف عبر الرد على الرسالة',
    category: 'tools',
    usage: '.edit2 [اسم|وصف|منشن|رسالة|رياكت|صورة|صوت|استيكر] [شغل|طفي]',

    async execute(sock, msg) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNum = sender.split('@')[0];

        if (!isElite(senderNum)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '❌ هذا الأمر مخصص للنخبة فقط.'
            }, { quoted: msg });
        }

        const zarfData = fs.existsSync(zarfPath)
            ? JSON.parse(fs.readFileSync(zarfPath))
            : {};

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const args = text.trim().split(/\s+/);

        const type = args[1]?.toLowerCase();
        const toggle = args[2]?.toLowerCase();

        const reply = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const sendHelp = () => sock.sendMessage(msg.key.remoteJid, {
            text: `شرح الاستخدام:
.edit2 اسم ← لتعديل الاسم الجديد
.edit2 وصف ← لتعديل الوصف
.edit2 رسالة ← لتعديل الرسالة النهائية
.edit2 منشن ← لتعديل رسالة المنشن
.edit2 رياكت ← لتعديل التفاعل
.edit2 صورة ← لتحديث صورة الزرف (رد على صورة)
.edit2 صوت ← لتحديث ملف الصوت (رد على رسالة صوتية أو ملف صوتي)
.edit2 استيكر ← لحفظ استيكر (رد على استيكر)
.edit2 [نوع] شغل/طفي ← لتشغيل أو تعطيل نوع معين

يجب استخدام الأمر بالرد على الرسالة المناسبة.`,
        }, { quoted: msg });

        const setStatus = (section, value) => {
            if (['شغل', 'طفي'].includes(value)) {
                const status = value === 'شغل' ? 'on' : 'off';
                zarfData[section] = zarfData[section] || {};
                zarfData[section].status = status;
                fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                return sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ تم ${status === 'on' ? 'تشغيل' : 'إيقاف'} قسم ${type}.`
                }, { quoted: msg });
            }
            return false;
        };

        if (!type) return sendHelp();

        try {
            switch (type) {
                case 'اسم':
                    if (setStatus('group', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.group = zarfData.group || {};
                        zarfData.group.newSubject = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تعديل الاسم.' }, { quoted: msg });
                    }
                    break;

                case 'وصف':
                    if (setStatus('group', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.group = zarfData.group || {};
                        zarfData.group.newDescription = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تعديل الوصف.' }, { quoted: msg });
                    }
                    break;

                case 'منشن':
                    if (setStatus('messages', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.messages = zarfData.messages || {};
                        zarfData.messages.mention = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تعديل رسالة المنشن.' }, { quoted: msg });
                    }
                    break;

                case 'رسالة':
                    if (setStatus('messages', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.messages = zarfData.messages || {};
                        zarfData.messages.final = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تعديل الرسالة النهائية.' }, { quoted: msg });
                    }
                    break;

                case 'رياكت':
                    if (setStatus('reaction', toggle)) return;
                    if (reply?.conversation) {
                        zarfData.reaction = reply.conversation;
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تعديل التفاعل.' }, { quoted: msg });
                    }
                    break;

                case 'صورة':
                    if (setStatus('media', toggle)) return;
                    const imageMessage = reply?.imageMessage;
                    if (imageMessage) {
                        const buffer = await downloadMediaMessage(
                            { message: { imageMessage } },
                            'buffer',
                            {},
                            { reuploadRequest: sock.updateMediaMessage }
                        );
                        fs.writeFileSync(imagePath, buffer);
                        zarfData.media = zarfData.media || {};
                        zarfData.media.image = 'image2.jpeg';
                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تحديث صورة الزرف.' }, { quoted: msg });
                    }
                    break;

                case 'صوت':
                    if (setStatus('audio', toggle)) return;

                    if (!reply) {
                        return sock.sendMessage(msg.key.remoteJid, { text: '❌ يرجى الرد على رسالة صوتية أو ملف صوتي لتحديث الصوت.' }, { quoted: msg });
                    }

                    const audioMsg = reply.audioMessage || reply.documentMessage;
                    if (!audioMsg) {
                        return sock.sendMessage(msg.key.remoteJid, { text: '❌ يرجى الرد على رسالة صوتية أو ملف صوتي لتحديث الصوت.' }, { quoted: msg });
                    }

                    const audioBuffer = await downloadMediaMessage(
                        { message: reply },
                        'buffer',
                        {},
                        { reuploadRequest: sock.updateMediaMessage }
                    );

                    fs.mkdirSync(join(process.cwd(), 'sounds'), { recursive: true });
                    fs.writeFileSync(audioPath, audioBuffer);

                    zarfData.audio = zarfData.audio || {};
                    zarfData.audio.file = 'sounds/AUDIO2.mp3';
                    if (!zarfData.audio.status) zarfData.audio.status = 'on';

                    fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                    return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم تحديث ملف الصوت.' }, { quoted: msg });

                case 'استيكر':
                    if (setStatus('sticker', toggle)) return;

                    const stickerMessage = reply?.stickerMessage;
                    if (stickerMessage) {
                        const buffer = await downloadMediaMessage(
                            { message: { stickerMessage } },
                            'buffer',
                            {},
                            { reuploadRequest: sock.updateMediaMessage }
                        );

                        fs.mkdirSync(stickerDir, { recursive: true });
                        const stickerFile = join(stickerDir, 'STICKER2.webp');
                        fs.writeFileSync(stickerFile, buffer);

                        zarfData.sticker = zarfData.sticker || {};
                        zarfData.sticker.file = 'stickers/STICKER2.webp';
                        if (!zarfData.sticker.status) zarfData.sticker.status = 'on';

                        fs.writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
                        return sock.sendMessage(msg.key.remoteJid, { text: '✅ تم حفظ الاستيكر.' }, { quoted: msg });
                    } else {
                        return sock.sendMessage(msg.key.remoteJid, { text: '❌ يرجى الرد على استيكر لحفظه.' }, { quoted: msg });
                    }

                default:
                    return sendHelp();
            }

            return sendHelp();
        } catch (err) {
            console.error('✗ خطأ في أمر edit:', err);
            return sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ:\n\n${err.message || err.toString()}`
            }, { quoted: msg });
        }
    }
};