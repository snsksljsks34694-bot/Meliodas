// commands/commands.js

const { isElite } = require('../haykala/elite');
const { getPlugins } = require('../handlers/plugins');

module.exports = {
  command: 'commands',
  category: 'tools',
  description: 'عرض جميع أوامر البوت بشكل منسق',
  usage: '.commands',

  async execute(sock, msg, args) {
    const loadedCommands = getPlugins(); // جلب جميع الأوامر
    const allCommands = Object.values(loadedCommands);

    let text = `*𝘽𝙤𝙩 𝙛𝙪𝙡𝙡 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨 :*\n\n`;
    text += `*𝐍𝐮𝐦𝐛𝐞𝐫 :* ${allCommands.length}\n\n`;

    for (const cmd of allCommands) {
      if (!cmd.command || !cmd.description) continue;
      text += `> *${cmd.command}*\n\n`;
      text += ` 𑁌 𝐂𝐨𝐦𝐦𝐚𝐧𝐝  : \`${cmd.command}\`\n`;
      text += ` 𑁌 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 : ${cmd.description}\n\n`;
    }

    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};