const fs = require('fs');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');
const { eliteNumbers } = require('../haykala/elite.js');

const decodeJid = (jid) => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'تغيرامر',
    description: 'تغيير اسم الأمر عن طريق اختيار رقم من القائمة',
    usage: '.تغيرامر <رقم الملف> <الأمر الجديد>',
    category: 'dev',

    async execute(sock, msg, args) {
        try {
            if (!msg?.key) {
                console.error('❌ رسالة غير صالحة: لا يوجد msg.key');
                return;
            }

            const groupJid = msg.key.remoteJid;
            const sender = decodeJid(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];

            if (!Array.isArray(eliteNumbers)) {
                console.error('❌ eliteNumbers ليس مصفوفة');
                return await sock.sendMessage(groupJid, { 
                    text: '❌ خطأ في نظام الصلاحيات' 
                }, { quoted: msg });
            }

            if (!eliteNumbers.includes(senderLid)) {
                return await sock.sendMessage(groupJid, { 
                    text: '❗ لا تملك صلاحية استخدام هذا الأمر.' 
                }, { quoted: msg });
            }

            const pluginsDir = join(process.cwd(), 'plugins');

            if (!fs.existsSync(pluginsDir)) {
                return await sock.sendMessage(groupJid, { 
                    text: '❌ مجلد plugins غير موجود في المسار الرئيسي للبوت.'
                }, { quoted: msg });
            }

            let pluginFiles;
            try {
                pluginFiles = fs.readdirSync(pluginsDir)
                    .filter(file => file.endsWith('.js') && !file.startsWith('.'))
                    .sort((a, b) => a.localeCompare(b));

                if (pluginFiles.length === 0) {
                    return await sock.sendMessage(groupJid, { 
                        text: '❌ لا توجد ملفات أوامر صالحة في مجلد plugins.'
                    }, { quoted: msg });
                }
            } catch (e) {
                console.error('❌ خطأ في قراءة المجلد:', e);
                return await sock.sendMessage(groupJid, { 
                    text: `❌ فشل في قراءة مجلد plugins: ${e.message}`
                }, { quoted: msg });
            }

            if (!args?.length) {
                const listText = await this.generatePluginList(pluginsDir, pluginFiles);
                return await sock.sendMessage(groupJid, { text: listText }, { quoted: msg });
            }

            if (args.length < 2) {
                return await sock.sendMessage(groupJid, { 
                    text: '❗ الصيغة غير صحيحة. استخدم:\n.تغيرامر <رقم الملف> <الأمر الجديد>\nمثال: .تغيرامر 2 سلام'
                }, { quoted: msg });
            }

            const [fileIndex, newCommand] = this.validateInput(args, pluginFiles);
            if (!fileIndex) {
                return await sock.sendMessage(groupJid, { 
                    text: `❗ يجب أن يكون الرقم بين 1 و ${pluginFiles.length}`
                }, { quoted: msg });
            }

            await this.processSelectedFile(sock, groupJid, msg, pluginsDir, pluginFiles, fileIndex, newCommand);

        } catch (error) {
            console.error('❌ خطأ رئيسي:', error);
            if (msg.key?.remoteJid) {
                await sock.sendMessage(msg.key.remoteJid, { 
                    text: `❌ حدث خطأ غير متوقع:\n${error.message}`
                }, { quoted: msg });
            }
        }
    },

    async generatePluginList(pluginsDir, pluginFiles) {
        let listText = '📋 قائمة الأوامر المتاحة:\n\n';

        for (const [index, file] of pluginFiles.entries()) {
            try {
                const filePath = join(pluginsDir, file);
                delete require.cache[require.resolve(filePath)];
                const { command } = require(filePath);

                listText += `${index + 1}. ${file} (${command || '❌ لا يوجد أمر'})\n`;
            } catch (e) {
                console.error(`❌ خطأ في قراءة ${file}:`, e);
                listText += `${index + 1}. ${file} (❌ خطأ في التحميل)\n`;
            }
        }

        return listText + '\nاستخدم: .تغيرامر <الرقم> <الأمر الجديد>';
    },

    validateInput(args, pluginFiles) {
        const fileIndex = parseInt(args[0]);
        const newCommand = args[1];

        if (isNaN(fileIndex)) return [null, newCommand];
        if (fileIndex < 1 || fileIndex > pluginFiles.length) return [null, newCommand];

        return [fileIndex, newCommand];
    },

    async processSelectedFile(sock, groupJid, msg, pluginsDir, pluginFiles, fileIndex, newCommand) {
        const selectedFile = pluginFiles[fileIndex - 1];
        const filePath = join(pluginsDir, selectedFile);

        try {
            if (!fs.existsSync(filePath)) {
                return await sock.sendMessage(groupJid, { 
                    text: `❌ الملف ${selectedFile} غير موجود`
                }, { quoted: msg });
            }

            let fileContent = fs.readFileSync(filePath, 'utf8');
            const commandRegex = /command:\s*['"`](.*?)['"`]/;

            if (!commandRegex.test(fileContent)) {
                return await sock.sendMessage(groupJid, { 
                    text: '❌ لم يتم العثور على تعريف command في الملف.\nيجب أن يحتوي على:\ncommand: \'أمرك\''
                }, { quoted: msg });
            }

            const oldCommand = commandRegex.exec(fileContent)[1];
            const updatedContent = fileContent.replace(
                commandRegex,
                `command: '${newCommand.replace(/'/g, "\\'")}'`
            );

            fs.writeFileSync(filePath, updatedContent, 'utf8');

            await sock.sendMessage(groupJid, { 
                text: `✅ تم التغيير بنجاح:\n📁 الملف: ${selectedFile}\n🔄 من: ${oldCommand}\n⚡ إلى: ${newCommand}\n\n❗ قد تحتاج لإعادة تشغيل البوت لتفعيل التغيير`
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ في معالجة الملف:', error);
            await sock.sendMessage(groupJid, { 
                text: `❌ فشل في تعديل الملف:\n${error.message}\n\nتأكد من:\n1. أن الملف ليس محميًا\n2. أن الصيغة صحيحة\n3. أن لديك صلاحيات الكتابة`
            }, { quoted: msg });
        }
    }
};