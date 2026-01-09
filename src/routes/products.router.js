const express = require("express");
const router = express.Router();

const Product = require("../models/product.model");

const getProducts = async () => {
  return await Product.find({})
};

router.get("/", async (req, res) => {
  try {
    const products = await getProducts();
    console.log("productos obtenido: ",products)
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener los productos de la base de datos:", error);
    res.status(500).json({ error: "No se pudieron cargar los productos" });
  }
});

router.get("/:prodID", async (req, res) => {
  try {
    const productId = req.params.prodID;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener los productos de la base de datos:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productName, productSize,UM, price } = req.body;
    if (!productName || !productSize || !UM || price == null) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    const newProduct = new Product({
      productName,
      productSize,
      UM,
      price,
    });
    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:prodId", async (req, res) => {
  try {
    const { prodId } = req.params;
    const { productName, productSize,UM, price } = req.body;
    if (!prodId) {
      return res.status(400).json({ error: "Falta el ID del producto" });
    }
    if (!productName || !productSize||!UM || typeof price !== "number") {
      return res.status(400).json({ error: "Datos inválidos del producto" });
    }
    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    product.productName = productName;
    product.productSize = productSize;
    product.UM = UM;
    product.price = price;
    await product.save();

    return res.status(200).json({ success: true, product });

  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deleted/:prodId", async (req, res) => {
  try {
    const { prodId } = req.params;
    if (!prodId) {
      return res.status(400).json({ error: "Falta el ID del producto" });
    }

    const product = await Product.findById(prodId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    product.deleted = true;

    await product.save();
    return res.status(200).json({ success: true, product });

  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

module.exports = router;