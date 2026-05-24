// *كود من عمو 𝐍𝐎𝐑𝐓𝐇 المز 🫦*
// 📄 *بوس.js* (جزء 1/1):

const axios = require("axios");

module.exports = {
  command: "بوس",
  description: "😘 بوس أنمي مع منشن",
  category: "صور",

  async execute(sock, msg) {
    try {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mentioned) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "😘 منشن الشخص اللي تبي تبوسه\nمثال: .بوس @user"
        }, { quoted: msg });
      }

      const res = await axios.get(
        "https://g.tenor.com/v1/search?q=anime+kiss&key=LIVDSRZULELA&limit=20"
      );

      const gifs = res.data.results;
      const gif = gifs[Math.floor(Math.random() * gifs.length)];

      const num = mentioned.split("@")[0];

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: gif.media[0].mp4.url },
        gifPlayback: true,
        mentions: [mentioned],
        caption: `😘 تم إعطاء بوس لـ @${num} ❤️`
      }, { quoted: msg });

    } catch (err) {
      console.log(err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ صار خطأ في أمر البوس"
      }, { quoted: msg });
    }
  }
};