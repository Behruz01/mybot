const { Router } = require("@grammyjs/router");

const router = new Router((ctx) => ctx.session.step);
const newPost = router.route("newPost");
newPost.on("message:photo", async (ctx) => {
  ctx.reply("title kiriting:");
  const photo = ctx.message.photo[0].file_id;
  ctx.session.photoLink = photo;
  ctx.session.step = "title";
  console.log(ctx.session);
});
const title = router.route("title");

title.on("message:text", async (ctx) => {
  ctx.reply("Description kiriting:");
  ctx.session.title = ctx.message.text;
  ctx.session.step = "desc";
  console.log(ctx.session);
});

const desc = router.route("desc");
desc.on("message:text", async (ctx) => {
  ctx.session.desc = ctx.message.text;
  ctx.replyWithPhoto(ctx.session.photoLink, {
    caption: `<b>${ctx.session.title}</b>\n ${ctx.session.desc}\n\n 👤 <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} </a> \n\n 🤖 <a href="tg://user?id=${ctx.me.id}">${ctx.me.first_name} </a>`,
    parse_mode: "HTML",
  });
  console.log(ctx.session);
});
module.exports = router;
