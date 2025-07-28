/* eslint-disable */
// @ts-nocheck
const Augur = require("augurbot-ts"),
  u = require("../utils/utils"),
  config = require("../config/config.json");

const Module = new Augur.Module()
.addCommand({ name: "sudo",
  hidden: true,
  category: "Bot Admin",
  process: (msg, suffix) => {
    if (msg.author.id !== config.ownerId) {
      msg.reply("Stop it! Go away!").then(u.clean);
      return;
    } else {
      const embed = u.embed().setTitle("Eval Results").addFields({name: "Code Executed", value: `[Jump To Code](${msg.url})`});
      const success = (r) => {
        embed.setDescription(`\`\`\`\n${r}\n\`\`\``).setColor(0x00ff00);
        msg.channel.send({ embeds: [embed] });
      };
      const fail = (e) => {
        embed.setDescription(`__**${e.name}**__\n\`\`\`\n${e.message}\n\`\`\``).setColor(0xff0000);
        msg.channel.send({ embeds: [embed] });
      };
      const findCode = /^(?:```js\n([\s\S]*)\n?```)|(?:([\s\S]*))$/;
      const match = findCode.exec(suffix);
      const code = match?.[1] || match?.[2];

      const output = eval(`(async function() { ${code} })().then(success, fail);`);
    }
  },
  permissions: () => true
});


export = Module;