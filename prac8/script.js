const form = document.getElementById("productForm");

const productId = document.getElementById("productId");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const descriptionInput = document.getElementById("description");

const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");

const rows = document.getElementById("productRows");
const search = document.getElementById("search");
const status = document.getElementById("status");

let products = [];


// Show message
function notify(message, type = "success") {

    status.textContent = message;
    status.className = "status " + type;
    status.style.display = "block";

    setTimeout(() => {
        status.style.display = "none";
    }, 3000);
}


// Currency
function money(value) {

    return "₹" + Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


// Security: escape HTML
function safe(value) {

    return String(value)
        .replace(/[&<>"']/g, function (char) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];

        });
}


// Product icon
function productIcon(category) {

    if (category === "Computer") {
        return "💻";
    }

    if (category === "Mobile") {
        return "📱";
    }

    if (category === "Accessories") {
        return "⌨️";
    }

    return "📦";
}


// Icon class
function iconClass(category) {

    if (category === "Mobile") {
        return "mobile";
    }

    if (category === "Accessories") {
        return "accessory";
    }

    return "";
}


// Load products from database
async function loadProducts() {

    try {

        const response = await fetch("/api/products");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load products.");
        }

        products = data;

        render();

    } catch (error) {

        console.error(error);

        rows.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Unable to load products.
                </td>
            </tr>
        `;

        notify(error.message, "error");
    }
}


// Render products
function render() {

    const query = search.value.trim().toLowerCase();

    const shown = products.filter(product => {

        const text =
            product.name +
            " " +
            product.category +
            " " +
            (product.description || "");

        return text.toLowerCase().includes(query);
    });


    if (shown.length === 0) {

        rows.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No products match your search.
                </td>
            </tr>
        `;

    } else {

        rows.innerHTML = shown.map(product => {

            return `
                <tr data-id="${product.id}">

                    <td>

                        <div class="product-cell">

                            <div class="product-icon ${iconClass(product.category)}">
                                ${productIcon(product.category)}
                            </div>

                            <div>

                                <div class="product-name">
                                    ${safe(product.name)}
                                </div>

                                <div class="description">
                                    ${safe(product.description || "No description")}
                                </div>

                            </div>

                        </div>

                    </td>


                    <td>
                        <span class="category">
                            ${safe(product.category)}
                        </span>
                    </td>


                    <td class="money">
                        ${money(product.price)}
                    </td>


                    <td>

                        <span class="stock ${Number(product.quantity) < 5 ? "low" : ""}">

                            <span class="dot"></span>

                            ${product.quantity} units

                        </span>

                    </td>


                    <td>

                        <div class="row-buttons">

                            <button
                                class="edit"
                                onclick="editRow(${product.id})"
                            >
                                ✎ Edit
                            </button>

                            <button
                                class="delete"
                                onclick="deleteRow(${product.id})"
                            >
                                ✕ Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
    }


    // Metrics

    document.getElementById("totalProducts").textContent =
        products.length;


    const totalUnits = products.reduce(
        (sum, product) =>
            sum + Number(product.quantity),
        0
    );

    document.getElementById("totalUnits").textContent =
        totalUnits.toLocaleString("en-IN");


    const totalValue = products.reduce(
        (sum, product) =>
            sum +
            Number(product.price) *
            Number(product.quantity),
        0
    );


    document.getElementById("totalValue").textContent =
        totalValue >= 100000
            ? "₹" + (totalValue / 100000).toFixed(2) + "L"
            : money(totalValue);


    document.getElementById("countBadge").textContent =
        String(products.length).padStart(2, "0") + " ITEMS";
}


// Add / Update
form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const id = productId.value;


    const product = {

        name: nameInput.value.trim(),

        category: categoryInput.value,

        price: Number(priceInput.value),

        quantity: Number(quantityInput.value),

        description: descriptionInput.value.trim()
    };


    // Client-side validation

    if (product.name.length < 2) {

        notify(
            "Product name must contain at least 2 characters.",
            "error"
        );

        return;
    }


    if (!product.category) {

        notify(
            "Please select a category.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(product.price) ||
        product.price <= 0
    ) {

        notify(
            "Price must be greater than 0.",
            "error"
        );

        return;
    }


    if (
        !Number.isInteger(product.quantity) ||
        product.quantity < 0
    ) {

        notify(
            "Quantity must be a valid whole number.",
            "error"
        );

        return;
    }


    try {

        const url = id
            ? `/api/products/${id}`
            : "/api/products";


        const method = id
            ? "PUT"
            : "POST";


        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(product)

        });


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.message || "Operation failed."
            );
        }


        notify(result.message);


        resetForm();

        await loadProducts();


    } catch (error) {

        notify(
            error.message,
            "error"
        );
    }

});


// Edit product
function editRow(id) {

    const product = products.find(
        item => Number(item.id) === Number(id)
    );


    if (!product) {

        notify(
            "Product not found.",
            "error"
        );

        return;
    }


    productId.value = product.id;

    nameInput.value = product.name;

    categoryInput.value = product.category;

    priceInput.value = product.price;

    quantityInput.value = product.quantity;

    descriptionInput.value =
        product.description || "";


    document.getElementById("formTitle").textContent =
        "Edit product";


    submitBtn.textContent =
        "Save changes";


    nameInput.focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Delete product
async function deleteRow(id) {

    const product = products.find(
        item => Number(item.id) === Number(id)
    );


    if (!product) {
        return;
    }


    const confirmed = confirm(
        "Are you sure you want to delete " +
        product.name +
        "?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/products/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.message || "Delete failed."
            );
        }


        notify(result.message);

        await loadProducts();


    } catch (error) {

        notify(
            error.message,
            "error"
        );
    }
}


// Reset form
function resetForm() {

    form.reset();

    productId.value = "";

    document.getElementById("formTitle").textContent =
        "Add a product";

    submitBtn.textContent =
        "＋ Add product";
}


// Clear button
clearBtn.addEventListener(
    "click",
    resetForm
);


// Search
search.addEventListener(
    "input",
    render
);


// Initial load
loadProducts();