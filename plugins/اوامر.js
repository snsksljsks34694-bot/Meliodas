const { getPlugins } = require('../handlers/plugins.js');
const fs = require('fs');
const path = require('path');

global.menuSessions = global.menuSessions || {};
global.menuListenerAdded = global.menuListenerAdded || false;

const CHANNEL_JID = '120363411349330697@newsletter';

module.exports = {
  status: "on",
  name: 'NORTH MENU',
  command: ['اوامر'],
  category: 'tools',
  description: 'قائمة أوامر احترافية',

  async execute(sock, msg) {
    try {

      const jid = msg.key.remoteJid;

      // 🔥 رياكشن
      await sock.sendMessage(jid, {
        react: {
          text: '🍷',
          key: msg.key
        }
      });

      const plugins = getPlugins();
      const categories = {};

      Object.values(plugins).forEach((plugin) => {

        if (plugin.hidden) return;

        const category =
          plugin.category?.toLowerCase() || 'others';

        if (!categories[category]) {
          categories[category] = [];
        }

        const cmd = Array.isArray(plugin.command)
          ? plugin.command.map(c => `.${c}`).join(' │ ')
          : `.${plugin.command}`;

        categories[category].push(
`✦ ${cmd}
↳ ${plugin.description || 'بدون وصف'}`
        );

      });

      const categoryKeys = Object.keys(categories);

      const commandsCount =
        Object.values(plugins)
          .filter(p => !p.hidden).length;

      global.menuSessions[jid] = categoryKeys;

      // 📸 صور القائمة
      const images = [
        'dark3.jpg',
        'dark4.jpg',
        'dark5.jpg'
      ];

      const validImages = images
        .map(img => path.join(__dirname, `../${img}`))
        .filter(file => fs.existsSync(file));

      const randomMainImage = validImages.length
        ? validImages[Math.floor(Math.random() * validImages.length)]
        : null;

      const imageBuffer = randomMainImage
        ? fs.readFileSync(randomMainImage)
        : null;

      // ⏰ وقت التشغيل
      const uptime = process.uptime();

      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);

      // 📜 القائمة
      let menu = `
*╭━━〔 𝐍𝐎𝐑𝐓𝐇 𝐌𝐄𝐍𝐔 🍷 〕━╮*
┃ *🎚️ 𝑽𝒆𝒓𝒔𝒊𝒐𝒏 : 2.0.0*
┃ *🤖 𝑩𝒐𝒕  : 𝐍𝐎𝐑𝐓𝐇*
┃ *⏰ 𝑼𝒑𝒕𝒊𝒎𝒆  : ${h}h ${m}m ${s}s*
┃ *📯 𝑪𝒐𝒎𝒎𝒂𝒏𝒅𝒔 : ${commandsCount}*
*╰━━━━━━━━━━━━━━━━━━╯*

*╭━━━〔 𝐒𝐄𝐂𝐓𝐈𝐎𝐍𝐒..❄️ 〕━━╮*
`;

      categoryKeys.forEach((cat, i) => {
        menu += `┃ ${String(i + 1).padStart(2, '0')} ┃  ${cat}\n`;
      });

      menu += `
*╰━━━━━━━━━━━━━━━━━━╯*

*▣ 𝑻𝒚𝒑𝒆 𝒏𝒖𝒎𝒃𝒆𝒓 𝒕𝒐 𝒗𝒊𝒆𝒘 𝒄𝒐𝒎𝒎𝒂𝒏𝒅𝒔*

*╭━━━〔 𝐍𝐎𝐑𝐓𝐇 〕━━━╮*
┃ ☠ *“𝕴 𝖜𝖎𝖑𝖑 𝖇𝖊 𝖐𝖎𝖓𝖌 𝖔𝖋 𝖕𝖎𝖗𝖆𝖙𝖊𝖘”*
*╰━━━━━━━━━━━━━━━━━━╯*
`;

      // 🚀 إرسال القائمة
      await sock.sendMessage(jid, {
        image: imageBuffer,
        caption: menu,

        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,

          forwardedNewsletterMessageInfo: {
            newsletterJid: CHANNEL_JID,
            serverMessageId: 1,
            newsletterName: '𝐍𝐎𝐑𝐓𝐇'
          }
        }

      }, { quoted: msg });

      // 🔥 نظام الأقسام
      if (!global.menuListenerAdded) {

        global.menuListenerAdded = true;

        sock.ev.on('messages.upsert', async ({ messages }) => {

          try {

            const m = messages[0];

            if (!m.message) return;

            const jid = m.key.remoteJid;

            const text =
              m.message.conversation ||
              m.message.extendedTextMessage?.text ||
              '';

            const num = parseInt(text.trim());

            if (isNaN(num)) return;

            const session = global.menuSessions[jid];

            if (!session) return;

            const index = num - 1;

            const catName = session[index];

            if (!catName) return;

            const resultCommands =
              categories[catName] || [];

            let result = `
*╭━━〔 🍷 ${catName.toUpperCase()} 〕━━╮*
`;

            result += resultCommands
              .slice(0, 50)
              .map(cmd => `┃ ${cmd}`)
              .join('\n\n');

            result += `
*╰━━━━━━━━━━━━━━━━━━╯*
> 🍷 *Powered By 𝐍𝐎𝐑𝐓𝐇*`;

            // ❄️ رياكشن
            await sock.sendMessage(jid, {
              react: {
                text: '❄️',
                key: m.key
              }
            });

            // 📸 صورة عشوائية للأقسام
            const sectionRandom =
              validImages.length
                ? validImages[Math.floor(Math.random() * validImages.length)]
                : null;

            const sectionBuffer =
              sectionRandom
                ? fs.readFileSync(sectionRandom)
                : imageBuffer;

            // 🚀 إرسال القسم
            await sock.sendMessage(jid, {
              image: sectionBuffer,
              caption: result,

              contextInfo: {
                forwardingScore: 999,
                isForwarded: true,

                forwardedNewsletterMessageInfo: {
                  newsletterJid: CHANNEL_JID,
                  serverMessageId: 1,
                  newsletterName: '𝐍𝐎𝐑𝐓𝐇'
                }
              }

            }, { quoted: m });

          } catch (e) {

            console.log('MENU ERROR:', e);

          }

        });

      }

    } catch (err) {

      console.log('MENU ERROR:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ صار خطأ في القائمة`
      }, { quoted: msg });

    }
  }
};