const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');

  async function handleWelcome(sock, chatId, message, match) {
      if (!match) {
          return sock.sendMessage(chatId, {
              text: `📥 *إعداد رسالة الترحيب*\n\nاستخدم الأوامر التالية:\n\n✅ *.منور تشغيل* — تشغيل رسالة الترحيب\n🛠️ *.منور ضبط رسالتك الخاصة* — تعيين رسالة ترحيب مخصصة\n🚫 *.منور إغلاق* — إيقاف رسالة الترحيب`,
              quoted: message
          });
      }

      const [command, ...args] = match.split(' ');
      const lowerCommand = command.toLowerCase();
      const customMessage = args.join(' ');

      if (lowerCommand === 'تشغيل') {
          if (await isWelcomeOn(chatId)) {
              return sock.sendMessage(chatId, { text: '⚠️ رسائل الترحيب *مفعلة من قبل*.', quoted: message });
          }
          await addWelcome(chatId, true, null);
          return sock.sendMessage(chatId, { text: '✅ تم تفعيل رسائل الترحيب. تقدر تضبطها بأمر *.منور ضبط [رسالتك]*.', quoted: message });
      }

      if (lowerCommand === 'إغلاق') {
          if (!(await isWelcomeOn(chatId))) {
              return sock.sendMessage(chatId, { text: '⚠️ رسائل الترحيب *موقفة من قبل*.', quoted: message });
          }
          await delWelcome(chatId);
          return sock.sendMessage(chatId, { text: '✅ تم إيقاف رسائل الترحيب في القروب.', quoted: message });
      }

      if (lowerCommand === 'ضبط') {
          if (!customMessage) {
              return sock.sendMessage(chatId, { text: '⚠️ لازم تكتب رسالة ترحيب خاصة. مثال: *.منور ضبط أهلًا وسهلًا في القروب!*', quoted: message });
          }
          await addWelcome(chatId, true, customMessage);
          return sock.sendMessage(chatId, { text: '✅ تم تعيين رسالة الترحيب بنجاح.', quoted: message });
      }

      return sock.sendMessage(chatId, {
          text: `❌ الأمر غير صحيح. استخدم:\n*.منور تشغيل* - تشغيل\n*.منور ضبط [رسالة]* - تعيين رسالة\n*.منور إغلاق* - إيقاف`,
          quoted: message
      });
  }

  async function handleGoodbye(sock, chatId, message, match) {
      if (!match) {
          return sock.sendMessage(chatId, {
              text: `📤 *إعداد رسالة الوداع*\n\n✅ *.وداع تشغيل* — تشغيل\n🛠️ *.وداع ضبط [رسالة]* — تخصيص\n🚫 *.وداع إغلاق* — إيقاف`,
              quoted: message
          });
      }

      const [command, ...args] = match.split(' ');
      const lowerCommand = command.toLowerCase();
      const customMessage = args.join(' ');

      if (lowerCommand === 'تشغيل') {
          if (await isGoodByeOn(chatId)) {
              return sock.sendMessage(chatId, { text: '⚠️ رسائل الوداع *مفعلة من قبل*.', quoted: message });
          }
          await addGoodbye(chatId, true, null);
          return sock.sendMessage(chatId, { text: '✅ تم تفعيل رسائل الوداع.', quoted: message });
      }

      if (lowerCommand === 'إغلاق') {
          if (!(await isGoodByeOn(chatId))) {
              return sock.sendMessage(chatId, { text: '⚠️ رسائل الوداع *موقفة من قبل*.', quoted: message });
          }
          await delGoodBye(chatId);
          return sock.sendMessage(chatId, { text: '✅ تم إيقاف رسائل الوداع.', quoted: message });
      }

      if (lowerCommand === 'ضبط') {
          if (!customMessage) {
              return sock.sendMessage(chatId, { text: '⚠️ لازم تكتب رسالة وداع. مثال: *.وداع ضبط مع السلامة!*', quoted: message });
          }
          await addGoodbye(chatId, true, customMessage);
          return sock.sendMessage(chatId, { text: '✅ تم تعيين رسالة الوداع بنجاح.', quoted: message });
      }

      return sock.sendMessage(chatId, {
          text: '❌ الأمر غير صحيح.',
          quoted: message
      });
  }

  module.exports = { handleWelcome, handleGoodbye };
  