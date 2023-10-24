const nodemailer = require("nodemailer");
const emailTmpl = require("./emailTmpl");

const { UN_PASS, UN_USER, UN_SERVER, UN_PORT } = process.env;

const sendMail = async (email, name, _id) => {
  const config = {
    host: UN_SERVER,
    port: UN_PORT,
    secure: true,
    auth: {
      user: UN_USER,
      pass: UN_PASS,
    },
  };

  const transporter = nodemailer.createTransport(config);
  const letter = emailTmpl(name, _id);
  const emailOptions = {
    from: UN_USER,
    to: email,
    subject: "Subscription confirm Email",
    html: letter,
  };
  try {
    await transporter.sendMail(emailOptions);
    return;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = sendMail;
