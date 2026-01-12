document.addEventListener("DOMContentLoaded", loadProducts);

async function loadProducts() {
    try {
        const res = await fetch("/flowershop/server/api/products/list.php");
        const data = await res.json();

        if (!data.success) throw new Error();

        const grid = document.getElementById("productsGrid");
        grid.innerHTML = "";

        data.products.forEach(p => {
            grid.innerHTML += productCard(p);
        });

    } catch (err) {
        console.error("Product load failed", err);
    }
}

function productCard(p) {
    return `
    <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="product-card"
             onclick="window.location.href='/flowershop/public/product.html?id=${p.id}'">
            <img src="${p.image_url}">
            <h3>${p.name}</h3>
            <p>€${p.price}</p>
        </div>
    </div>`;
}


