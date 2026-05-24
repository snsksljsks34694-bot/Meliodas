const fs = require('fs');
const { join } = require('path');
const { eliteNumbers, extractPureNumber } = require('../haykala/elite');
const { addKicked } = require('../haykala/dataUtils');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'بوم',
  description: '💣 يبدأ العد التنازلي للبوم ثم يطرد الأعضاء!',
  category: 'DEVELOPER',
  usage: '.بوم',

  async execute(sock, msg) {
    const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
    const senderNumber = extractPureNumber(senderJid);
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!eliteNumbers.includes(senderNumber) && senderJid !== botJid) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🚫 ليس لديك صلاحية لاستخدام هذا الأمر!'
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '🔥 **𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄 𝐓𝐇𝐄 𝐓𝐈𝐌𝐄 𝐁𝐎𝐌𝐁** 💣'
      });

      await sock.sendMessage(msg.key.remoteJid, {
        text: '⏳ **𝐒𝐓𝐀𝐑𝐓𝐈𝐍𝐆 𝐓𝐇𝐄 𝐂𝐎𝐔𝐍𝐓𝐃𝐎𝐖𝐍!** 🔥'
      });

      for (let i = 5; i >= 1; i--) {
        await sleep(700);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `*⏰ ${i}...*`
        });
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: '*💥 𝙱𝙾𝙾𝙼! 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑* 💣🔥'
      });

      const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
      const participants = groupMetadata.participants;

      const toRemove = participants
        .filter(p => p.id !== botJid && !eliteNumbers.includes(extractPureNumber(p.id)))
        .map(p => p.id);

      if (toRemove.length > 0) {
        try {
          await sock.groupParticipantsUpdate(msg.key.remoteJid, toRemove, 'remove');
          const kickedNumbers = toRemove.map(id => extractPureNumber(id));
          addKicked(kickedNumbers);
          await sock.sendMessage(msg.key.remoteJid, {
            text: '🚀 **𝐄𝐗𝐄𝐂𝐔𝐓𝐈𝐎𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄** 🧸🔥'
          });
        } catch (kickError) {
          console.error('فشل في تنفيذ الطرد:', kickError);
          await sock.sendMessage(msg.key.remoteJid, {
            text: '⚠️ فشل في طرد بعض أو كل الأعضاء.'
          }, { quoted: msg });
        }
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: '⚠️ لا يوجد أعضاء للطرد!'
        });
      }

    } catch (error) {
      console.error('❌ خطأ أثناء تنفيذ أمر البوم:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حدث خطأ أثناء محاولة تنفيذ أمر البوم!'
      }, { quoted: msg });
    }
  }
};