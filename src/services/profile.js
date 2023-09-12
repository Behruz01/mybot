const { Router } = require("@grammyjs/router");
const { InlineKeyboard, Keyboard } = require("grammy");
const User = require("../models/user");
const Io = require("../utils/Io");
const Users = new Io("./db/users.json");

const router = new Router((ctx) => ctx.session.step);
const profile = router.route("profile");
profile.callbackQuery("profile", async (ctx) => {
  await ctx.deleteMessage();

  const userId = ctx.from.id;

  const users = await Users.read();
  const findUser = users.find((user) => user.userId == userId);

  await ctx.replyWithPhoto(
    findUser.profilePic ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    {
      caption: `
        Username: ${findUser.username}
        First Name: ${findUser.name}
        Last Name: ${findUser.lastname}
        Bio: ${findUser.bio || "-"}
      `,
      reply_markup: new InlineKeyboard()
        .text("Edit Profile", "edit_profile")
        .row()
        .text("Back", "back"),
    }
  );
  ctx.session.step = "rename";
});
const back = router.route("back");
back.callbackQuery("back", async (ctx) => {
  ctx.reply("start bering");
  ctx.session.step = "start";
});
// edit
const rename = router.route("rename");
rename.callbackQuery("edit_profile", (ctx) => {
  ctx.reply("Ismingizni kiriting");
  ctx.session.name = ctx.message.text;
  ctx.session.step = "relastname";
  console.log(ctx.session);
});
rename.on("message:text", (ctx) => {
  ctx.reply("Familiyangizni kiriting");
  ctx.session.name = ctx.message.text;
  ctx.session.step = "relastname";
  console.log(ctx.session);
});

const relastname = router.route("relastname");
relastname.on("message:text", async (ctx) => {
  ctx.reply("Username kiriting:");
  ctx.session.lastname = ctx.message.text;
  ctx.session.step = "reusername";
  console.log(ctx.session);
});
const reusername = router.route("reusername");
reusername.on("message:text", async (ctx) => {
  ctx.reply("Raqamingizni yuboring:", {
    reply_markup: new Keyboard().requestContact("Phone number").resized(),
  });
  ctx.session.username = ctx.message.text;
  ctx.session.step = "rephonenumber";
  console.log(ctx.session);
});

const rephonenumber = router.route("rephonenumber");
rephonenumber.on(":contact", async (ctx) => {
  ctx.reply("Joylashuvingizni kiriting:", {
    reply_markup: new Keyboard().requestLocation("Location").resized(),
  });
  ctx.session.phoneNumber = ctx.message.contact.phone_number;
  ctx.session.step = "relocation";
  console.log(ctx.session);
});

const relocation = router.route("relocation");
relocation.on(":location", async (ctx) => {
  ctx.reply("Rasmingizni kiriting va start bering:");
  ctx.session.location = [
    ctx.message.location.latitude,
    ctx.message.location.longitude,
  ];
  ctx.session.step = "rephoto";
  console.log(ctx.session);
});

const rephoto = router.route("rephoto");
rephoto.on(":photo", async (ctx) => {
  const photo = ctx.message.photo[0].file_id;
  ctx.session.photoLink = photo;

  const { name, lastname, username, phoneNumber, location, photoLink } =
    ctx.session;

  const userId = ctx.from.id;
  const users = await Users.read();
  const filterUser = users.filter((user) => user.userId != userId);

  const editUser = new User(
    name,
    lastname,
    username,
    phoneNumber,
    location,
    userId,
    photoLink
  );
  const data = filterUser.length ? [...filterUser, editUser] : [editUser];
  Users.write(data);

  console.log(ctx.session);
});
module.exports = router;
