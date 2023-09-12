const fs = require("fs");

class Io {
  constructor(dir) {
    this.dir = dir;
  }

  async read() {
    const data = await fs.promises.readFile(this.dir, "utf-8");
    return data ? JSON.parse(data) : [];
  }

  async write(data) {
    await fs.promises.writeFile(this.dir, JSON.stringify(data, null, 2));
  }
}

module.exports = Io;
