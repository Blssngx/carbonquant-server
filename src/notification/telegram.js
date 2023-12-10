// telegram.js
const TelegramBot = require('node-telegram-bot-api');

// Function to send a message to Telegram
async function sendTelegramMessage(token, chatId, message) {
    // Create a new Telegram bot instance
    const bot = new TelegramBot(token, { polling: true });
    const timestamp = new Date().toUTCString();

    try {
        // Send the message to the specified chat ID
        await bot.sendMessage(chatId, message);
        console.log(`${timestamp} - Message sent to Telegram: ${message}`);
    } catch (error) {
        console.error(`Error sending message to Telegram: ${error.message}`);
    }
}

module.exports = {
    sendTelegramMessage,
};
