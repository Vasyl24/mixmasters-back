const jimp = require("jimp");
const JIMP_QUALITY = 70;

const imageResize = async (imageUri) => {
  const image = await jimp.read(imageUri);
  await image.resize(250, 250);
  await image.quality(JIMP_QUALITY);
  await image.writeAsync(imageUri);
};

module.exports = imageResize;
