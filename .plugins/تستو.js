module.exports = {
  command: 'تستو',
  description: '⚙️ اختبار أداء البوت',
  usage: '.تست',
  category: 'tools',

  async execute(sock, msg) {
    try {
      let botProfilePic;
      try {
        botProfilePic = await sock.profilePictureUrl(sock.user.id, 'image');
      } catch {
        botProfilePic = 'https://i.imgur.com/8TnZ4Rv.png';
      }

      const messageText = `
 *『 𝑼𝑹𝑨𝑯𝑨𝑹𝑨 ❄️ 』*
━━━━━━━━━━━━━━
✅ *Online*
⚡ *Power : MAX*
🆔 *ID :* ${sock.user.id}
━━━━━━━━━━━━━━
_I'm here..._
      `.trim();

      const message = {
        text: messageText,
        mentions: [msg.sender],
        contextInfo: {
          mentionedJid: [msg.sender],
          externalAdReply: {
            title: "❄️ 𝑩𝛩𝑻 - The Frost",
            body: "⚜️ Ready for action.",
            thumbnailUrl: botProfilePic,
            sourceUrl: `https://chat.whatsapp.com/CjZeukw9FyM8Hr3pFJo3KF?mode=gi_t`,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      };

      await sock.sendMessage(msg.key.remoteJid, message, { quoted: msg });

    } catch (error) {
      console.error('❌ Test Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حدث خطأ أثناء تنفيذ الأمر.',
      }, { quoted: msg });
    }
  }
};