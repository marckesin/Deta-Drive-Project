require("dotenv").config();
const express = require("express");
const upload = require("express-fileupload");
const compression = require("compression");
const createError = require("http-errors");
const path = require("path");

const port = process.env.PORT || 3000;
const indexRouter = require("./routes/index");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  upload({
    debug: false,
    preserveExtension: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());

app.use("/", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

app.listen(port);

// module.exports = app;
