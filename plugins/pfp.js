const { isElite } = require('../haykala/elite');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: ['pfp'],
  category: 'bot',

  async execute(sock, msg) {

    const chatId = msg.key.remoteJid;

    const sender =
      msg.key.participant ||
      msg.participant ||
      msg.key.remoteJid;

    if (!isElite(sender)) {
      return sock.sendMessage(chatId, {
        text: '❌ هذا الأمر للنخبة فقط'
      }, { quoted: msg });
    }

    try {

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      // =========================
      // 📌 تغيير صورة البروفايل للبوت
      // =========================
      if (body === '.pfp') {

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted || !quoted.imageMessage) {
          return sock.sendMessage(chatId, {
            text: '❌ لازم ترد على صورة لتغيير صورة البوت'
          }, { quoted: msg });
        }

        const stream = await downloadContentFromMessage(
          quoted.imageMessage,
          'image'
        );

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        await sock.updateProfilePicture(sock.user.id, buffer);

        return sock.sendMessage(chatId, {
          text: '✅ تم تغيير صورة البروفايل بنجاح'
        }, { quoted: msg });
      }

    } catch (e) {

      return sock.sendMessage(chatId, {
        text: `❌ خطأ:\n${e.message}`
      }, { quoted: msg });

    }
  }
};