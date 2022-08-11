const express = require("express");
const { Deta } = require("deta");

const deta = Deta(process.env.PROJECT_KEY);
const drive = deta.Drive("arquivos");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/download/:name", async (req, res) => {
  const { name } = req.params;

  await drive.get(name).then(async result => {
    if (result) {
      await result.arrayBuffer().then(data => {
        res.send(Buffer.from(data));
      });
    } else {
      res.redirect("/files");
    }
  });
});

router.get("/files", async (req, res) => {
  await drive.list().then(result => {
    res.render("arquivos", { arquivos: result.names });
  });
});

router.post("/upload", async (req, res) => {
  const { name } = req.files.file;
  const { data: contents } = req.files.file;
  const { mimetype: type } = req.files.file;

  await drive.put(name, { data: contents, contentType: type }).then(() => {
    res.redirect("/files");
  });
});

router.post("/", async (req, res) => {
  if (Object.keys(req.body).toString() === "download") {
    res.redirect(`/download/${req.body.download}`);
  } else {
    await drive.delete(req.body.delete).then(res.redirect("/files"));
  }
});

module.exports = router;
