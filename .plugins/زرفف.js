const fs = require('fs');
  const { eliteNumbers } = require('../haykala/elite.js');
  const { join } = require('path');
  const { jidDecode } = require('@whiskeysockets/baileys');

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

  module.exports = {
      command: 'رياتسو',
      description: 'يزرف القروب باستخدام ملف zarf.json',
      usage: '.زرفف',
      category: 'DEVELOPER',

      async execute(sock, msg) {
          try {
              const groupJid = msg.key.remoteJid;
              const sender = decode(msg.key.participant || groupJid);
              const senderLid = sender.split('@')[0];

              if (!groupJid.endsWith('@g.us'))
                  return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

              if (!eliteNumbers.includes(senderLid))
                  return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

              const zarfJsonPath = join(process.cwd(), 'zarf.json');
              if (!fs.existsSync(zarfJsonPath)) {
                  return await sock.sendMessage(groupJid, { text: '❌ ملف zarf.json غير موجود.' }, { quoted: msg });
              }
              const zarfData = JSON.parse(fs.readFileSync(zarfJsonPath));
              const groupMetadata = await sock.groupMetadata(groupJid);
              const botNumber = decode(sock.user.id);

              if (groupMetadata.announce === false) {
                  await sock.groupSettingUpdate(groupJid, 'announcement').catch(() => {});
              }

              if (zarfData.reaction_status === "on" && zarfData.reaction) {
                  await sock.sendMessage(groupJid, {
                      react: { text: zarfData.reaction, key: msg.key }
                  }).catch(() => {});
              }

              const membersToDemote = groupMetadata.participants
                  .filter(p => p.id !== botNumber && !eliteNumbers.includes(decode(p.id).split('@')[0]))
                  .map(p => p.id);

              if (membersToDemote.length > 0) {
                  await sock.groupParticipantsUpdate(groupJid, membersToDemote, 'demote').catch(() => {});
              }

              await sleep(1000);

              const eliteToPromote = groupMetadata.participants
                  .filter(p => eliteNumbers.includes(decode(p.id).split('@')[0]) && p.id !== botNumber)
                  .map(p => p.id);

              if (eliteToPromote.length > 0) {
                  await sock.groupParticipantsUpdate(groupJid, eliteToPromote, 'promote').catch(() => {});
              }

              if (zarfData.group?.status === "on") {
                  if (zarfData.group.newSubject) await sock.groupUpdateSubject(groupJid, zarfData.group.newSubject).catch(() => {});
                  if (zarfData.group.newDescription) await sock.groupUpdateDescription(groupJid, zarfData.group.newDescription).catch(() => {});
              }

              if (zarfData.media?.status === "on" && zarfData.media.image) {
                  const imgPath = join(process.cwd(), zarfData.media.image);
                  if (fs.existsSync(imgPath)) {
                      await sock.updateProfilePicture(groupJid, fs.readFileSync(imgPath)).catch(() => {});
                  }
              }

              if (zarfData.messages?.status === "on") {
                  const allParticipants = groupMetadata.participants.map(p => p.id);
                  if (zarfData.messages.mention) {
                      await sock.sendMessage(groupJid, { text: zarfData.messages.mention, mentions: allParticipants }).catch(() => {});
                  }
                  if (zarfData.messages.final) {
                      await sock.sendMessage(groupJid, { text: zarfData.messages.final }).catch(() => {});
                  }
              }

              // ✅ PTT — voice note بدلاً من الصوت الخارجي
              const pttPath = join(process.cwd(), 'media', 'The Frost.mp4');
              const fallback = join(process.cwd(), 'media', 'videonote.mp4');
              const pttFile = fs.existsSync(pttPath) ? pttPath : (fs.existsSync(fallback) ? fallback : null);
              if (pttFile) {
                  await sock.sendMessage(groupJid, {
                      audio: fs.readFileSync(pttFile),
                      mimetype: 'audio/mp4',
                      ptt: true
                  }).catch(() => {});
              }

          } catch (error) {
              console.error('❌ خطأ في أمر الزرفف:', error.message);
              await sock.sendMessage(msg.key.remoteJid, {
                  text: '❌ حدث خطأ: ' + (error.message || error.toString())
              }, { quoted: msg });
          }
      }
  };
  