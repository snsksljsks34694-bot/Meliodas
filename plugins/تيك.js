const axios = require('axios');

const CHANNEL_JID = '120363411349330697@newsletter';

module.exports = {
    command: ['تيك', 'tiktok', 'tt'],
    description: 'تحميل فيديو تيك توك',
    usage: '.تيك رابط',
    category: 'downloads',

    async execute(sock, msg) {

        try {

            const jid = msg.key.remoteJid;

            const body =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                '';

            const text = body.split(' ').slice(1).join(' ');

            if (!text) {
                return await sock.sendMessage(jid, {
                    text: '❌ حط رابط تيك توك'
                }, { quoted: msg });
            }

            // ⏳ رياكشن تحميل
            await sock.sendMessage(jid, {
                react: {
                    text: '⏳',
                    key: msg.key
                }
            });

            // 📥 API
            const res = await axios.get(
                `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`
            );

            const data = res.data?.data;

            if (!data || !data.play) {
                return await sock.sendMessage(jid, {
                    text: '❌ ما قدرت أجيب الفيديو، تأكد من الرابط'
                }, { quoted: msg });
            }

            // 🎥 إرسال الفيديو
            await sock.sendMessage(jid, {
                video: { url: data.play },
                caption: `🟢 ${data.title || 'TikTok Video'}`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,

                    forwardedNewsletterMessageInfo: {
                        newsletterJid: CHANNEL_JID,
                        serverMessageId: 1,
                        newsletterName: '𝐍𝐎𝐑𝐓𝐇'
                    },

                    externalAdReply: {
                        title: "𝐍𝐎𝐑𝐓𝐇 𝐁𝐎𝐓",
                        body: "𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃...",
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false,
                        sourceUrl: "https://whatsapp.com/channel/0029Vb879Rk4dTnQH0u6QW1"
                    }
                }
            }, { quoted: msg });

            // 🎵 إرسال الصوت
            if (data.music) {

                await sock.sendMessage(jid, {
                    audio: { url: data.music },
                    mimetype: 'audio/mpeg',
                    ptt: false,
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

            }

            // ✅ نجاح
            await sock.sendMessage(jid, {
                react: {
                    text: '✅',
                    key: msg.key
                }
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: `❌ خطأ:\n${error.message}`
                },
                { quoted: msg }
            );

        }

    }
};