const ctrlWrap = (ctrl) => {
  const foo = async (req, res, next) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      if (error.message.includes("E11000")) {
        error.message = "Field drink must have a unique value.";
      }
      next(error);
    }
  };
  return foo;
};

module.exports = ctrlWrap;
