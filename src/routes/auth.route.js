const Io = require("../utils/Io");
const Users = new Io("./db/users.json");
const User = require("../models/user");
const { Router } = require("@grammyjs/router");
const { InlineKeyboard, Keyboard } = require("grammy");

const router = new Router((ctx) => ctx.session.step);
const start = router.route("auth");
start.on("message", async (ctx) => {
  await ctx.reply("Ismingizni kiriting:", {
    reply_markup: new InlineKeyboard().text("Skip", "skipname"),
  });
  ctx.session.step = "name";
});

const name = router.route("name");
// name
name.callbackQuery("skipname", (ctx) => {
  ctx.session.name = ctx.from.first_name;
  ctx.reply("lastname kiriting:", {
    reply_markup: new InlineKeyboard().text("Skip", "skiplastname"),
  });
  ctx.session.step = "lastname";
  console.log(ctx.session);
});
name.on("message:text", (ctx) => {
  ctx.reply("lastname kiriting:", {
    reply_markup: new InlineKeyboard().text("Skip", "skiplastname"),
  });
  ctx.session.name = ctx.message.text;
  ctx.session.step = "lastname";
  console.log(ctx.session);
});
// lastname
const lastname = router.route("lastname");

lastname.callbackQuery("skiplastname", (ctx) => {
  ctx.reply("Username kiriting:");
  ctx.session.lastname = ctx.from?.username;
  ctx.session.step = "username";
});
lastname.on("message:text", (ctx) => {
  ctx.session.lastname = ctx.message.text;
  ctx.reply("Username kiriting:");
  ctx.session.step = "username";
  console.log(ctx.session);
});
// username
const username = router.route("username");

username.on("message:text", (ctx) => {
  ctx.session.username = ctx.message.text;
  ctx.reply("Telefon raqam kiriting:", {
    reply_markup: new Keyboard().requestContact("Phone number").resized(),
  });

  ctx.session.step = "phoneNumber";
  console.log(ctx.session);
});

// phone number
const phoneNumber = router.route("phoneNumber");
phoneNumber.on(":contact", async (ctx) => {
  ctx.session.phoneNumber = ctx.message.contact.phone_number;
  ctx.reply("Joylashuvingizni kiriting:", {
    reply_markup: new Keyboard().requestLocation("Location").resized(),
  });
  ctx.session.step = "location";
  console.log(ctx.session);
});

// location
const location = router.route("location");
location.on(":location", async (ctx) => {
  ctx.reply("Rasmingizni kiriting:", {
    reply_markup: new Keyboard().text("Skip and save").text("/start").resized(),
  });
  ctx.session.location = [
    ctx.message.location.latitude,
    ctx.message.location.longitude,
  ];
  ctx.session.step = "finish";
  console.log(ctx.session);
});
// finish
const finish = router.route("finish");
finish.on("message:photo", async (ctx) => {
  const photo = ctx.message.photo[2].file_id;
  ctx.session.photoLink = photo;
  const { name, lastname, username, phoneNumber, location } = ctx.session;

  const userId = ctx.from.id;
  const users = await Users.read();

  const newUser = new User(
    name,
    lastname,
    username,
    phoneNumber,
    location,
    userId,
    photo
  );
  const data = users.length ? [...users, newUser] : [newUser];
  Users.write(data);
  ctx.session.step = "finish";
  console.log(ctx.session);
});
finish.hears("Skip and save", async (ctx) => {
  const { name, lastname, username, phoneNumber, location } = ctx.session;

  const userId = ctx.from.id;
  const users = await Users.read();

  const newUser = new User(
    name,
    lastname,
    username,
    phoneNumber,
    location,
    userId
  );
  const data = users.length ? [...users, newUser] : [newUser];
  Users.write(data);
  ctx.session.step = "finish";
  console.log(ctx.session);
});
module.exports = router;
