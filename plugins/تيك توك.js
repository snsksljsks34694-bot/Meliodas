const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CHANNEL_JID = '120363411349330697@newsletter';

module.exports = {
  command: ['تيك توك'],
  category: 'tools',
  description: 'جلب ايديت لشخصيات من تيك توك',

  async execute(sock, msg) {
    try {

      const chatId = msg.key.remoteJid;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        '';

      // 🔥 حذف الأمر
      const text = body.replace(/^\.?تيك\s*/i, '').trim();

      if (!text) {
        return sock.sendMessage(chatId, {
          text:
`╭━━━〔 𖤐 𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓 〕━━━╮

🎬 اكتب اسم الشخصية

📌 مثال:
.تيك لوفي

╰━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
      }

      // 📽️ رياكشن
      await sock.sendMessage(chatId, {
        react: {
          text: '📽️',
          key: msg.key
        }
      });

      // 🔍 API
      const res = await axios.get(
        `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text + ' edit')}`
      );

      const results = res.data?.data;

      if (!results || results.length === 0) {

        return sock.sendMessage(chatId, {
          text:
`╭━━━〔 𖤐 𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓 〕━━━╮

❌ ما لقيت نتائج

╰━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });

      }

      // 🎥 اختيار عشوائي
      const video = results[Math.floor(Math.random() * results.length)];

      // 🖼️ الصورة
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

      const sizeMB = video.size
        ? (video.size / 1024 / 1024).toFixed(2) + ' MB'
        : 'غير معروف';

      const quality = video.hd ? 'HD' : 'SD';

      // 🚀 إرسال الفيديو
      await sock.sendMessage(chatId, {
        video: { url: video.nowm || video.url },

        caption:
`╭━━━〔 𖤐 𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓 〕━━━╮

🎬┇الاسم: ${text}
📌┇العنوان: ${video.title || 'بدون عنوان'}
📦┇الحجم: ${sizeMB}
🎥┇الجودة: ${quality}

╰━━━━━━━━━━━━━━━━╯`,

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
            body: "𝐓𝐈𝐊𝐓𝐎𝐊 𝐄𝐃𝐈𝐓...",
            thumbnail: imageBuffer,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false,
            sourceUrl: "https://whatsapp.com/channel/0029Vb879Rk4dTnQH0u6QW1"
          }
        }

      }, { quoted: msg });

      // ✅ نجاح
      await sock.sendMessage(chatId, {
        react: {
          text: '✅',
          key: msg.key
        }
      });

    } catch (err) {

      console.error("ERROR:", err);

      await sock.sendMessage(msg.key.remoteJid, {
        text:
`╭━━━〔 𖤐 𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓 〕━━━╮

⚠️ صار خطأ في جلب الايديت

╰━━━━━━━━━━━━━━━━╯`
      }, { quoted: msg });

    }
  }
};