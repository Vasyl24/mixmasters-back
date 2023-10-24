const { HttpError, ctrlWrap, imageDelete } = require("../helpers");
const {
  Recipe,
  CATEGORIES,
  GLASSES,
  schemas,
} = require("../models/recipe.model");
const { Ingredient } = require("../models/ingredient.model");

const SHAPE_RECIPE_BD = {
  drink: 1,
  category: 1,
  alcoholic: 1,
  glass: 1,
  description: 1,
  shortDescription: 1,
  instructions: 1,
  drinkThumb: 1,
  ingredients: 1,
  favorite: 1,
  owner: 1,
  favoritesLength: 1,
};
const SHAPE_RECIPE = Object.keys(SHAPE_RECIPE_BD).join(" ");

const getCategories = async (req, res) => {
  // const result = await Recipe.distinct("category").sort();
  res.json(CATEGORIES);
};
const getIngredients = async (req, res) => {
  const condition = !req.user.isAdult ? "No" : /^(?:Yes\b|No\b)/;
  const result = await Ingredient.find(
    {
      alcohol: condition,
    },
    { title: 1 }
  ).sort();
  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const getGlasses = async (req, res) => {
  // const result = await Recipe.distinct("glass").sort();
  res.json(GLASSES);
};
const getRecipeById = async (req, res) => {
  const { id: recipeId } = req.params;
  const result = await Recipe.findById(recipeId, SHAPE_RECIPE).populate(
    "ingredients.ingredientId",
    "ingredientThumb"
  );
  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const mainPageRecipes = async (req, res) => {
  const condition = !req.user.isAdult
    ? "Non alcoholic"
    : /^(?:Alcoholic\b|Non alcoholic\b)/;

  const { count } = req.query;
  const result = await Recipe.aggregate()
    .match({ alcoholic: condition })
    .addFields({
      favoritesLength: {
        $size: {
          $ifNull: ["$favorite", []],
        },
      },
    })
    .sort({
      category: 1,
      drink: 1,
    })
    .group({
      _id: "$category",
      category: { $first: "$category" },
      favoritesLength: { $first: "$favoritesLength" },
      docs: { $push: "$$ROOT" },
    })
    .project({
      _id: 0,
      category: 1,
      favoritesLength: 1,
      docs: {
        $slice: ["$docs", +count],
      },
    })
    .unwind("$docs")
    .replaceRoot("$docs")
    .project(SHAPE_RECIPE_BD)
    .exec();

  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const popularRecipes = async (req, res) => {
  const condition = !req.user.isAdult
    ? "Non alcoholic"
    : /^(?:Alcoholic\b|Non alcoholic\b)/;

  const result = await Recipe.aggregate()
    .match({ alcoholic: condition, favorite: { $exists: true } })
    .addFields({
      favoritesLength: {
        $size: "$favorite",
      },
    })
    .project(SHAPE_RECIPE_BD)
    .sort({
      favoritesLength: -1,
      drink: 1,
    })
    .exec();

  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const searchRecipes = async (req, res) => {
  let {
    q: keyWord = "",
    page,
    limit,
    category = "",
    ingredient = "",
  } = req.query;
  const condition = !req.user.isAdult
    ? "Non alcoholic"
    : /^(?:Alcoholic\b|Non alcoholic\b)/;

  const ingredients = {};
  if (category) category = category.trim();
  if (ingredient) ingredients.title = ingredient.trim();

  // Count documents and calculating rest pages for front-end pagination
  const count = await Recipe.countDocuments({
    alcoholic: condition,
    drink: {
      $regex: keyWord,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
    ingredients: {
      $elemMatch: {
        title: {
          $regex: ingredient,
          $options: "i",
        },
      },
    },
  }).count("total");
  console.log(count, ingredients);
  const skip = (page - 1) * limit;
  const restPages = !count ? 0 : Math.ceil((count - skip) / limit) - 1;

  const result = await Recipe.aggregate()
    .match({
      alcoholic: condition,
      drink: {
        $regex: keyWord,
        $options: "i",
      },
      category: {
        $regex: category,
        $options: "i",
      },
      ingredients: {
        $elemMatch: {
          title: {
            $regex: ingredient,
            $options: "i",
          },
        },
      },
    })
    .sort({
      drink: 1,
    })
    .skip(+skip)
    .limit(+limit)
    .project(SHAPE_RECIPE_BD)
    .exec();

  if (!result) throw HttpError(404, "Not Found");
  res.json({ count, restPages, result });
};
const getFavoritsRecipes = async (req, res) => {
  const { _id: userId } = req.user;
  const result = await Recipe.find({ favorite: userId }, SHAPE_RECIPE).sort({
    drink: 1,
  });
  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const getOwnRecipes = async (req, res) => {
  const { _id: userId } = req.user;
  const result = await Recipe.find({ owner: userId }, SHAPE_RECIPE).sort({
    drink: 1,
  });
  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const addFavoriteRecipe = async (req, res) => {
  const { _id: userId } = req.user;
  const { id: recipeId } = req.body;
  const result = await Recipe.findByIdAndUpdate(
    recipeId,
    { $addToSet: { favorite: userId } },
    { new: true, select: SHAPE_RECIPE }
  );
  if (!result) throw HttpError(404, "Not Found");
  res.json(result);
};
const removeFavoritRecipe = async (req, res) => {
  const { _id: userId } = req.user;
  const { id: recipeId } = req.body;
  const result = await Recipe.findByIdAndUpdate(
    recipeId,
    {
      $pull: { favorite: userId },
    },
    { new: true, select: SHAPE_RECIPE }
  );

  // remove empty field
  if (result.favorite.length === 0) {
    await Recipe.findByIdAndUpdate(
      recipeId,
      { $unset: { favorite: 1 } },
      { new: true }
    );
  }
  if (!result) throw HttpError(404, "Not Found");
  res.status(204).json();
};
const removeOwnRecipe = async (req, res) => {
  const { _id: userId } = req.user;
  const { id: recipeId } = req.body;
  const doc = await Recipe.findOne({ _id: recipeId, owner: userId });
  if (!doc) throw HttpError(403);
  const resultCloudinary = await imageDelete(doc.drinkThumb);
  if (!resultCloudinary || resultCloudinary.result === "not found")
    throw HttpError(404, "Not Found");
  const result = await Recipe.findByIdAndRemove(recipeId);
  if (!result) throw HttpError(404, "Not Found");
  res.status(204).json();
};
const addOwnRecipe = async (req, res) => {
  const { _id: userId } = req.user;
  let drinkThumb = "";
  const recipeReq = JSON.parse(req.body.recipe);
  const getURL = async (req, res) => {
    drinkThumb = req.file.path;
  };
  if (req.file) getURL(req, res);
  const recipeDB = { ...recipeReq, drinkThumb, owner: userId };

  // validate Recipe object
  const { error } = schemas.addRecipeSchema.validate(recipeDB);
  if (error) throw HttpError(400, error.message);

  // adding new Recipe
  const result = await Recipe.create(recipeDB);
  if (!result) throw HttpError(404, "Not Found");

  res.status(201).json(result);
};

module.exports = {
  getCategories: ctrlWrap(getCategories),
  getIngredients: ctrlWrap(getIngredients),
  getGlasses: ctrlWrap(getGlasses),
  getRecipeById: ctrlWrap(getRecipeById),
  popularRecipes: ctrlWrap(popularRecipes),
  mainPageRecipes: ctrlWrap(mainPageRecipes),
  searchRecipes: ctrlWrap(searchRecipes),
  getFavoritsRecipes: ctrlWrap(getFavoritsRecipes),
  getOwnRecipes: ctrlWrap(getOwnRecipes),
  addFavoriteRecipe: ctrlWrap(addFavoriteRecipe),
  removeFavoritRecipe: ctrlWrap(removeFavoritRecipe),
  removeOwnRecipe: ctrlWrap(removeOwnRecipe),
  addOwnRecipe: ctrlWrap(addOwnRecipe),
};
