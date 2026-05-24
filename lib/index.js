const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/userGroupData.json');

function loadUserGroupData() {
    try {
        if (!fs.existsSync(dataPath)) {
            const defaultData = {
                antibadword: {},
                antilink: {},
                welcome: {},
                goodbye: {},
                chatbot: {},
                warnings: {},
                sudo: []
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
        console.error('Error loading user group data:', error);
        return {
            antibadword: {},
            antilink: {},
            welcome: {},
            goodbye: {},
            chatbot: {},
            warnings: {},
            sudo: []
        };
    }
}

function saveUserGroupData(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving user group data:', error);
        return false;
    }
}

// ========== WELCOME / GOODBYE ==========
function isWelcomeOn(groupId) {
    const data = loadUserGroupData();
    return data.welcome?.[groupId]?.enabled || false;
}

function isGoodByeOn(groupId) {
    const data = loadUserGroupData();
    return data.goodbye?.[groupId]?.enabled || false;
}

async function addWelcome(jid, enabled, message) {
    const data = loadUserGroupData();
    data.welcome[jid] = {
        enabled,
        message: message || 'منور 👋 {user} \n أهلا بك في قروب {group}! 🎉'
    };
    return saveUserGroupData(data);
}

async function delWelcome(jid) {
    const data = loadUserGroupData();
    delete data.welcome?.[jid];
    return saveUserGroupData(data);
}

async function addGoodbye(jid, enabled, message) {
    const data = loadUserGroupData();
    data.goodbye[jid] = {
        enabled,
        message: message || 'غادر {user} القروب 👋'
    };
    return saveUserGroupData(data);
}

async function delGoodBye(jid) {
    const data = loadUserGroupData();
    delete data.goodbye?.[jid];
    return saveUserGroupData(data);
}

// ========== ANTILINK ==========
async function setAntilink(groupId, type, action) {
    const data = loadUserGroupData();
    data.antilink[groupId] = {
        enabled: type === 'on',
        action: action || 'delete'
    };
    return saveUserGroupData(data);
}

async function getAntilink(groupId, type) {
    const data = loadUserGroupData();
    return type === 'on' ? data.antilink?.[groupId] : null;
}

async function removeAntilink(groupId) {
    const data = loadUserGroupData();
    delete data.antilink?.[groupId];
    return saveUserGroupData(data);
}

// ========== ANTIBADWORD ==========
async function setAntiBadword(groupId, type, action) {
    const data = loadUserGroupData();
    data.antibadword[groupId] = {
        enabled: type === 'on',
        action: action || 'delete'
    };
    return saveUserGroupData(data);
}

async function getAntiBadword(groupId, type) {
    const data = loadUserGroupData();
    return type === 'on' ? data.antibadword?.[groupId] : null;
}

async function removeAntiBadword(groupId) {
    const data = loadUserGroupData();
    delete data.antibadword?.[groupId];
    return saveUserGroupData(data);
}

// ========== WARNINGS ==========
async function incrementWarningCount(groupId, userId) {
    const data = loadUserGroupData();
    if (!data.warnings[groupId]) data.warnings[groupId] = {};
    if (!data.warnings[groupId][userId]) data.warnings[groupId][userId] = 0;
    data.warnings[groupId][userId]++;
    saveUserGroupData(data);
    return data.warnings[groupId][userId];
}

async function resetWarningCount(groupId, userId) {
    const data = loadUserGroupData();
    if (data.warnings?.[groupId]?.[userId]) {
        data.warnings[groupId][userId] = 0;
        return saveUserGroupData(data);
    }
    return false;
}

// ========== SUDO ==========
async function isSudo(userId) {
    const data = loadUserGroupData();
    return data.sudo.includes(userId);
}

// ========== CHATBOT ==========
async function setChatbot(groupId, enabled) {
    const data = loadUserGroupData();
    data.chatbot[groupId] = { enabled };
    return saveUserGroupData(data);
}

async function getChatbot(groupId) {
    const data = loadUserGroupData();
    return data.chatbot?.[groupId] || null;
}

async function removeChatbot(groupId) {
    const data = loadUserGroupData();
    delete data.chatbot?.[groupId];
    return saveUserGroupData(data);
}

module.exports = {
    loadUserGroupData,
    saveUserGroupData,
    isWelcomeOn,
    isGoodByeOn,
    addWelcome,
    delWelcome,
    addGoodbye,
    delGoodBye,
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntiBadword,
    getAntiBadword,
    removeAntiBadword,
    incrementWarningCount,
    resetWarningCount,
    isSudo,
    setChatbot,
    getChatbot,
    removeChatbot
};