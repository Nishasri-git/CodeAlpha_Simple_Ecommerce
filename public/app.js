document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('product-list')) {
        loadProducts();
        updateCartUI();
    }
    
    const user = localStorage.getItem('user');
    const authLink = document.getElementById('auth-link');
    if (authLink && user) {
        authLink.innerText = `Logged in as: ${user}`;
    }
});

function loadProducts() {
    fetch('/api/products')
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById('product-list');
            container.innerHTML = products.map(p => `
                <div class="product-card">
                    <h4>${p.name}</h4>
                    <p>₹${p.price}</p>
                    <a href="product.html?id=${p.id}">View Details</a><br><br>
                    <button onclick="addToCart('${p.name}', ${p.price})">Add to Cart</button>
                </div>
            `).join('');
        });
}

function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const list = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    
    if (!list) return;

    list.innerHTML = cart.map(item => `<li>${item.name} - ₹${item.price}</li>`).join('');
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    totalSpan.innerText = total;
}

function checkout() {
    const user = localStorage.getItem('user');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!user) {
        alert("Please login first to checkout!");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, total })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        localStorage.removeItem('cart');
        updateCartUI();
    });
}

function register() {
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message || data.error));
}

function login() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.user) {
            localStorage.setItem('user', data.user);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert(data.error);
        }
    });
}