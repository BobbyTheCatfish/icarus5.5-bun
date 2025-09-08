const Augur = require("augurbot-ts");
const u = require("../utils/utils");
const Discord = require("discord.js");
const petPetGif = require("pet-pet-gif");
const Jimp = require("jimp");
const { ColorActionName } = require("@jimp/plugin-color");

type FilterFunction = (int: Discord.ChatInputCommandInteraction, img: { name: string, img: Jimp }) => void
type BasicFilterProcess = (x: number, y: number, canvas: Jimp, index: number) => void

const errorReading = (int: Discord.ChatInputCommandInteraction) => int.editReply("Sorry, but I couldn't get the image. Let my developers know if this is a reoccurring problem").then(u.clean);


async function jimpRead(url: string | null) {
  try {
    if (!url) return null;
    const img = await Jimp.read(url);
    // resize large images so that the largest dimension is 256p
    if (img.getWidth() > 256 || img.getHeight() > 256) {
      const w = img.getWidth(), h = img.getHeight();
      const largest = Math.max(w, h);
      img.resize(w === largest ? 256 : Jimp.AUTO, w === largest ? Jimp.AUTO : 256);
    }
    return img;
  } catch (e) {
    return null;
  }
}

/** Send the image as an embed */
async function sendImg(int: Discord.ChatInputCommandInteraction, img: Buffer | string, name: string, format: string = "png") {
  const image = new u.Attachment(img, { name: `image.${format}` });
  const embed = u.embed().setTitle(name).setImage(`attachment://image.${format}`);
  return int.editReply({ embeds: [embed], files: [image] });
}

/** Get the image from an interaction. */
function targetImg(int: Discord.ChatInputCommandInteraction, size: Discord.ImageSize = 256) {
  let target: Discord.GuildMember | Discord.User | null;
  if (int.inCachedGuild()) target = int.options.getMember("user");
  target ??= int.options.getUser("user") ?? int.user;
  return { image: target.displayAvatarURL({ extension: 'png', size }), name: target.displayName };
}

/** Apply a filter function with parameters. Useful for when there isn't much logic to it */
async function basicFilter(int: Discord.ChatInputCommandInteraction, image: { name: string; img: Jimp; }, filter: string, params?: Record<any, any> | number[]) {
  const { name, img } = image;
  // @ts-ignore
  if (params) img[filter.toLowerCase()](...params);
  // @ts-ignore
  else img[filter.toLowerCase()]();
  const output = await img.getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `${filter} ${name}`);
}

/**
 * For filters like andywarhol and popart, where the image gets pasted 4 times with a bit of space in-between.
 * `run` will be called 4 times and provides an index
 */
function fourCorners(img: Jimp, o: number = 12, run: BasicFilterProcess) {
  const width = img.getWidth(),
    height = img.getHeight(),
    canvas = new Jimp(width * 2 + (o * 3), height * 2 + (o * 3), 0xffffffff),
    positions = [[o, o], [width + (o * 2), o], [o, height + (o * 2)], [width + (o * 2), height + (o * 2)]];

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    run(p[0], p[1], canvas, i);
  }
  return canvas;
}

const andywarhol: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const output = await fourCorners(img, 12, (x, y, c) => {
    img.color([{ apply: ColorActionName.SPIN, params: [60] }]);
    c.blit(img, x, y);
  }).getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `Andywarhol ${name}`);
}

const colorme: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const color = u.rand([45, 90, 135, 180]);
  const output = await img.color([{ apply: ColorActionName.HUE, params: [color] }]).getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `Colorize ${name} (Hue: ${color})`);
}

const deepfry: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const output = await img.posterize(20)
    .color([{ apply: ColorActionName.SATURATE, params: [100] }])
    .contrast(1)
    .getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `Deepfry ${name}`);
}

const flex: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const right = await Jimp.read("./media/flexArm.png");
  const left = right.clone().flip(true, Math.random() > 0.5);
  right.flip(false, Math.random() > 0.5);
  const canvas = new Jimp(368, 128, 0x00000000);
  if (!img.hasAlpha()) img.circle();
  img.resize(128, 128);
  const output = await canvas.blit(left, 0, 4)
    .blit(right, 248, 4)
    .blit(img, 120, 0)
    .getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `Flex ${name}`);
}

const metal: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const right = await Jimp.read('./media/metalHand.png');
  const left = right.clone().flip(true, false);
  const canvas = new Jimp(368, 128, 0x00000000);
  if (!img.hasAlpha()) img.circle();
  img.resize(128, 128);
  const output = await canvas.blit(right, 0, 4)
    .blit(left, 248, 4)
    .blit(img, 120, 0)
    .getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `Metal ${name}`);
}


const personal: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const canvas = await Jimp.read('./media/personalBase.png');
  img.resize(350, 350);
  if (!img.hasAlpha()) img.circle();
  const output = await canvas.blit(img, 1050, 75).getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `${name} took that personally`);
}

async function petpet(int: Discord.ChatInputCommandInteraction) {
  const target = targetImg(int);
  const gif = await petPetGif(target.image);
  return await sendImg(int, gif, `Petpet ${target.name}`, "gif");
}

const popart: FilterFunction = async (int, image) => {
  const { name, img } = image;
  const output = await fourCorners(img, 12, (x, y, c, i) => {
    if (i === 0) img.color([{ apply: ColorActionName.DESATURATE, params: [100] }, { apply: ColorActionName.SATURATE, params: [50] }]);
    else img.color([{ apply: ColorActionName.SPIN, params: [i === 3 ? 120 : 60] }]);
    c.blit(img, x, y);
  }).getBufferAsync(Jimp.MIME_PNG);
  return await sendImg(int, output, `Popart ${name}`);
}

async function avatar(int: Discord.ChatInputCommandInteraction) {
  const targetImage = targetImg(int);
  if (!targetImage) return errorReading(int);
  const format = targetImage.image.includes('.gif') ? 'gif' : 'png';
  return await sendImg(int, targetImage.image, (targetImage.name), format);
}

const Module = new Augur.Module()
.addInteraction({
  name: "avatar",
  id: u.sf.commands.slashAvatar,
  options: { registry: "slashAvatar" },
  process: async (interaction) => {
    await interaction.deferReply();

    const url = targetImg(interaction);
    const img = await jimpRead(url.image);
    if (!img) return errorReading(interaction);
    const i = { name: url.name, img };
    switch (interaction.options.getString('filter')) {
      case "andywarhol": return andywarhol(interaction, i);
      case "colorme": return colorme(interaction, i);
      case "deepfry": return deepfry(interaction, i);
      case "flex": return flex(interaction, i);
      case "metal": return metal(interaction, i);
      case "personal": return personal(interaction, i);
      case "petpet": return petpet(interaction);
      case "popart": return popart(interaction, i);

      // basic filters
      case "fisheye": return basicFilter(interaction, i, 'Fisheye');
      case "invert": return basicFilter(interaction, i, 'Invert');
      case "blur": return basicFilter(interaction, i, 'Blur', [5]);
      case "blurple": return basicFilter(interaction, i, 'Color', [[{ apply: "desaturate", params: [100] }, { apply: "saturate", params: [47.7] }, { apply: "hue", params: [227] }]]);
      case "grayscale": return basicFilter(interaction, i, 'Color', [[{ apply: "desaturate", params: [100] }]]);

      default: return avatar(interaction);
    }
  }
});

module.exports = Module;