// *كود من عمو 𝐌𝐞𝐥𝐢𝐨𝐝𝐚𝐬 المز 🫦*
// 📄 *يوتيوب.js* (جزء 1/1):

const axios = require("axios");
const yts = require("yt-search");

function extractYouTubeID(url) {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

module.exports = {
  command: 'يوتيوب',
  description: 'تحميل من اليوتيوب',
  usage: '.يوتيوب اسم',
  category: 'downloader',

  async execute(sock, msg, args) {
    try {
      const jid = msg?.key?.remoteJid || msg?.from;
      if (!jid) return;

      // 🔍 رياكشن
      await sock.sendMessage(jid, {
        react: {
          text: "🔍",
          key: msg.key
        }
      });

      const text = args.join(" ").trim();

      if (!text) {
        return await sock.sendMessage(jid, {
          text: '🎵 استخدم:\n\n.يوتيوب اسم الأغنية'
        }, { quoted: msg });
      }

      // 🔎 بحث
      const videoId = extractYouTubeID(text);

      const query = videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : text;

      // ✅ FIX البحث
      const results = await yts.search(query);

      if (!results?.videos?.length) {
        return await sock.sendMessage(jid, {
          text: '❌ لم يتم العثور على نتائج'
        }, { quoted: msg });
      }

      const video = results.videos[0];

      // 🖼️ رسالة الاختيار
      const caption = `
⌗━━━━━━━━━━━━━━━━━━━⌗
🎬 *العنوان:* ${video.title}
👁️ *المشاهدات:* ${formatNumber(video.views)}
⏱️ *المدة:* ${video.timestamp}
📺 *القناة:* ${video.author.name}
⌗━━━━━━━━━━━━━━━━━━━⌗

1️⃣ تحميل صوت
2️⃣ تحميل قيديو

✦ أرسل الرقم فقط
`.trim();

      await sock.sendMessage(jid, {
        image: { url: video.thumbnail },
        caption
      }, { quoted: msg });

      // ⏳ انتظار الرد
      const choice = await new Promise((resolve) => {

        const timeout = setTimeout(() => {
          sock.ev.off("messages.upsert", handler);
          resolve(null);
        }, 60000);

        const handler = async ({ messages }) => {
          const m = messages?.[0];
          if (!m) return;

          if (m.key.remoteJid !== jid) return;
          if (m.key.fromMe) return;

          const body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            "";

          if (body !== "1" && body !== "2") return;

          clearTimeout(timeout);
          sock.ev.off("messages.upsert", handler);

          resolve(body);
        };

        sock.ev.on("messages.upsert", handler);
      });

      if (!choice) {
        return await sock.sendMessage(jid, {
          text: '⌛ انتهى وقت الاختيار'
        }, { quoted: msg });
      }

      // ================= MP3 =================
      if (choice === "1") {

        await sock.sendMessage(jid, {
          react: {
            text: "🎧",
            key: msg.key
          }
        });

        await sock.sendMessage(jid, {
          text: "⏳ جاري تحميل الصوت..."
        }, { quoted: msg });

        const api = await axios.get(
          `https://api.nexray.web.id/downloader/ytmp3?url=${encodeURIComponent(video.url)}`
        );

        if (!api.data?.result?.url) {
          throw new Error("فشل تحميل الصوت");
        }

        const dl = api.data.result.url;

        await sock.sendMessage(jid, {
          audio: { url: dl },
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`
        }, { quoted: msg });

      }

      // ================= MP4 =================
      if (choice === "2") {

        await sock.sendMessage(jid, {
          react: {
            text: "🎬",
            key: msg.key
          }
        });

        await sock.sendMessage(jid, {
          text: "⏳ جاري تحميل الفيديو..."
        }, { quoted: msg });

        const api = await axios.get(
          `https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(video.url)}&resolusi=720`
        );

        if (!api.data?.result?.url) {
          throw new Error("فشل تحميل الفيديو");
        }

        const dl = api.data.result.url;

        await sock.sendMessage(jid, {
          video: { url: dl },
          mimetype: "video/mp4",
          caption: `🎬 ${video.title}`
        }, { quoted: msg });

      }

    } catch (error) {
      console.error('❌ خطأ في أمر يوتيوب:', error);

      await sock.sendMessage(msg?.key?.remoteJid || msg?.from || '', {
        text: `⚠️ حدث خطأ أثناء التنفيذ\n\n${error?.message || error}`,
      }, { quoted: msg });
    }
  }
};