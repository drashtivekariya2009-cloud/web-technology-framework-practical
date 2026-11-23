let cart = [];
let wishlistCount = 0;

// Element References
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const productContainer = document.getElementById('product-container');
const addProductBtn = document.getElementById('add-product-btn');
const removeLastBtn = document.getElementById('remove-last-btn');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const contactForm = document.getElementById('contact-form');
const feedbackBanner = document.getElementById('feedback-banner');

const wishlistCountEl = document.getElementById('wishlist-count');
const cartIndicator = document.getElementById('cart-indicator');
const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPriceEl = document.getElementById('cart-total-price');

const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const closeImgModal = document.getElementById('close-img-modal');

// Feedback Helper
function showFeedback(msg) {
  feedbackBanner.textContent = msg;
  setTimeout(() => { feedbackBanner.textContent = ''; }, 3000);
}

// 1. Theme Switcher (Dark/Light)
themeToggleBtn.addEventListener('click', () => {
  if (document.body.getAttribute('data-theme') === 'dark') {
    document.body.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
    showFeedback('Switched to Light Mode');
  } else {
    document.body.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
    showFeedback('Switched to Dark Mode');
  }
});

// 2. Search & Category Filter
function filterProducts() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value.toLowerCase();
  const products = document.querySelectorAll('.product-card');

  products.forEach(product => {
    const name = product.getAttribute('data-name').toLowerCase();
    const category = (product.getAttribute('data-category') || 'all').toLowerCase();

    const matchesSearch = name.includes(searchText);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

    if (matchesSearch && matchesCategory) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

searchInput.addEventListener('keyup', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

// 3. Cart & Wishlist Add Fix
productContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-cart-btn')) {
    const card = e.target.closest('.product-card');
    const name = card.getAttribute('data-name');
    const price = parseFloat(card.getAttribute('data-price')) || 0;

    cart.push({ name, price });
    updateCartUI();
    showFeedback(`${name} added to cart!`);
  }

  if (e.target.classList.contains('wishlist-btn')) {
    wishlistCount++;
    wishlistCountEl.textContent = wishlistCount;
    showFeedback('Item added to Wishlist ❤️');
  }
});

// Cart UI Update
function updateCartUI() {
  cartCountEl.textContent = cart.length;
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      total += item.price;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <span>${item.name} - Rs: ${item.price.toFixed(2)}</span>
        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
      `;
      cartItemsContainer.appendChild(div);
    });
  }

  cartTotalPriceEl.textContent = total.toFixed(2);
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  updateCartUI();
};

// Modal Handling (Close on Outside Click & Close Button)
cartIndicator.addEventListener('click', () => cartModal.style.display = 'flex');
closeCartBtn.addEventListener('click', () => cartModal.style.display = 'none');

productContainer.addEventListener('dblclick', (e) => {
  if (e.target.tagName === 'IMG') {
    modalImg.src = e.target.src;
    imageModal.style.display = 'flex';
  }
});

closeImgModal.addEventListener('click', () => imageModal.style.display = 'none');

window.addEventListener('click', (e) => {
  if (e.target === cartModal) cartModal.style.display = 'none';
  if (e.target === imageModal) imageModal.style.display = 'none';
});

// 4. Manage Inventory
addProductBtn.addEventListener('click', () => {
  const nameInput = document.getElementById('new-product-name');
  const priceInput = document.getElementById('new-product-price');

  if (!nameInput.value.trim() || !priceInput.value.trim()) {
    showFeedback('Please fill all fields.');
    return;
  }

  const name = nameInput.value;
  const price = parseFloat(priceInput.value);

  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-name', name);
  card.setAttribute('data-price', price);
  card.setAttribute('data-category', 'all');

  card.innerHTML = `
    <img src="https://via.placeholder.com/200x180/ce93d8/ffffff?text=${encodeURIComponent(name)}" alt="${name}">
    <h3>${name}</h3>
    <p class="price">Rs: ${price.toFixed(2)}</p>
    <div class="card-buttons">
      <button class="btn add-cart-btn">Add to Cart</button>
      <button class="btn wishlist-btn">❤️</button>
    </div>
  `;

  productContainer.appendChild(card);
  showFeedback(`Added product: ${name}`);

  nameInput.value = '';
  priceInput.value = '';
});

removeLastBtn.addEventListener('click', () => {
  const products = productContainer.querySelectorAll('.product-card');
  if (products.length > 0) {
    productContainer.removeChild(products[products.length - 1]);
    showFeedback('Removed last product.');
  }
});

// 5. Tasks Planner
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.className = 'todo-item';
  li.innerHTML = `
    <span>${text}</span>
    <button class="remove-btn">Remove</button>
  `;

  li.querySelector('.remove-btn').addEventListener('click', () => {
    taskList.removeChild(li);
  });

  taskList.appendChild(li);
  taskInput.value = '';
});

// 6. Contact Form
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userName = document.getElementById('user-name').value;
  showFeedback(`Thank you ${userName}, your message has been sent successfully! ✨`);
  contactForm.reset();
});