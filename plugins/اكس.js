// *كود من عمو 𝐍𝐎𝐑𝐓𝐇 المز 🫦*
// 📄 *اكس.js*

const levelSystem = require('./لفل');

const games = new Map();

function renderBoard(board) {
    return `
${board[0]} │ ${board[1]} │ ${board[2]}
━━━╋━━━╋━━━
${board[3]} │ ${board[4]} │ ${board[5]}
━━━╋━━━╋━━━
${board[6]} │ ${board[7]} │ ${board[8]}
`;
}

function checkWinner(board, symbol) {

    const wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    return wins.some(comb =>
        comb.every(i => board[i] === symbol)
    );
}

module.exports = {
    command: ['اكس'],
    category: '🎮 الألعاب',
    description: 'لعبة اكس او',

    async execute(sock, msg) {

        const jid = msg.key.remoteJid;

        if (games.has(jid)) {
            return sock.sendMessage(jid, {
                text: '⛔ توجد لعبة شغالة بالفعل'
            }, { quoted: msg });
        }

        const starter =
            msg.key.participant ||
            msg.key.remoteJid;

        const board = [
            '1️⃣','2️⃣','3️⃣',
            '4️⃣','5️⃣','6️⃣',
            '7️⃣','8️⃣','9️⃣'
        ];

        games.set(jid, {
            board,
            current: '❎',
            players: {
                player1: starter,
                player2: null
            },
            started: false
        });

        await sock.sendMessage(jid, {
            text:
`╭─〔 ❎ لعبة اكس او 〕─╮

🎮 اللاعب الأول:
@${starter.split('@')[0]}

📌 أي شخص يريد الدخول
يرسل:
اكس

📌 بعد دخول اللاعب الثاني
تبدأ اللعبة تلقائياً

${renderBoard(board)}

╰────────────────╯`,
            mentions: [starter]
        }, { quoted: msg });

        const handler = async ({ messages }) => {

            try {

                const m = messages[0];

                if (!m.message) return;

                if (m.key.remoteJid !== jid)
                    return;

                const text =
                    m.message.conversation ||
                    m.message.extendedTextMessage?.text ||
                    '';

                const sender =
                    m.key.participant ||
                    m.key.remoteJid;

                const game = games.get(jid);

                if (!game) return;

                // دخول اللاعب الثاني
                if (
                    text.trim().toLowerCase() === 'اكس' &&
                    !game.players.player2 &&
                    sender !== game.players.player1
                ) {

                    game.players.player2 = sender;
                    game.started = true;

                    return sock.sendMessage(jid, {
                        text:
`╭─〔 🎮 بدأت اللعبة 〕─╮

❎ اللاعب الأول:
@${game.players.player1.split('@')[0]}

⭕️ اللاعب الثاني:
@${game.players.player2.split('@')[0]}

🎯 الدور على:
❎

${renderBoard(game.board)}

📌 للانسحاب:
انسحب

╰────────────────╯`,
                        mentions: [
                            game.players.player1,
                            game.players.player2
                        ]
                    });
                }

                // ما بدأت اللعبة
                if (!game.started)
                    return;

                // انسحاب
                if (text.trim() === 'انسحب') {

                    if (
                        sender !== game.players.player1 &&
                        sender !== game.players.player2
                    ) return;

                    sock.ev.off(
                        'messages.upsert',
                        handler
                    );

                    games.delete(jid);

                    return sock.sendMessage(jid, {
                        text:
`🏳️ تم الانسحاب!

👤 اللاعب:
@${sender.split('@')[0]}

❎ تم إنهاء اللعبة`,
                        mentions: [sender]
                    });
                }

                const map = {
                    '1': 0,
                    '2': 1,
                    '3': 2,
                    '4': 3,
                    '5': 4,
                    '6': 5,
                    '7': 6,
                    '8': 7,
                    '9': 8
                };

                if (!(text.trim() in map))
                    return;

                const index =
                    map[text.trim()];

                // المكان مستخدم
                if (
                    game.board[index] === '❎' ||
                    game.board[index] === '⭕️'
                ) {
                    return;
                }

                let symbol;

                if (
                    sender === game.players.player1
                ) {
                    symbol = '❎';
                }

                else if (
                    sender === game.players.player2
                ) {
                    symbol = '⭕️';
                }

                else {
                    return;
                }

                // التيرن
                if (game.current !== symbol)
                    return;

                game.board[index] = symbol;

                // فحص الفوز
                if (
                    checkWinner(
                        game.board,
                        symbol
                    )
                ) {

                    sock.ev.off(
                        'messages.upsert',
                        handler
                    );

                    games.delete(jid);

                    // 🔥 XP للفائز
                    levelSystem.addXP(
                        sender,
                        m.pushName || 'مستخدم',
                        80
                    );

                    return sock.sendMessage(jid, {
                        text:
`╭─〔 🏆 فائز 〕─╮

👤 اللاعب:
@${sender.split('@')[0]}

${renderBoard(game.board)}

✨ حصل على XP 🔥

╰────────────────╯`,
                        mentions: [sender]
                    });
                }

                // تعادل
                if (
                    game.board.every(
                        x =>
                            x === '❎' ||
                            x === '⭕️'
                    )
                ) {

                    sock.ev.off(
                        'messages.upsert',
                        handler
                    );

                    games.delete(jid);

                    return sock.sendMessage(jid, {
                        text:
`╭─〔 🤝 تعادل 〕─╮

${renderBoard(game.board)}

╰────────────────╯`
                    });
                }

                // تغيير الدور
                game.current =
                    game.current === '❎'
                        ? '⭕️'
                        : '❎';

                await sock.sendMessage(jid, {
                    text:
`╭─〔 🎮 الدور الحالي 〕─╮

❎ اللاعب الأول:
@${game.players.player1.split('@')[0]}

⭕️ اللاعب الثاني:
@${game.players.player2.split('@')[0]}

🎯 الدور على:
${game.current}

${renderBoard(game.board)}

📌 للانسحاب:
انسحب

╰────────────────╯`,
                    mentions: [
                        game.players.player1,
                        game.players.player2
                    ]
                });

            } catch (err) {
                console.log(err);
            }
        };

        sock.ev.on(
            'messages.upsert',
            handler
        );
    }
};