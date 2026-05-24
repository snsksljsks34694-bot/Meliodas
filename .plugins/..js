module.exports = {
  command: '.',
  description: 'أمر يستوعب معلومات الجروب',
  usage: '...',
  category: 'tools',

  async execute(sock, msg) {
    console.log(`تم استلام أمر صمت من: ${msg.key.participant || msg.key.remoteJid}`);
  }
};