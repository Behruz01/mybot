const { Router } = require("@grammyjs/router");
const { startStep } = require("../app");

const router = new Router((ctx) => ctx.session.step);
const start = router.route("step1");
start.on("message", startStep);
