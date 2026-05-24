const { isElite } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid =>
  (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const activeGroups = new Set();
const stickerTracker = {};

const MAX_STICKERS = 3;          // عدد الملصقات المسموح
const RESET_TIME = 30 * 1000;    // مدة التصفير
const MAX_DELETES = 5;           // عدد الحذف قبل الطرد

module.exports = {
  command: 'موانع',
  description: 'منع سبام الملصقات مع الطرد التلقائي بإذن النخبة🚫',
  category: 'ادارة',

  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;
      const senderJid = decode(msg.key.participant || groupJid);
      const senderLid = senderJid.split('@')[0];

      // فقط مجموعات
      if (!groupJid.endsWith('@g.us')) {
        return sock.sendMessage(groupJid, {
          text: '*◞‼️┆هذا الأمر يعمل داخل المجموعة فقط◜*'
        }, { quoted: msg });
      }

      // صلاحية
      if (!isElite(senderLid)) {
        return sock.sendMessage(groupJid, {
          text: '*◞❕┆ليس لديك صلاحية لتنفيذ هذا الأمر◜*'
        }, { quoted: msg });
      }

      // منع التفعيل المكرر
      if (activeGroups.has(groupJid)) {
        return sock.sendMessage(groupJid, {
          text: '*◞👁️┆المراقبة مفعلة مسبقًا في هذه المجموعة◜*'
        }, { quoted: msg });
      }

      // تفعيل
      activeGroups.add(groupJid);
      stickerTracker[groupJid] = {};

      await sock.sendMessage(groupJid, {
        text: '*◜👁️‍🗨️┆𝐒𝐓𝐈𝐂𝐊𝐄𝐑 𝐀𝐍𝐓𝐈-𝐒𝐏𝐀𝐌 𝐀𝐂𝐓𝐈𝐕𝐄◞*'
      });

      sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
          if (!m.message || m.key.fromMe) continue;

          const chatId = m.key.remoteJid;
          if (!activeGroups.has(chatId)) continue;

          const sender = m.key.participant || chatId;

          if (!stickerTracker[chatId][sender]) {
            stickerTracker[chatId][sender] = {
              count: 0,
              deletes: 0,
              timer: null
            };
          }

          const userData = stickerTracker[chatId][sender];
          const isSticker = !!m.message.stickerMessage;

          // ⏱️ تصفير تلقائي
          if (userData.timer) clearTimeout(userData.timer);
          userData.timer = setTimeout(() => {
            userData.count = 0;
            userData.deletes = 0;
          }, RESET_TIME);

          // ✉️ رسالة غير ملصق
          if (!isSticker) {
            userData.count = 0;
            return;
          }

          // 🟢 ملصق
          userData.count++;

          if (userData.count > MAX_STICKERS) {
            try {
              // حذف الملصق
              await sock.sendMessage(chatId, {
                delete: {
                  remoteJid: chatId,
                  fromMe: false,
                  id: m.key.id,
                  participant: sender
                }
              });

              userData.deletes++;

              // 🚮 طرد بعد 5 حذف
              if (userData.deletes >= MAX_DELETES) {
                const groupMetadata = await sock.groupMetadata(chatId);
                const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                const admins = groupMetadata.participants
                  .filter(p => p.admin)
                  .map(p => p.id);

                // لا يطرد مشرف أو البوت
                if (!admins.includes(sender) && sender !== botJid) {
                  await sock.groupParticipantsUpdate(chatId, [sender], 'remove');

                  await sock.sendMessage(chatId, {
                    text: `*◞🚮┆تم طرد العضو بسبب سبام الملصقات◜*\n*◞📛┆تجاوز الحد المسموح◜*`
                  });
                }

                // تصفير بعد الطرد
                userData.count = 0;
                userData.deletes = 0;
              }

            } catch (err) {
              console.error('خطأ أثناء حذف/طرد سبام:', err);
            }
          }
        }
      });

    } catch (error) {
      console.error('*◞💢┆خطأ في أمر منع السبام◜*', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `◞💢┆حدث خطأ أثناء التنفيذ:\n${error.message || error}`
      }, { quoted: msg });
    }
  }
};