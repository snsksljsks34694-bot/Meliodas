const config = require('../config');
const logger = require('../utils/console');
const { loadPlugins } = require('./plugins');
const crypto = require('crypto');

async function handleMessages(sock, { messages }) {
    if (!messages || !messages.length) return;

    const msg = messages[0];

    try {
        const messageText =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            '';

        if (!messageText) return;

        // خصائص الرسالة
        msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
        msg.sender = msg.key.participant || msg.key.remoteJid;
        msg.chat = msg.key.remoteJid;

        // رد سريع
        msg.reply = async (text) => {
            try {
                await sock.sendMessage(msg.chat, { text }, { quoted: msg });
            } catch (e) {
                logger.error('خطأ في إرسال الرد:', e);
            }
        };

        const plugins = await loadPlugins();
        const isCommand = messageText.startsWith(config.prefix);

        // ────────────────
        // 🟢 رسالة عادية → all
        if (!isCommand) {
            for (const plugin of Object.values(plugins)) {
                if (typeof plugin.all === 'function') {
                    await plugin.all(sock, msg);
                }
            }
            return;
        }

        // ────────────────
        // 🔵 أمر
        const args = messageText
            .slice(config.prefix.length)
            .trim()
            .split(/\s+/);

        const command = args.shift()?.toLowerCase();
        if (!command) return;

        const plugin = plugins[command];

        if (!plugin) {
            logger.warn(`أمر غير معروف: ${command}`);
            return;
        }

        logger.info(`تنفيذ الأمر: ${command} من ${msg.sender}`);

        if (typeof plugin.execute === 'function') {
            await plugin.execute(sock, msg, args);
        } else if (typeof plugin === 'function') {
            await plugin(sock, msg, args);
        } else {
            throw new Error('البلجن لا يحتوي على execute أو all');
        }

    } catch (error) {
        logger.error('خطأ في معالجة الرسالة:', error);
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: config.messages.error
            }, { quoted: msg });
        } catch {}
    }
}

module.exports = {
    handleMessages
};