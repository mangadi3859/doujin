"use-strict";

const express = require("express");
const nhentai = require("./nhentai");
const app = express();
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "public", "html");

app.set("view engine", "ejs");
app.set("views", ROOT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.all("/public/*", (req, res) => {
    res.redirect("/");
});

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/download", checkId, async (req, res) => {
    const result = await nhentai.test(req.body.id);
    res.render("download", { name: result.title.pretty, image: `<img class="thumbnail" src="https://i.nhentai.net/galleries/${result.media_id}/1.jpg" alt="thumbnail" />` });
});

app.post("/download/isla", (req, res) => {});

app.use((req, res) => {
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log("App listening on port " + PORT);
});

async function checkId(req, res, next) {
    if (!false) return next();
    res.status(404).render("notFound", { id: req.body.id });
}

function checkData(req, res, next) {
    const { buffer } = req.body;
}
