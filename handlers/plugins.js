const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/console');
const config = require('../config');

let loadedPlugins = {};

// التحقق إذا كان النص يبدأ بالبادئة
function startsWithPrefix(text) {
    return text.startsWith(config.prefix);
}

// تحميل البلجنز من مجلد plugins
async function loadPlugins() {
    try {
        const pluginsDir = path.join(__dirname, '../plugins');
        await fs.ensureDir(pluginsDir);

        const files = await fs.readdir(pluginsDir);
        const pluginFiles = files.filter(file => file.endsWith('.js'));

        // مسح الكاش
        for (const file of pluginFiles) {
            const pluginPath = path.join(pluginsDir, file);
            delete require.cache[require.resolve(pluginPath)];
        }

        loadedPlugins = {};

        for (const file of pluginFiles) {
            try {
                const pluginPath = path.join(pluginsDir, file);
                const plugin = require(pluginPath);

                // ❌ بلجن فاضي
                if (!plugin) {
                    logger.warn(`تم تجاهل ${file}: بلجن غير صالح`);
                    continue;
                }

                // ✅ بلجن أوامر
                if (typeof plugin.execute === 'function' && plugin.command) {
                    loadedPlugins[plugin.command] = plugin;
                    logger.info(`تم تحميل أمر: ${plugin.command}`);
                    continue;
                }

                // ✅ بلجن all فقط
                if (typeof plugin.all === 'function') {
                    const name = plugin.command || `all_${file}`;
                    loadedPlugins[name] = plugin;
                    logger.info(`تم تحميل بلجن all: ${name}`);
                    continue;
                }

                logger.warn(`تم تجاهل ${file}: لا execute ولا all`);

            } catch (error) {
                logger.error(`فشل تحميل الإضافة ${file}:`, error);
            }
        }

        return loadedPlugins;

    } catch (error) {
        logger.error('فشل في تحميل الإضافات:', error);
        return {};
    }
}

module.exports = {
    loadPlugins,
    getPlugins: () => loadedPlugins
};