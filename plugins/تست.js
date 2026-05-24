const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'تست',
  description: 'اختبار البوت',
  usage: '.تست',
  category: 'tools',

  async execute(sock, msg) {
    try {

      const chatId = msg.key.remoteJid;

      const CHANNEL_JID = '120363411349330697@newsletter';

      // 🔥 رياكشن
      await sock.sendMessage(chatId, {
        react: {
          text: '❄️',
          key: msg.key
        }
      });

      const quotes = [
        `*𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓*`
      ];

      const decoratedText =
        quotes[Math.floor(Math.random() * quotes.length)];

      // 📸 الصور
      const images = [
        'dark.jpg',
        'dark1.jpg',
        'dark2.jpg'
      ];

      const validImages = images
        .map(img => path.join(__dirname, `../${img}`))
        .filter(file => fs.existsSync(file));

      const randomImage = validImages.length
        ? validImages[Math.floor(Math.random() * validImages.length)]
        : null;

      const imageBuffer = randomImage
        ? fs.readFileSync(randomImage)
        : null;

      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: decoratedText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,

          forwardedNewsletterMessageInfo: {
            newsletterJid: CHANNEL_JID,
            serverMessageId: 1,
            newsletterName: '𝐍𝐎𝐑𝐓𝐇'
          },

          externalAdReply: {
            title: "𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓",
            body: "𝐃𝐀𝐑𝐊 𝐀𝐂𝐓𝐈𝐕𝐄...",
            thumbnail: imageBuffer,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false,
            sourceUrl: "https://whatsapp.com/channel/0029Vb879Rk4dTnQH0u6QW1"
          }
        }
      }, { quoted: msg });

    } catch (err) {

      console.error(err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `𖤐 𝐍𝐎𝐑𝐓𝐇`
      }, { quoted: msg });

    }
  }
};