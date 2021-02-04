import { Telegraf } from 'telegraf';
import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import { basicCommands, commands } from './utils/commands';
import groupRide from './utils/groupRide';
import { title } from 'process';

const {
  BOT_TOKEN,
  NODE_ENV,
  PROJECT_ID,
  FUNCTION_NAME,
  USERNAME,
  REGION,
} = process.env;

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: true },
});

bot.telegram.setWebhook(
  `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}`
);

basicCommands.forEach((item) => {
  bot.command(item.commands, (ctx) => ctx.reply(item.response));
});

bot.command(commands.groupRide, async (ctx) => ctx.reply(await groupRide(ctx)));

bot.on('new_chat_members', (ctx) => {
  const name = ctx.message.from.first_name || ctx.message.from.username;

  if (ctx.message.sender_chat.type != 'private') {
    const title = `- ${ctx.message.sender_chat.title}`;
  } else {
    const title = 'helper bot';
  }

  const welcomeString =
    `Hey, ${name} Welcome to the Chicago E-Skate Network ${title}\n` +
    `For info on the next group ride, click: /group_ride\n` +
    `For more info on the group go to chicagoeskate.com\n` +
    `Also, make sure you look at the Group Ride Guidelines by clicking: /rules\n`;

  return ctx.reply(welcomeString);
});

export const botFunction: HttpFunction = async (req, res) => {
  console.log(req.body);
  try {
    // Handle the update
    await bot.handleUpdate(req.body);
    console.log('Success');
    res.status(200).send('Success');
  } catch (err) {
    console.log('Failure');
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
