const addButton = document.getElementById("add-product-tab");
const updateButton = document.getElementById("update-product-tab");
const selectProductBlock = document.getElementById("select-product-block");
const selectProduct = document.getElementById("select-product");
const formTitle = document.getElementById("form-title");
const formSubmitButton = document.getElementById("form-submit-button");
const priceInput = document.getElementById("price");
const titleInput = document.getElementById("title");
const stockInput = document.getElementById("stock");
const skuInput = document.getElementById("sku");
const skuLabel = document.getElementById("sku-label");
const productTableBody = document.getElementById("product-table-body");
const clearProductsButton = document.getElementById("clear-products");
const itemCountBadge = document.getElementById("items-count-badge");
const loader = document.getElementById("loader-row");
let loading = false;
let products = [];

const ACTIONS = {
  EDIT: "edit",
  DELETE: "delete",
};

const saveProducts = () => {
  localStorage.setItem("products", JSON.stringify(products));
};

const getSavedProducts = () => {
  return JSON.parse(localStorage.getItem("products"));
};

const findProductBySku = (sku) => {
  return products.find((product) => product.sku == sku);
};

const clearForm = () => {
  titleInput.value = "";
  priceInput.value = "";
  stockInput.value = "";
  skuInput.value = "";
  selectProduct.value = "";
};

const getFormProduct = () => ({
  title: titleInput.value,
  price: priceInput.value,
  stock: stockInput.value,
  sku: skuInput.value,
});

const isFormIncomplete = () => {
  return (
    titleInput.value === "" ||
    priceInput.value === "" ||
    stockInput.value === "" ||
    skuInput.value === ""
  );
};

const setMode = (isUpdate) => {
  updateButton.dataset.active = isUpdate;
  addButton.dataset.active = !isUpdate;
  updateUI();
};

const fetchData = async () => {
  const savedProducts = getSavedProducts();

  if (savedProducts?.length > 0) {
    products = savedProducts;
    loading = false;
    renderProducts();
    return;
  }
  loading = true;
  renderProducts();
  const res = await fetch(
    "https://dummyjson.com/products?limit=10&skip=30&select=title,price,stock,sku",
  );

  const data = await res.json();
  products = data.products;

  saveProducts();
  loading = false;
  renderProducts();
};

const updateUI = (product) => {
  const isUpdateMode = updateButton.dataset.active === "true";

  formTitle.innerText = isUpdateMode ? "Update Product" : "Add New Product";

  formSubmitButton.innerText = isUpdateMode ? "Update Product" : "Add Product";

  selectProductBlock.classList.toggle("hidden", !isUpdateMode);
  selectProductBlock.classList.toggle("flex", isUpdateMode);

  skuInput.classList.toggle("hidden", isUpdateMode);
  skuLabel.classList.toggle("hidden", isUpdateMode);

  if (!product) {
    clearForm();
    return;
  }

  titleInput.value = product.title;
  priceInput.value = product.price;
  stockInput.value = product.stock;
  skuInput.value = product.sku;
  selectProduct.value = product.sku;
};

const renderProducts = () => {
  if (loading) {
    productTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center">
          
<div role="status" class="w-full flex items-center justify-center">
   <div
  class="w-8 h-8 border-4 border-gray-300 border-t-[var(--primary)] rounded-full animate-spin"
></div>
</div>

        </td>
      </tr>
    `;
    return;
  }
  itemCountBadge.innerText = `${products.length} items`;

  productTableBody.innerHTML = products
    .map(
      (product, index) => `
        <tr
          class="text-[#1e3057dd] text-center text-sm hover:bg-[#edeef0c4]"
        >
          <td class="py-3 mb-1">${index + 1}</td>
          <td class="py-3 mb-1 text-left">${product.title}</td>
          <td class="py-3 mb-1 text-left">${product.price}</td>
          <td class="py-3 mb-1">${product.stock}</td>
          <td class="py-3 mb-1">${product.sku}</td>
          <td class="py-3 mb-1 flex gap-1 items-center justify-center">
            <i
              id="${product.sku}-edit"
              data-lucide="pencil"
              data-action="${ACTIONS.EDIT}"
              class="h-5 text-blue-700 cursor-pointer hover:scale-110 transition ease-in-out duration-150"
            ></i>

            <i
              id="${product.sku}-delete"
              data-lucide="trash-2"
              data-action="${ACTIONS.DELETE}"
              class="text-red-500 h-5 cursor-pointer hover:scale-110 transition ease-in-out duration-150"
            ></i>
          </td>
        </tr>
      `,
    )
    .join("");

  selectProduct.innerHTML =
    '<option value="">Select Product</option>' +
    products
      .map(
        (product) => `<option value="${product.sku}">${product.title}</option>`,
      )
      .join("");

  lucide.createIcons();
};

const addProduct = (product) => {
  products.push(product);
  saveProducts();
  renderProducts();
};

const updateProduct = (updatedProduct) => {
  products = products.map((product) =>
    product.sku == updatedProduct.sku
      ? { id: product.id, ...updatedProduct }
      : product,
  );

  saveProducts();
  renderProducts();
};

const deleteProduct = (sku) => {
  products = products.filter((product) => product.sku != sku);

  saveProducts();
  renderProducts();
};
const hasNegativeValues = () => {
  return Number(priceInput.value) < 0 || Number(stockInput.value) < 0;
};
addButton.addEventListener("click", () => {
  setMode(false);
});

updateButton.addEventListener("click", () => {
  setMode(true);
});

productTableBody.addEventListener("click", (e) => {
  const icon = e.target.closest("[data-lucide]");

  if (!icon) return;

  if (icon.dataset.action === ACTIONS.EDIT) {
    setMode(true);

    const editProductId = icon.id.slice(0, -5);
    const productToUpdate = findProductBySku(editProductId);

    updateUI(productToUpdate);
    return;
  }

  const deleteProductId = icon.id.slice(0, -7);
  deleteProduct(deleteProductId);
});

formSubmitButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (updateButton.dataset.active === "true") {
    if (isFormIncomplete()) {
      alert("Please fill all the inputs!");
      return;
    }

    if (hasNegativeValues()) {
      alert("Price and Stock cannot be less than 0!");
      return;
    }

    if (selectProduct.value === "") {
      alert("Please select a product first!");
      return;
    }

    const updatedProduct = getFormProduct();

    updateProduct(updatedProduct);
    clearForm();

    return;
  }

  if (isFormIncomplete()) {
    alert("Please enter valid inputs!");
    return;
  }
  if (hasNegativeValues()) {
    alert("Price and Stock cannot be less than 0!");
    return;
  }
  const productToAdd = getFormProduct();

  const exists = products.some((product) => product.sku == productToAdd.sku);

  if (exists) {
    alert("Product with this SKU exists already!!");
    return;
  }

  addProduct(productToAdd);
});

clearProductsButton.addEventListener("click", () => {
  localStorage.removeItem("products");

  products = [];

  clearForm();
  renderProducts();
});

selectProduct.addEventListener("change", (e) => {
  const productSku = e.target.value;

  if (!productSku) {
    updateUI({});
    return;
  }

  const selectedProduct = findProductBySku(productSku);
  updateUI(selectedProduct);
});

fetchData();
renderProducts();
lucide.createIcons();
