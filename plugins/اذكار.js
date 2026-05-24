module.exports = {
  command: ['اذكار'],
  category: 'ISLAM',

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    const adhkar = [
      "سبحان الله 🤍",
      "الحمد لله 🌿",
      "لا إله إلا الله ✨",
      "الله أكبر 🕌",
      "سبحان الله وبحمده، سبحان الله العظيم 🤲",
      "أستغفر الله وأتوب إليه 🌸"
    ];

    const text = adhkar[Math.floor(Math.random() * adhkar.length)];

    await sock.sendMessage(jid, { text }, { quoted: msg });
  }
};