const express = require("express");
const router = express.Router();
const { rutaArchivoDinamic } = require("../../config/config");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");


const getProducts = async () => {
  const pathProducts = rutaArchivoDinamic("products.json");
  const data = await fs.readFile(pathProducts, "utf-8");
  return JSON.parse(data);
};

router.get("/", async (req, res) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al leer products.json:", error);
    res.status(500).json({ error: "No se pudieron cargar los productos" });
  }
});

router.get("/:prodID", async (req, res) => {
  try {
    const productId = req.params.prodID;
    const products = await getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al leer products.json:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    const newProduct = {
      id: uuidv4(),
      name,
      price,
    };
    const products = await getProducts();

    products.push(newProduct);
    const pathProducts = rutaArchivoDinamic("products.json");
    await fs.writeFile(
      pathProducts,
      JSON.stringify(products, null, 2),
      "utf-8"
    );
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:prodId", async (req, res) => {
  try {
    const { prodId } = req.params;
    const { name, price } = req.body;
    if (!prodId) {
      return res.status(400).json({ error: "Falta el ID del producto" });
    }
    if (!name || typeof price !== "number") {
      return res.status(400).json({ error: "Datos inválidos del producto" });
    }

    const products = await getProducts();
    const prodIndex = products.findIndex((p) => p.id === prodId);

    if (prodIndex !== -1) {
      products[prodIndex] = {
        id: prodId,
        name,
        price,
      };

      const pathProducts = rutaArchivoDinamic("products.json");
      await fs.writeFile(
        pathProducts,
        JSON.stringify(products, null, 2),
        "utf-8"
      );
      res.status(200).json({ success: true, product: products[prodIndex] });
    } else {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
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

    const products = await getProducts();
    const prodIndex = products.findIndex((p) => p.id === prodId);

    if (prodIndex !== -1) {
      products[prodIndex].deleted = true;
      const pathProducts = rutaArchivoDinamic("products.json");
      await fs.writeFile(
        pathProducts,
        JSON.stringify(products, null, 2),
        "utf-8"
      );
      res.status(200).json({ success: true, product: products[prodIndex] });
    } else {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).send("Error al eliminar producto");
  }
});

module.exports = router;