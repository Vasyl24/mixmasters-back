const express = require("express");
const ctrl = require("../../controllers/recipes.controller");

const {
  isValidID,
  authenticate,
  validateQuery,
  upload,
} = require("../../middlewares");
const { schemas } = require("../../models/recipe.model");

const router = express.Router();

// эти роуты для автоматической загрузки базы изображений и апдейта базы данных

// const getDrinks = require("../../temp/drinks");
// const getIngredients = require("../../temp/ingrids");
// router.get("/updateRecipes", authenticate, getDrinks);
// router.get("/updateIngredients", authenticate, getIngredients);

router.get(
  "/mainpage",
  authenticate,
  validateQuery(schemas.countRecipesSchema),
  ctrl.mainPageRecipes
);
router.get("/popular", authenticate, ctrl.popularRecipes);
router.get(
  "/search",
  authenticate,
  validateQuery(schemas.searchRecipeSchema),
  ctrl.searchRecipes
);
router.get("/favorite", authenticate, ctrl.getFavoritsRecipes);
router.post(
  "/favorite/add",
  authenticate,
  validateQuery(schemas.addDeleteIdSchema),
  ctrl.addFavoriteRecipe
);
router.delete(
  "/favorite/remove",
  authenticate,
  validateQuery(schemas.addDeleteIdSchema),
  ctrl.removeFavoritRecipe
);
router.get("/own", authenticate, ctrl.getOwnRecipes);
router.post(
  "/own/add",
  authenticate,
  upload.single("cocktail"),
  ctrl.addOwnRecipe
);
router.delete("/own/remove", authenticate, ctrl.removeOwnRecipe);
router.get("/:id", authenticate, isValidID, ctrl.getRecipeById);

module.exports = router;
