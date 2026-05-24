const axios = require('axios');

module.exports = {
  command: ['سورة'],
  category: 'ISLAM',

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;

      const text = msg.message?.conversation 
        || msg.message?.extendedTextMessage?.text 
        || "";

      const num = text.split(' ')[1];

      if (!num || isNaN(num)) {
        return sock.sendMessage(jid, {
          text: "📖 استخدم الرقم مثل:\n.سورة 1\n.سورة 2"
        }, { quoted: msg });
      }

      const res = await axios.get(`https://api.alquran.cloud/v1/surah/${num}`);

      const data = res.data.data;
      const ayahs = data.ayahs;

      let output = `📖 سورة ${data.englishName} (${data.name})\n\n`;

      for (const ayah of ayahs) {
        output += `${ayah.text} ۝${ayah.numberInSurah}\n`;
      }

      // تقسيم الرسالة
      const parts = output.match(/.{1,3000}/gs) || [];

      for (let i = 0; i < parts.length; i++) {
        await sock.sendMessage(jid, {
          text: parts[i] + `\n\n📌 ${i + 1}/${parts.length}`
        }, { quoted: msg });
      }

    } catch (err) {
      console.log(err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ حدث خطأ أثناء جلب السورة"
      }, { quoted: msg });
    }
  }
};