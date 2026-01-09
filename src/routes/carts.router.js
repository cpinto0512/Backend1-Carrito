const express = require("express");
const router = express.Router();

const Cart = require("../models/cart.model");

// Ruta: POST /api/carts/
router.post("/", async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ success: true, cart: newCart });
  } catch (error) {
    console.error("Error al crear carrito en DB:", error);
    res.status(500).json({ error: "No se pudo crear el carrito" });
  }

});

// Ruta: POST /api/carts/:cartID/product/:prodId
router.post("/:cartID/product/:prodId", async (req, res) => {
  try {
    const { cartID, prodId } = req.params;

    const cart = await Cart.findById(cartID);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex((p) => {
      return p.product.equals(prodId)
    });

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: prodId, quantity: 1 });
    }
    await cart.save();
    res.status(200).json({ success: true, cart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

// Ruta: DELETE /api/carts/:cartID/products/:prodId
router.delete("/:cartID/products/:prodId", async (req, res) => {
  try {
    const { cartID, prodId } = req.params;

    // 1. Buscamos el carrito y "tiramos" (pull) el producto del array
    const updatedCart = await Cart.findByIdAndUpdate(
      cartID,
      { $pull: { products: { product: prodId } } },
      { new: true }
    ).populate("products.product");

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.status(200).json({ success: true, message: "Producto eliminado correctamente del carrito", cart: updatedCart });

  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ error: "No se pudo procesar la eliminación" });
  }
});

// Ruta: PUT /api/carts/:cartID
router.put("/:cartID", async (req, res) => {
  try {
    const { cartID } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "El formato de productos es inválido, debe ser un array" });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cartID,
      { products },
      { new: true }
    ).populate("products.product");

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Carrito actualizado correctamente",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Error al reemplazar el carrito:", error);
    res.status(500).json({ error: "No se pudo actualizar el carrito" });
  }
});

// Ruta: PUT /api/carts/:cartID/products/:prodId
router.put("/:cartID/products/:prodId", async (req, res) => {
  try {
    const { cartID, prodId } = req.params;
    const { quantity } = req.body;

    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: "La cantidad debe ser un número mayor a 0" });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: cartID, "products.product": prodId },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    ).populate("products.product");

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito o Producto no encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Cantidad actualizada correctamente",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta: DELETE /api/carts/:cartID
router.delete("/:cartID", async (req, res) => {
  try {
    const { cartID } = req.params;

    const cartVaciado = await Cart.findByIdAndUpdate(
      cartID,
      { $set: { products: [] } },
      { new: true }
    );

    if (!cartVaciado) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Se han eliminado todos los productos del carrito",
      cart: cartVaciado
    });

  } catch (error) {
    console.error("Error al vaciar el carrito:", error);
    res.status(500).json({ error: "No se pudo vaciar el carrito" });
  }
});

// Ruta: GET /api/carts/:cartID
router.get("/:cartID", async (req, res) => {
  try {
    const { cartID } = req.params;
    const cart = await Cart.findById(cartID).populate("products.product");

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = router