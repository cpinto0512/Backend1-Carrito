const socket = io();
const btnAgregarProductos = document.getElementById("btnAgregarProductos")
const productsContainer = document.getElementById("products-container")

let products = [];

const getProducts = async () => {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();
    console.log("productos recibidos del servidor",products);
    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};

const addProduct = async (productName,productSize,UM, price) => {
    const newProduct = {
        productName,
        productSize,
        UM,
        price,
    };

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newProduct),
        });

        if (!response.ok) {
            throw new Error("Error al agregar el producto");
        }

        const result = await response.json();
        console.log("Producto agregado:", result.product);
    } catch (error) {
        console.error("Error al agregar el producto:", error);
    }
};

const actualizarProductsContainer = (products) => {
  products.forEach((product) => {
    const productHTML = `
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${product.productName}</h5>
            <p class="card-text">Precio: $${product.price}</p>
          </div>
        </div>
      </div>
    `;
    productsContainer.insertAdjacentHTML('beforeend', productHTML);
  });
};

btnAgregarProductos.addEventListener("click", (e) => {
    e.preventDefault();

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: true
    });
    swalWithBootstrapButtons.fire({
        title: "Añadir productos",
        html: `
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; width: 100%;">

      <!-- Primera fila: Nombre -->
      <div style="max-width: 100%;">
        <input type="text" id="swal-input-name" class="swal2-input" placeholder="Nombre" style="width: 100%; box-sizing: border-box;" />
      </div>
      
      <!-- Segunda fila: Tamaño en gramos y Desplegable (alineados) -->
      <div style="display: flex; gap: 10px; width: 100%; align-items: center;">
        <input type="text" id="swal-input-size" class="swal2-input" placeholder="Tamaño del producto" style="flex: 1; padding: 5px; box-sizing: border-box;" />
        <select id="swal-select-unit" class="swal2-input" style="flex: 1; height: 40px; padding: 5px 10px; box-sizing: border-box; border: 1px solid #dcdcdc; border-radius: 5px;">
          <option value="g">g</option>
          <option value="kg">kg</option>
        </select>
      </div>

      <!-- Tercera fila: Precio -->
      <div style="max-width: 100%;">
        <input type="text" id="swal-input-price" class="swal2-input" placeholder="Precio" style="width: 100%; box-sizing: border-box;" />
      </div>

    </div>
      `,
        showCancelButton: true,
        confirmButtonText: "Yes, add it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            const name = document.getElementById('swal-input-name').value;
            const size = document.getElementById('swal-input-size').value;
            const unit = document.getElementById('swal-select-unit').value;
            const price = document.getElementById('swal-input-price').value;

            /* Validación de los datos
            if (!name || name.trim() === "" || isNaN(price) || price <= 0) {
                swalWithBootstrapButtons.fire({
                    title: "Error",
                    text: "Por favor, ingresa un nombre válido y un precio mayor que 0.",
                    icon: "error",
                });
            } else {*/
            addProduct(name,size, unit, price);
            swalWithBootstrapButtons.fire({
                title: "Added!",
                text: `El producto "${name} ${size}${unit}" fue añadido con éxito. Precio: S/${price}`,
                icon: "success",
            });
            socket.emit("nuevoProducto", { name, price });
            //}
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Si el usuario cancela
            swalWithBootstrapButtons.fire({
                title: "Cancelled",
                text: "No añadiste ningún producto :)",
                icon: "error"
            });
        }
    });
})

socket.on("productoAgregado", async (data) => {
    if (data.success) {
        const products = await getProducts();
        productsContainer.innerHTML = "";
        actualizarProductsContainer(products)
    }
});