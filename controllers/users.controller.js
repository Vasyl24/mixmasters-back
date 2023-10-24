const { ctrlWrap, sendMail, HttpError } = require("../helpers");
const { User } = require("../models/user.model");

const getCurrent = async (req, res) => {
  const {
    _id,
    name,
    email,
    birthdate,
    isAdult,
    avatarURL,
    subscription,
    createdAt,
  } = req.user;

  res.json({
    _id,
    name,
    email,
    birthdate,
    isAdult,
    avatarURL,
    subscription,
    createdAt,
  });
};

const subscribeEmail = async (req, res) => {
  const { _id, name } = req.user;
  const { subscription } = req.body;
  const userWithSameSubscription = await User.findOne({
    email: subscription,
    _id: { $ne: _id },
  });

  if (userWithSameSubscription)
    throw HttpError(422, "You can't use this e-mail address");
  await User.findByIdAndUpdate(_id, { subscription });
  await sendMail(subscription, name, _id);
  res.json({ _id, subscription });
};

const unsubscribeEmail = async (req, res) => {
  const { mail } = req.params;
  await User.findByIdAndUpdate(mail, { subscription: null });
  res.redirect(process.env.HOME_PAGE);
};

const updateUser = async (req, res) => {
  let { _id, avatarURL } = req.user;
  let { name } = req.body;
  if (!name) {
    name = req.user.name;
  }
  const getURL = async (req, res) => {
    avatarURL = req.file.path;
  };
  if (req.file) getURL(req, res);
  await User.findByIdAndUpdate(_id, { name, avatarURL });
  res.json({ name, avatarURL });
};

module.exports = {
  getCurrent: ctrlWrap(getCurrent),
  subscribeEmail: ctrlWrap(subscribeEmail),
  unsubscribeEmail: ctrlWrap(unsubscribeEmail),
  updateUser: ctrlWrap(updateUser),
};
