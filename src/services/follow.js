const { Router } = require("@grammyjs/router");
const { InlineKeyboard, Keyboard } = require("grammy");
const User = require("../models/user");
const Io = require("../utils/Io");
const Users = new Io("./db/users.json");

const router = new Router((ctx) => ctx.session.step);
const follow = router.route("follow");

follow.hears("Follows", async (ctx) => {
  const userId = ctx.from.id;

  const users = await Users.read();
  const findUser = users.find((user) => user.userId == userId);

  const follows = findUser.follows || [];

  if (follows.length > 0) {
    let message = "Your follows:\n\n";

    for (let i = 0; i < follows.length; i++) {
      const followUser = users.find((user) => user.userId == follows[i]);

      message += `
          ${i + 1}. ${followUser.username} - ${followUser.firstName} ${
        followUser.lastName || ""
      } (${followUser.userId})
          Unfollow: /${followUser.username}_${followUser.userId}
        `;
    }

    const keyboard = follows.map((follow) => [
      { text: `Unfollow ${follow}`, callback_data: `unfollow_${follow}` },
    ]);

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } else {
    await ctx.reply("You don't have any follows yet.");
  }
});
// // Unfollow tugmasi uchun esa quyidagi kod yoziladi:
const unfollow = router.route("unfollow");

unfollow.hears("unfollow", async (ctx) => {
  const userId = ctx.from.id;

  const users = await Users.read();
  const findUser = users.find((user) => user.userId == userId);

  const follows = findUser.follows || [];

  if (follows.length > 0) {
    const keyboard = follows.map((follow) => [
      { text: `Unfollow ${follow}`, callback_data: `unfollow_${follow}` },
    ]);

    await ctx.reply("Choose user to unfollow:", {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } else {
    await ctx.reply("You don't have any follows yet.");
  }
});
module.exports = router;
