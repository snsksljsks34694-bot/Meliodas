const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const msgsFile = path.join(dataDir, 'messages.json');

// ────────────── دوال التحميل والحفظ ──────────────
function load(file) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ────────────── تنفيذ عدّ الرسائل ──────────────
module.exports = async function messageCounter(sock, msg) {
  try {
    if (msg.key.fromMe) return; // تجاهل الرسائل المرسلة من البوت

    // ❌ تجاهل الوسائط والأوامر
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text;
    if (!text || text.startsWith('.') || text.startsWith('!')) return;

    const userId = msg.key.participant || msg.key.remoteJid;
    if (!userId) return;

    const msgsData = load(msgsFile);

    // زيادة عدّ الرسائل
    msgsData[userId] = (msgsData[userId] || 0) + 1;

    // حفظ البيانات بعد كل رسالة
    save(msgsFile, msgsData);

  } catch (err) {
    console.error('❌ خطأ عدّ الرسائل:', err);
  }
};