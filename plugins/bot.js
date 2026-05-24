// *كود من عمو 𝐍𝐎𝐑𝐓𝐇 المز 🫦*
// 📄 *بوت.js* (جزء 1/1):

// 📄 بوت.js

const axios = require('axios');

module.exports = {
  command: 'بوت',
  description: 'ذكاء اصطناعي',
  usage: '.بوت هلا',
  category: 'ai',

  async execute(sock, msg) {
    try {

      const jid = msg.key.remoteJid;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const text = body.split(' ').slice(1).join(' ');

      if (!text) {
        return await sock.sendMessage(jid, {
          text: '💙 ~ حط نص جنب الأمر ~ ❤️'
        }, { quoted: msg });
      }

      // تفاعل
      await sock.sendMessage(jid, {
        react: {
          text: '🧠',
          key: msg.key
        }
      });

      // API AI
      const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai`;

      const { data } = await axios.get(url);

      // إرسال الرد
      await sock.sendMessage(jid, {
        text: data || '❌ ما لقيت رد'
      }, { quoted: msg });

    } catch (error) {

      console.error(error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${error.message}`
      }, { quoted: msg });

    }
  }
};