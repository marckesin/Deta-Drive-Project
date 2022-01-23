require("dotenv").config();
const { Deta } = require("deta");
const express = require("express");
const upload = require("express-fileupload");
const path = require("path");

const port = process.env.PORT || 3000;
const deta = Deta(process.env.PROJECT_KEY);
const drive = deta.Drive("arquivos");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(upload());
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.render("index");
});

app.get("/download/:name", async (req, res) => {
    const name = req.params.name;
    const img = await drive.get(name);
    const buffer = await img.arrayBuffer();
    res.send(Buffer.from(buffer));
});

app.get("/files", async (req, res) => {
    await drive.list()
        .then(result => res.send(result.names));
});

app.post("/upload", async (req, res) => {
    const name = req.files.file.name;
    const contents = req.files.file.data;
    const img = await drive.put(name, { data: contents });
    res.send(img);
});

app.listen(port);

module.exports = app