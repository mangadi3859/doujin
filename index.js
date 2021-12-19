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
    res.status(403).redirect("/");
});

app.get("/", (req, res) => {
    const { query } = req.query;

    res.render("index", { id: query });
});

app.post("/download", checkId, (req, res) => {
    const result = req.nhentai;
    res.render("download", { name: result.title.pretty, id: result.id, image: result.thumb });
});

app.post("/download/isla", checkData, (req, res) => {
    res.set("Content-Disposition", "attachment; filename=" + `[ISLA-DOUJIN] ${req.nhentai.title} - (${req.nhentai.id}).pdf`);
    res.set("Content-Type", "file/pdf");

    nhentai.download(req.nhentai.id, res).catch((err) => {
        console.error(err);
        res.status(500).redirect("/?query=" + req.nhentai.id);
    });
    // res.send(buffer);
});

app.use((req, res) => {
    res.status(404).redirect("/");
});

app.listen(PORT, () => {
    console.log("App listening on port " + PORT);
});

//Custom Middleware
async function checkId(req, res, next) {
    let isValid = await nhentai.test(req.body.id).catch((err) => {
        console.log(err);
        return null;
    });
    if (isValid) {
        req.nhentai = isValid;
        return next();
    } else res.status(404).render("notFound", { id: req.body.id });
}

async function checkData(req, res, next) {
    const { id } = req.body;
    try {
        let res = await nhentai.test(id);
        req.nhentai = { id: res.id, title: res.title.pretty.replace(/[^\w\s\d%.,\-?!+_]/g, "") };
        return next();
    } catch (err) {
        console.error(err);
        res.status(500).redirect("/?query=" + id);
    }
}
