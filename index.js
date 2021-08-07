"use-strict";

//Library
const express = require("express");
const nhentai = require("./nhentai");
const app = express();
const path = require("path");

//Constant Variables & Global Variables
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "public", "html");

//Middleware
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

app.post("/download", checkId, (req, res) => {
    const result = req.nhentai;
    res.render("download", { name: result.title.pretty, id: result.id });
});

app.post("/download/isla", checkData, (req, res, next) => {
    res.set("Content-Disposition", "attachment; filename=" + req.nhentai.id + ".zip");
    res.set("Content-Type", "file/zip");
    let buffer = req.nhentai.buffer;
    res.status(200).send(buffer);
    next();
});

app.use((req, res) => {
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log("App listening on port " + PORT);
});

//Custom Middleware
async function checkId(req, res, next) {
    let isValid = await nhentai.test(req.body.id).catch(() => null);
    if (isValid) {
        req.nhentai = isValid;
        return next();
    } else res.status(404).render("notFound", { id: req.body.id });
}

async function checkData(req, res, next) {
    const { id } = req.body;
    try {
        let res = await nhentai.download(id);
        req.nhentai = { id: res.id, buffer: res.buffer };
        return next();
    } catch (err) {
        res.redirect("/");
    }
}
