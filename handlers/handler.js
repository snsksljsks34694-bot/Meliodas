const { loadPlugins } = require('./plugins');
const config = require('../config');
const logger = require('../utils/console');
const fs = require('fs-extra');
const path = require('path');
const { isElite } = require('../haykala/elite');
const { playSound } = require('../main');

const messageCounter = require('./messageCounter');

const commands = new Map();

// 🔒 حماية من التكرار
const executedMessages = new Map();
const MESSAGE_CACHE_DURATION = 5 * 60 * 1000;

function addExecutedMessage(id) {
    executedMessages.set(id, Date.now());
    const now = Date.now();
    for (const [key, time] of executedMessages.entries()) {
        if (now - time > MESSAGE_CACHE_DURATION) {
            executedMessages.delete(key);
        }
    }
}

// 🔥 كاش البلجنز
let pluginsCache = null;
async function getPlugins() {
    if (!pluginsCache) {
        pluginsCache = await loadPlugins();
        logger.info('✅ تم تحميل البلجنز بنجاح');
    }
    return pluginsCache;
}

function cmd(options = {}) {
    if (!options.name || !options.exec) {
        throw new Error('يجب تحديد اسم الأمر ودالة التنفيذ');
    }

    commands.set(options.name.toLowerCase(), options);
    logger.info(`تم تسجيل الأمر: ${options.name}`);
}

async function handleMessages(sock, { messages }) {
    let message;
    try {
        message = messages?.[0];
        if (!message || !message.message) return;

        // 🔒 منع التكرار
        if (executedMessages.has(message.key.id)) return;
        addExecutedMessage(message.key.id);

        // ✅ عداد الرسائل
        await messageCounter(sock, message);

        const body =
            message.message.conversation ||
            message.message.extendedTextMessage?.text ||
            message.message.imageMessage?.caption ||
            message.message.videoMessage?.caption ||
            '';

        if (!body) return;

        const prefix = config.prefix;
        const isCommand = body.toLowerCase().startsWith(prefix.toLowerCase());

        // ────────────────
        // 🟢 المسار الأول: رسالة عادية → all
        if (!isCommand) {
            const plugins = await getPlugins();
            for (const plugin of Object.values(plugins)) {
                if (typeof plugin.all === 'function') {
                    await plugin.all(sock, message);
                }
            }
            return;
        }

        // ────────────────
        // 🔵 المسار الثاني: أمر
        const parts = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = parts.shift()?.toLowerCase();
        const args = parts;

        if (!commandName) return;

        // حالة البوت
        const botPath = path.join(__dirname, '../data/bot.txt');
        let botStatus = '[on]';
        if (fs.existsSync(botPath)) {
            botStatus = fs.readFileSync(botPath, 'utf8').trim();
        }

        if (botStatus === '[off]' && commandName !== 'bot') return;

        const senderNumber = message.key.remoteJid.endsWith('@g.us')
            ? message.key.participant?.split('@')[0]
            : message.key.remoteJid.split('@')[0];

        // وضع النخبة
        const modePath = path.join(__dirname, '../data/mode.txt');
        let eliteMode = false;
        if (fs.existsSync(modePath)) {
            eliteMode = fs.readFileSync(modePath, 'utf8').trim() === '[on]';
        }

        if (eliteMode && !isElite(senderNumber)) return;

        const plugins = await getPlugins();
        const handler = plugins[commandName];
        if (!handler) return;

        message.args = args;
        message.command = commandName;
        message.prefix = prefix;

        if (handler.group && !message.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(message.key.remoteJid, {
                text: config.messages.groupOnly
            });
            return;
        }

        if (typeof handler.execute === 'function') {
            await handler.execute(sock, message, args);
        } else if (typeof handler === 'function') {
            await handler(sock, message);
        }

        logger.success(`تم تنفيذ الأمر: ${commandName}`);

    } catch (error) {
        logger.error(`✗ خطأ في handler: ${error.stack}`);
        playSound('ERROR');

        if (message?.key?.remoteJid) {
            await sock.sendMessage(message.key.remoteJid, {
                text: config.messages.error
            }).catch(() => {});
        }
    }
}

function handleMessagesLoader() {
    logger.info('✅ تم تحميل نظام الرسائل + نظام اللفل');
}

module.exports = {
    handleMessages,
    cmd,
    commands,
    handleMessagesLoader
};