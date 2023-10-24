const cloudinary = require("cloudinary").v2;
const { Ingredient } = require("../models/ingredient.model");
const fs = require("fs");
const path = require("path");

// шлях до папки з зображеннями
const folderPath = path.join(__dirname, "./images/ingredient");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadFileToCloudinary = async (filePath, file) => {
  try {
    // записуються файли у папку drinks зі своїм оригінальним імʼям
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "ingredients",
      public_id: file.replace(" ", "20"),
      use_filename: true,
      unique_filename: false,
    });
    console.log(`File ${filePath} uploaded to URL:`);
    console.warn(result.url);
  } catch (err) {
    console.error(`Failed to upload ${filePath}. Error: ${err.message}`);
  }
};

// мені зручно робити контрольвані дії, тому я додаю тимчасову логіку зазвичай в якийсь публічний ендпоінт і за потреби активую виклик через постмен

const getIngredients = async (req, res) => {
  // 1 этап. Всі файли з твоєї локальної папки витягуються і відправляються на завантаження в клаудинарій

  const files = fs.readdirSync(folderPath);
  let counter = files.length;
  for (let file of files) {
    console.log(counter--);
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isFile()) {
      file = file.replace(/\.[^/.]+$/, "");
      await uploadFileToCloudinary(fullFilePath, file);
    }
  }

  // 2 этап. Оновлюєш усі елементи колекції. Для цього слід піти в cloudinary, зайти в папку drinks і скопіювати url будь-якого зображення. Після чого частину без назви файлу слід додати в наступний код

  // const updateResult = await Ingredient.updateMany({}, [
  //   {
  //     $set: {
  //       ingredientThumb: {
  //         $concat: [
  //           "https://res.cloudinary.com/dotun1fbg/image/upload/v1696062147/ingredients/", // your base URL
  //           { $arrayElemAt: [{ $split: ["$ingredientThumb", "/"] }, -1] },
  //         ],
  //       },
  //       "thumb-medium": {
  //         $concat: [
  //           "https://res.cloudinary.com/dotun1fbg/image/upload/v1696062147/ingredients/", // your base URL
  //           { $arrayElemAt: [{ $split: ["$thumb-medium", "/"] }, -1] },
  //         ],
  //       },
  //       "thumb-small": {
  //         $concat: [
  //           "https://res.cloudinary.com/dotun1fbg/image/upload/v1696062147/ingredients/", // your base URL
  //           { $arrayElemAt: [{ $split: ["$thumb-small", "/"] }, -1] },
  //         ],
  //       },
  //     },
  //   },
  // ]);
  // res.json({});
};

module.exports = getIngredients;
