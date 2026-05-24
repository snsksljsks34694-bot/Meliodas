const { handleCommand, handleMessages, cmd, commands } = require('./handler');
const { loadPlugins } = require('./plugins');

module.exports = {
    handleCommand,   // دالة التعامل مع الأوامر
    handleMessages,  // دالة التعامل مع الرسائل
    loadPlugins,     // دالة تحميل البلجنز
    cmd,             // متغير أو كائن الأوامر
    commands         // قائمة أو كائن يحتوي على جميع الأوامر
};