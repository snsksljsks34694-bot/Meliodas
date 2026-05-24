const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'تست',
  description: 'اختبار البوت',
  usage: '.تست',
  category: 'tools',

  async execute(sock, msg) {
    try {
      const fancyText = `
╭─❖ 『 𝑼𝑹𝑨𝑯𝑨𝑹𝑨 ❄️ 』 ❖─╮
│
│ *»D𝐎𝐍'𝐓 𝐏𝑳𝐀𝐘 𝐖𝐈𝐓𝐇 The Frostｼ»*
│ *_𝑾𝑬𝑳𝑪𝑶𝑴𝑬 𝑻𝑶 𝑯𝑬𝑳𝑳_*
│
╰────────────╯`;

      const imagePath = path.join(__dirname, '../resources/The Frost.jpg');
      const hasImage = fs.existsSync(imagePath);
      const imageBuffer = hasImage ? fs.readFileSync(imagePath) : null;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: fancyText,
          contextInfo: {
            externalAdReply: {
              title: "❄️ The Frost⚡",
              body: "جرب اللعب؟ جهّز نفسك للجحيم 🔥",
              thumbnail: imageBuffer,
              mediaType: 1,
              sourceUrl: "wa.me/967781661034?text=هلا+يا+حب+♥️",
              renderLargerThumbnail: false,
              showAdAttribution: true
            }
          }
        },
        { quoted: msg }
      );

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ حدث خطأ: ${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};