const express = require("express");
const app = express();
const routes = require("./routes/index")
const { Server } = require("socket.io")
const fs = require('fs').promises;
const { rutaArchivoDinamic, paths } = require("../config/config");
const mongoose = require("mongoose")
const Product = require("../src/models/product.model"); // Aquí importas el modelo Product
const path = require("path");



mongoose
  .connect("mongodb+srv://backend-I-db-coder:JIqLR0kfBXd3wbBO@backend-coderhouse.crmmri2.mongodb.net/Backend-1?appName=Backend-CoderHouse")
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((error) => console.log(error))


const seedProducts = async () => {
  try {
    const pathProducts = rutaArchivoDinamic("products.json");
    const data = await fs.readFile(pathProducts, "utf-8");
    const products = JSON.parse(data);

    // Insertar los productos en la colección 'products'
    await Product.insertMany(products); // Mongoose lo insertará en la colección 'products'
    console.log("Productos insertados correctamente");
  } catch (error) {
    console.error("Error al poblar MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
};


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes)


//Seteo handlebars
const handlebars = require("express-handlebars")

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
  })
)

app.set("view engine", "hbs");
app.set("views", paths.view)
console.log(`esta es la ruta ${paths.view}`)

app.use(express.static(paths.public));

const getProducts = async () => {
  try {
    const products = await Product.find({ deleted: false }).lean(); // Obtener solo los productos no eliminados
    return products;
  } catch (error) {
    console.error("Error al obtener productos desde MongoDB:", error);
    return [];
  }
};

app.get("/", async (req, res) => {
  try {
    const products = await getProducts();
    return res.render("pages/home", { products })
  }
  catch (error) {
    return res.status(500).send("Error al obtener los productos");
  }
});

app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await getProducts();
    console.log(products)
    return res.render("pages/realTimeProducts", { products })
  }
  catch (error) {
    return res.status(500).send("Error al obtener los productos");
  }
});

/*
app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find({ deleted: false }); // Filtra los productos que no están eliminados
    res.render("realTimeproducts", { products });  // Aquí 'realTimeproducts' es tu archivo .hbs
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.render("realTimeproducts", { products: [] });  // En caso de error, pasar un array vacío
  }
});
*/
//seteo socket.
const http = require("http");

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`Usuario ID: ${socket.id} Conectado!!!`);

  socket.on("nuevoProducto", async (data) => {
    const { name, price } = data;
    console.log("Producto recibido:", name, price);
    io.emit("productoAgregado", { success: true, product: { name, price } });
  });


  socket.on("disconnect", (data) => {
    console.log("--->", data);
    console.log("cliente desconectado:", socket.id)
  })
})


module.exports = server;