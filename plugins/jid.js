module.exports = {
  command: "jid",
  description: "📌 يجيبلك معرف الشات (JID)",
  usage: ".jid",
  category: "مساعدة",

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid; // ← معرف الشات
      const message = `
┏━━━━━━━[ معرف الشات ]━━━━━━━┓

${jid}

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, {
        text: message
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر jid:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ حصل خطأ أثناء جلب المعرف." }, { quoted: msg });
    }
  }
};