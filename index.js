require("dotenv").config();
const { Deta } = require("deta");
const express = require("express");
const upload = require("express-fileupload");
const compression = require("compression");
const createError = require("http-errors");
const path = require("path");

const port = process.env.PORT || 3000;
const deta = Deta(process.env.PROJECT_KEY);
const drive = deta.Drive("arquivos");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(upload());
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());

app.get('/', (req, res) => {
  res.render("index");
});

app.get("/download/:name", async (req, res) => {
  const name = req.params.name;
  // const img = await drive.get(name);
  // const buffer = await img.arrayBuffer();

  // res.send(Buffer.from(buffer));

  // await drive.get(name)
  //   .then(async (result) => {
  //     await result.arrayBuffer()
  //       .then(data => {
  //         res.send(Buffer.from(data))
  //       });
  //   });

  await drive.get(name)
    .then(async (result) => {
      if (result) {
        await result.arrayBuffer()
          .then(data => {
            res.send(Buffer.from(data));
          })
      } else {
        res.redirect("/files");
      }
    });

});

app.get("/files", async (req, res) => {
  await drive.list()
    .then(result => {
      res.render("arquivos", { arquivos: result.names });
    });
});

app.post("/upload", async (req, res) => {
  const name = req.files.file.name;
  const contents = req.files.file.data;

  await drive.put(name, { data: contents })
    .then(() => {
      res.redirect("/files");
    });

});

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

module.exports = app