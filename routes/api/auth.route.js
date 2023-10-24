const express = require("express");
const ctrl = require("../../controllers/auth.controller");

const { validateQuery, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/user.model");

const router = express.Router();

router.post("/signup", validateQuery(schemas.signupSchema), ctrl.signup);
router.post("/signin", validateQuery(schemas.signinSchema), ctrl.signin);
router.post("/signout", authenticate, ctrl.signout);

module.exports = router;
