const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

const EMAILPATTERN = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const BIRTHDAYPATTERN =
  /^([1-2][0-9]|[0][1-9]|[3][0-1])[/]([0][1-9]|[1][0-2])[/][1-9][0-9][0-9]{2}$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
      requred: [true, "Username is required"],
    },
    birthdate: {
      type: String,
      match: BIRTHDAYPATTERN,
      default: null,
      requred: [true, "Birthdate is required"],
    },
    isAdult: {
      type: Boolean,
    },
    email: {
      type: String,
      match: EMAILPATTERN,
      unique: true,
      requred: [true, "Email is required"],
    },
    password: {
      type: String,
      minlength: 6,
      requred: [true, "Password is required"],
    },
    avatarURL: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    subscription: {
      type: String,
      match: EMAILPATTERN,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

// Joi validation

const signupSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "any.required": `missing required field name`,
    "string.min": `Name must be at least 3 symbol length`,
  }),
  birthdate: Joi.string().pattern(BIRTHDAYPATTERN).required().messages({
    "string.base": `The birthday must be a string`,
    "any.required": `The birthday field is required`,
    "string.empty": `The birthday must not be empty`,
    "string.pattern.base": `The birthday must be in format DD-MM-YYYY`,
  }),
  email: Joi.string().pattern(EMAILPATTERN).required().messages({
    "string.base": `The email must be a string`,
    "any.required": `The email field is required`,
    "string.empty": `The email must not be empty`,
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": `missing required field password`,
    "string.min": `Password must be at least 6 symbol length`,
  }),
});

const signinSchema = Joi.object({
  email: Joi.string().pattern(EMAILPATTERN).required().messages({
    "any.required": `missing required field email`,
    "string.pattern.base": `wrong email`,
  }),
  password: Joi.string().required().messages({
    "any.required": `missing required field password`,
    "string.min": `Password must be at least 6 symbol length`,
  }),
});

const verifyEmailSchema = Joi.object({
  subscription: Joi.string().pattern(EMAILPATTERN).required().messages({
    "any.required": `missing required field subscription`,
    "string.pattern.base": `wrong email`,
  }),
});

const verifyNameSchema = Joi.object({
  name: Joi.string().min(3).allow("").messages({
    "string.empty": `field name is not allowed to be empty`,
    "any.required": `missing required field name`,
    "string.min": `Name must be at least 3 symbol length`,
  }),
  avatar: Joi.string().allow("").messages({
    "string.empty": `field avatar is not allowed to be empty`,
    "any.required": `missing required field avatar`,
  }),
});

const schemas = {
  signupSchema,
  signinSchema,
  verifyEmailSchema,
  verifyNameSchema,
};

module.exports = { User, schemas };
