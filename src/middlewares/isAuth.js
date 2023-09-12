const { Router } = require("@grammyjs/router");
const { InlineKeyboard } = require("grammy");
const Io = require("../utils/Io");
const Users = new Io("./db/users.json");

const router = new Router((ctx) => ctx.session.step);
const start = router.route("start");

start.hears("/start", async (ctx, next) => {
  const userId = ctx.from.id;

  const users = await Users.read();
  const findUser = users.find((user) => user.userId == userId);

  if (!findUser) {
    ctx.session.step = "auth";
  } else {
    ctx.session.step = "start";
  }
  next();
});
module.exports = router;
