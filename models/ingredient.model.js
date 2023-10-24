const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

// Mongoose schema-model
const ingredientDBSchema = new Schema(
  {
    title: {
      type: String,
    },
    ingredientThumb: {
      type: String,
    },
    "thumb-medium": {
      type: String,
    },
    "thumb-small": {
      type: String,
    },
    abv: {
      type: String,
    },
    alcohol: {
      type: String,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
    },
    flavour: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

ingredientDBSchema.post("save", handleMongooseError);

const Ingredient = model("ingredient", ingredientDBSchema);

module.exports = { Ingredient };
