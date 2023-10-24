const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { HttpError, ctrlWrap, isUserAdult } = require("../helpers");
const { User } = require("../models/user.model");

const { SECRET_KEY } = process.env;
const TOKENEXPIRE = "22d";

const signup = async (req, res) => {
  const { name, email, birthdate, password } = req.body;

  // checking if user exist
  const user = await User.findOne({ email });
  if (user) throw HttpError(409, "Email in use");

  // create user
  const isAdult = isUserAdult(birthdate);
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, {
    protocol: "https",
    s: "250",
    d: "wavatar",
  });
  const { _id: userId, createdAt } = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    isAdult,
  });
  const payload = { id: userId };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKENEXPIRE });
  await User.findByIdAndUpdate(userId, { token });

  res.status(201).json({
    token,
    user: {
      _id: userId,
      name,
      email,
      birthdate,
      isAdult,
      avatarURL,
      createdAt,
    },
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // checking if user exist
  if (!user) throw HttpError(401, "Email is wrong");

  // checking user password
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) throw HttpError(401, "Password is wrong");

  // checking if user token expired
  jwt.verify(user.token, SECRET_KEY, (err, decoded) => {
    if (err?.message === "jwt expired") {
      user.token = null;
    }
  });

  // create jwt token and login user

  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKENEXPIRE });
  const { _id, subscription, name, avatarURL, birthdate, createdAt } = user;
  const isAdult = isUserAdult(birthdate);
  await User.findByIdAndUpdate(_id, {
    token,
    isAdult,
  });

  res.json({
    token,
    user: {
      _id,
      name,
      email,
      birthdate,
      isAdult,
      avatarURL,
      subscription,
      createdAt,
    },
  });
};

const signout = async (req, res) => {
  const { _id: userId } = req.user;
  await User.findByIdAndUpdate(userId, { token: null });
  res.status(204).json();
};

module.exports = {
  signup: ctrlWrap(signup),
  signin: ctrlWrap(signin),
  signout: ctrlWrap(signout),
};
