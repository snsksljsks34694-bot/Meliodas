// commands/commands.js

const { isElite } = require('../haykala/elite');
const { getPlugins } = require('../handlers/plugins');

module.exports = {
  command: 'شرح',
  category: 'عام',
  description: 'عرض جميع أوامر البوت بشكل منسق',
  usage: '.commands',

  async execute(sock, msg, args) {
    const loadedCommands = getPlugins(); // جلب جميع الأوامر
    const allCommands = Object.values(loadedCommands);

    let text = `*𝐍𝐎𝐑𝐓𝐇 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒❄️*\n\n`;
    text += `*𝐍𝐮𝐦𝐛𝐞𝐫 :* ${allCommands.length}\n\n`;

    for (const cmd of allCommands) {
      if (!cmd.command || !cmd.description) continue;
      text += `> *${cmd.command}*\n\n`;
      text += ` 𑁌 𝐍𝐎𝐑𝐓𝐇 𝐂𝐨𝐦𝐦𝐚𝐧𝐝  : \`${cmd.command}\`\n`;
      text += ` 𑁌 𝐍𝐎𝐑𝐓𝐇 ❄️ : ${cmd.description}\n\n`;
    }

    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};