const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const imageDelete = async (drinkThumb) => {
  try {
    const urlParts = drinkThumb.split("/");
    const publicImageId = urlParts[urlParts.length - 2]
      .concat("/", urlParts[urlParts.length - 1])
      .split(".")[0];
    if (publicImageId) {
      return cloudinary.uploader.destroy(publicImageId);
    }
  } catch (err) {
    return false;
  }
};

module.exports = imageDelete;
