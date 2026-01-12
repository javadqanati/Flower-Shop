document.addEventListener("DOMContentLoaded", loadProduct);

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    const res = await fetch(`/flowershop/server/api/products/get.php?id=${id}`);
    const data = await res.json();

    if (!data.success) {
        document.getElementById("productContainer").innerHTML =
            "<p>Product not found</p>";
        return;
    }

    renderProduct(data.product);
}

function renderProduct(p) {
    document.getElementById("productContainer").innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
            <div class="product-info">
                <h1>${p.name}</h1>
                <div class="price">€${Number(p.price).toFixed(2)}</div>
                <p>${p.description ?? "No description available."}</p>
        
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${p.id})">
                        Add to Cart
                    </button>
        
                    <button class="btn btn-secondary" onclick="addToWishlist(${p.id})">
                        ♡ Add to Wishlist
                    </button>
                </div>
            </div>
        `;
}

async function addToCart(productId) {
    try {
        const res = await fetch("/flowershop/server/api/cart/add.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Failed to add to cart");
            return;
        }

        alert("Added to cart 🛒");
    } catch (err) {
        console.error(err);
        alert("Cart error");
    }
}

function addToWishlist(productId) {
    alert("♡ Added to wishlist (feature coming soon)");
}

