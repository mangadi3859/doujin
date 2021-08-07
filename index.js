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
//app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.all("/public/*", (req, res) => {
    res.redirect("/download");
});

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/download", checkId, (req, res) => {
    res.render("download");
});

app.use((req, res) => {
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log("App listening on port " + PORT);
});

async function checkId(req, res, next) {
    if (await nhentai.test(req.body.id)) return next();
    res.redirect("/");
    alert("Cannot find the ID");
}
