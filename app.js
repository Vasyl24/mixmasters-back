const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const authRouter = require("./routes/api/auth.route");
const usersRouter = require("./routes/api/users.route");
const filtersRouter = require("./routes/api/filters.route");
const recipesRouter = require("./routes/api/recipes.route");
const { HttpError } = require("./helpers");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/filters", filtersRouter);
app.use("/api/drinks", recipesRouter);

// Error handler
app.use((req, res, next) => {
  next(HttpError(404));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Internal Server Error" } = err;
  res.status(status).json({ message });
});

module.exports = app;
