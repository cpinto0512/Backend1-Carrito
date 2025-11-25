const express = require("express");
const app = express();
const routes = require ("./routes/index")
const {Server} = require("socket.io")
const fs = require('fs').promises;
const { rutaArchivoDinamic } = require("../config/config");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api",routes)


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
console.log(`esta es la ruta ${paths.view}`)

const getProducts = async () => {
  const pathProducts = rutaArchivoDinamic("products.json");
  const data = await fs.readFile(pathProducts, "utf-8");
  return JSON.parse(data);
};

app.get("/", async (req, res) => {
  try {
  const products = await getProducts();
  return res.render("pages/home", {products})}
  catch (error) {
    return res.status(500).send("Error al obtener los productos");
  }
});

//seteo socket.
const http = require("http")
const server = http.createServer(app)

const io = new Server(server);

io.on("connection",(socket)=>{
  console.log(`Usuario ID: ${socket.id} Conectado!!!`);
  socket.on("disconnect",(data)=>{

  })
})

module.exports = app;