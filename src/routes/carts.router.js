const express = require("express");
const router = express.Router();
const { rutaArchivoDinamic } = require("../../config/config");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

const getCarts = async () => {
  const pathCarts = rutaArchivoDinamic("carts.json");
  const data = await fs.readFile(pathCarts, "utf-8");
  return JSON.parse(data);
};

router.post("/api/carts", async (req, res) => {
  try {
    const carts = await getCarts();

    const newCart = {
      id: uuidv4(),
      products: [],
    };

    carts.push(newCart);

    const pathCarts = rutaArchivoDinamic("carts.json");
    await fs.writeFile(pathCarts, JSON.stringify(carts, null, 2), "utf-8");

    res.status(201).json({ success: true, cart: newCart });
  } catch (error) {
    console.error("Error al crear carrito:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/carts/:cartID", async (req, res) => {
  try {
    const { cartID } = req.params;
    const carts = await getCarts();
    const cart = carts.find((c) => c.id === cartID);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error al encontrar el carrito", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/carts/:cartID/product/:pid", async (req, res) => {
  try {
    const { cartID, pid } = req.params;

    const carts = await getCarts();
    const cart = carts.find((c) => c.id === cartID);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const products = await getProducts();
    const product = products.find((p) => p.id === pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    cart.products = cart.products || [];

    const cartItem = cart.products.find((p) => p.id === pid);

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.products.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    const pathCarts = rutaArchivoDinamic("carts.json");
    await fs.writeFile(pathCarts, JSON.stringify(carts, null, 2), "utf-8");

    res.status(201).json({ success: true, cart });
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports=router