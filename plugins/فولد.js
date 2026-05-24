const fs = require('fs');
const { join } = require('path');

const baseDir = join('tmp', 'forms'); // مكان حفظ الاستمارات

module.exports = {
    command: 'فولد',
    description: 'حفظ واسترجاع ومسح استمارات النصوص',
    usage: '.فولد [حفظ|اسم الاستمارة|حذف|حافظة] [اسم]',
    
    async execute(sock, msg) {
        try {
            const chatId = msg.key.remoteJid;
            const body =
                msg.message?.extendedTextMessage?.text ||
                msg.message?.conversation ||
                '';

            const args = body.trim().split(/\s+/);

            const action = args[1];                 // الكلمة الأولى بعد فولد
            const fullName = args.slice(1).join(' ').trim(); // الاسم كامل (كلمة أو أكثر)
            const name = args.slice(2).join(' ').trim();     // اسم بعد حفظ / حذف

            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }

            // ============ حفظ الاستمارة ============
            if (action === 'حفظ') {
                if (!name) {
                    return await sock.sendMessage(chatId, {
                        text: '*◞❗┆اكتب اسم الاستمارة للحفظ*'
                    }, { quoted: msg });
                }

                const formPath = join(baseDir, `${name}.json`);

                if (fs.existsSync(formPath)) {
                    return await sock.sendMessage(chatId, {
                        text: `*◞❗┆الاستمارة "${name}" موجودة بالفعل*`
                    }, { quoted: msg });
                }

                const quoted =
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

                const text =
                    quoted?.conversation ||
                    quoted?.extendedTextMessage?.text;

                if (!text) {
                    return await sock.sendMessage(chatId, {
                        text: '*◞❗┆قم بالرد على رسالة نصية فقط لحفظها*'
                    }, { quoted: msg });
                }

                fs.writeFileSync(
                    formPath,
                    JSON.stringify({ text }, null, 2)
                );

                return await sock.sendMessage(chatId, {
                    text: `*◞✅┆تم حفظ الاستمارة باسم "${name}"*`
                }, { quoted: msg });
            }

            // ============ استرجاع الاستمارة ============
            if (action && !['حفظ', 'حذف', 'حافظة'].includes(action)) {
                const formPath = join(baseDir, `${fullName}.json`);

                if (!fs.existsSync(formPath)) {
                    return await sock.sendMessage(chatId, {
                        text: `*◞❗┆الاستمارة "${fullName}" غير موجودة*`
                    }, { quoted: msg });
                }

                const data = JSON.parse(fs.readFileSync(formPath));
                return await sock.sendMessage(chatId, {
                    text: data.text
                }, { quoted: msg });
            }

            // ============ حذف الاستمارة ============
            if (action === 'حذف') {
                if (!name) {
                    return await sock.sendMessage(chatId, {
                        text: '*◞❗┆اكتب اسم الاستمارة للحذف*'
                    }, { quoted: msg });
                }

                const formPath = join(baseDir, `${name}.json`);

                if (!fs.existsSync(formPath)) {
                    return await sock.sendMessage(chatId, {
                        text: `*◞❗┆الاستمارة "${name}" غير موجودة*`
                    }, { quoted: msg });
                }

                fs.unlinkSync(formPath);

                return await sock.sendMessage(chatId, {
                    text: `*◞✅┆تم حذف الاستمارة "${name}"*`
                }, { quoted: msg });
            }

            // ============ قائمة الاستمارات ============
            if (action === 'حافظة') {
                const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));

                if (!files.length) {
                    return await sock.sendMessage(chatId, {
                        text: '*◞‼️┆لا توجد استمارات محفوظة*'
                    }, { quoted: msg });
                }

                let reply = '*◞📁┆الاستمارات المحفوظة:*\n';
                files.forEach((f, i) => {
                    reply += `${i + 1}. ${f.replace('.json', '')}\n`;
                });

                return await sock.sendMessage(chatId, {
                    text: reply
                }, { quoted: msg });
            }

            // ============ أمر غير معروف ============
            return await sock.sendMessage(chatId, {
                text:
                    '*◞❗┆أمر غير معروف*\n\n' +
                    '.فولد حفظ اسم (رد على رسالة)\n' +
                    '.فولد اسم_الاستمارة\n' +
                    '.فولد حذف اسم\n' +
                    '.فولد حافظة'
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ خطأ في أمر فولد:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `*◞❌┆حدث خطأ: ${err.message || err}*`
            }, { quoted: msg });
        }
    }
};