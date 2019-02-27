const Telegraf = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_KEY);

const types = ['message', 'edited_message'];
const subTypes = ['photo'];

const chatAdmins = {};

const getChatAdmins = async (chatId, telegram) => {
    try {
        const currentTime = new Date().getTime();

        let result = chatAdmins[chatId];

        if (!result) {
            result = {
                time: 0
            };
            chatAdmins[chatId] = result;
        }

        // 5 minutes
        if ((currentTime - result.time) < 1e3 * 60 * 5) {
            return result.admins;
        }

        const admins = await telegram.getChatAdministrators(chatId);

        result.admins = admins.map((chatMember) => {
            return chatMember.user.id;
        });
        result.time = currentTime;

        return result.admins;
    } catch (e) {
        console.log(e);
        return [];
    }
};

bot.use(async (ctx, next) => {
    try {
        console.log(ctx);
        if (types.includes(ctx.updateType)) {
            if (ctx.updateSubTypes.some(r => subTypes.includes(r))) {
                return;
            }
        }

        const message = ctx.update.message;
        const chat = message.chat;
        const message_id = message.message_id;

        const admins = await getChatAdmins(chat.id, ctx.telegram);

        if (admins.includes(message.from.id)) {
            return;
        }

        ctx.telegram.deleteMessage(chat.id, message_id);
    } catch (e) {
        console.log(e);
        //ignore
    } finally {
        next();
    }
});

bot.launch();