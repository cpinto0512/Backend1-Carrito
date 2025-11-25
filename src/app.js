const express = require("express");
const app = express();
const routes = require ("./routes/index")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api",routes)
app.get("/", (req, res) => {
  res.send("Bienvenido a mi serveer!");
});

//Seteo handlebars
const handlebars = require("express-handlebars")
const {paths} = require("../config/config")
app.engine(
  "hbs",
  handlebars.engine({
    extname:".hbs",
    defaultLayout: "main",
  })
)

app.set("view engine","hbs");
app.set("views",paths.view)

module.exports = app;