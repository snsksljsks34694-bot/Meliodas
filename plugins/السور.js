const axios = require('axios');

module.exports = {
  command: ['السور'],
  category: 'ISLAM',

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;

      const res = await axios.get('https://api.alquran.cloud/v1/surah');
      const surahs = res.data.data;

      let text = "📜 قائمة السور في القرآن الكريم\n\n";

      for (const s of surahs) {
        text += `${s.number} - ${s.englishName} (${s.name})\n`;
      }

      await sock.sendMessage(jid, {
        text
      }, { quoted: msg });

    } catch (err) {
      console.log(err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ حدث خطأ أثناء جلب القائمة"
      }, { quoted: msg });
    }
  }
};