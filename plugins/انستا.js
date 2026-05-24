const axios = require('axios');

const CHANNEL_JID = '120363411349330697@newsletter';

module.exports = {
    command: 'انستا',
    description: 'تحميل من الانستا',
    category: 'تحميل',

    async execute(sock, msg, args) {

        try {

            const chatId = msg.key.remoteJid;
            const url = args.join(' ').trim();

            if (!url) {
                return await sock.sendMessage(chatId, {
                    text: '❌ ارسل رابط انستا'
                }, { quoted: msg });
            }

            // 🔥 رياكشن
            await sock.sendMessage(chatId, {
                react: {
                    text: '🔄',
                    key: msg.key
                }
            });

            const res = await axios.get(
                `https://api.nexray.web.id/downloader/instagram?url=${encodeURIComponent(url)}`,
                {
                    timeout: 15000
                }
            );

            const data = res?.data?.result;

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No media found');
            }

            // 🚀 إرسال الوسائط
            await Promise.all(
                data.map((media) => {

                    if (media.type === 'video') {

                        return sock.sendMessage(chatId, {
                            video: { url: media.url },
                            caption: '> 🎬 Downloaded By 𝐍𝐎𝐑𝐓𝐇',
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
                                    body: "𝐈𝐍𝐒𝐓𝐀 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃...",
                                    mediaType: 1,
                                    renderLargerThumbnail: false,
                                    showAdAttribution: false,
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb879Rk4dTnQH0u6QW1"
                                }
                            }
                        }, { quoted: msg });

                    } else {

                        return sock.sendMessage(chatId, {
                            image: { url: media.url },
                            caption: '> 🖼️ Downloaded By 𝐍𝐎𝐑𝐓𝐇',
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
                                    body: "𝐈𝐍𝐒𝐓𝐀 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃...",
                                    mediaType: 1,
                                    renderLargerThumbnail: false,
                                    showAdAttribution: false,
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb879Rk4dTnQH0u6QW1"
                                }
                            }
                        }, { quoted: msg });

                    }

                })
            );

            // ✅ نجاح
            await sock.sendMessage(chatId, {
                react: {
                    text: '✅',
                    key: msg.key
                }
            });

        } catch (e) {

            console.log(e);

            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ فشل التحميل'
            }, { quoted: msg });

        }

    }
};