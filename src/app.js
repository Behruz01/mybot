require("dotenv/config");
const auth = require("./routes/auth.route");
const isAuth = require("./middlewares/isAuth");
const { Bot, InlineKeyboard, session, Keyboard } = require("grammy");
const Io = require("./utils/Io");
const Users = new Io("./db/users.json");
const newPost = require("./services/newPost");
const profile = require("./services/profile");
const follow = require("./services/follow");
// const recomendation = require("./services/recomendation");

const TOKEN = process.env.TOKEN;
const bot = new Bot(TOKEN);

bot.use(session({ initial: () => ({ step: "start" }) }));
bot.use(isAuth);
bot.use(auth);
bot.use(newPost);
bot.use(profile);
bot.use(follow);
// bot.use(recomendation);

////////////////////////////////////////////////////////////////////////////////////////
bot.command("start", isAuth, async (ctx) => {
  const userId = ctx.from.id;

  const users = await Users.read();
  const findUser = users.find((user) => user.userId == userId);

  await ctx.replyWithPhoto(
    `${
      findUser.photo
        ? findUser.photo
        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    }`,
    {
      caption: `Botga xush kelibsiz! ${findUser.username}`,
      reply_markup: new InlineKeyboard()
        .text("Follows", "follows")
        .text("Recomendation", "recomendation")
        .row()
        .text("Profile", "profile")
        .switchInline("Share")
        .row()
        .text("New post", "new post"),
    }
  );
});
// new post
bot.callbackQuery("new post", async (ctx) => {
  ctx.reply("Rasm kiriting:");
  ctx.session.step = "newPost";
  console.log(ctx.session);
});
// profile
bot.callbackQuery("profile", async (ctx) => {
  ctx.reply("Profile haqida ma'lumot olish:", {
    reply_markup: new InlineKeyboard().text("My profile", "profile"),
  });

  ctx.session.step = "profile";
  console.log(ctx.session);
});
// follows
bot.callbackQuery("follows", async (ctx) => {
  ctx.reply("Obunachilar bo'limiga o'ting:", {
    reply_markup: new Keyboard().text("Follows").resized(),
  });
  ctx.session.step = "follow";
});
// recomendation
bot.callbackQuery("recomendation", async (ctx) => {
  ctx.reply("Recomendation bo'limiga o'ting:", {
    reply_markup: new Keyboard().text("Recomendation").resized(),
  });
  ctx.session.step = "rec";
});
// bot block
bot.on("my_chat_member", (ctx) => {
  console.log(ctx.from.first_name);
});

// xatolik uchun
bot.catch((error) => {
  console.log(error);
});
bot.start();
