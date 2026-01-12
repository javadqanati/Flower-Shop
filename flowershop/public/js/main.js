let slideIndex = 1;
function setSlide(input, index){
    slideIndex = index;
    let item = document.querySelector(`#${input}`);
    let slides = [...document.querySelector('.slides').children];
    slides.forEach((element) => {
        element.classList.remove('active');
    })
    item.classList.add('active');
}

setInterval(() => {
    slideIndex++;
    if(slideIndex === 4){
        slideIndex = 1;
    }
    setSlide(`slide${slideIndex}`, slideIndex);
}, 4000)

$(document).ready(function () {
    $("#owl-product").owlCarousel({
        loop: true,
        margin: 20,
        nav: true,
        items: 4
    });
});

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

async function loadProducts() {
    try {
        const res = await fetch("/flowershop/server/api/products/list.php");
        const data = await res.json();

        if (!data.success) return;

        const grid = document.getElementById("productGrid");
        const carousel = document.getElementById("owl-product");

        data.products.forEach(p => {

            /* ===== GRID: FEATURED ONLY ===== */
            if (Number(p.is_featured) === 1) {
                const gridCard = document.createElement("div");
                gridCard.className = "col-lg-3 col-md-4 col-sm-6 col-xs-12";
                gridCard.innerHTML = shoppingCardHTML(p);
                grid.appendChild(gridCard);
            }

            /* ===== CAROUSEL: ALL PRODUCTS ===== */
            const item = document.createElement("div");
            item.className = "item";
            item.innerHTML = shoppingCardHTML(p);
            carousel.appendChild(item);
        });



        /* 🔑 THIS IS THE MOST IMPORTANT LINE */
        /* Rebuild Owl AFTER injecting items */
        $("#owl-product").trigger("destroy.owl.carousel");
        $("#owl-product").owlCarousel();

    } catch (e) {
        console.error("Product loading failed", e);
    }
}

/* ===== REUSABLE CARD TEMPLATE ===== */
function shoppingCardHTML(p) {
    return `
        <div class="shopping-card" data-id="${p.id}">

            <div class="image-sec">
                <img src="${p.image_url}">
                ${p.is_featured ? `<span class="hot-offer">Hot offer!</span>` : ``}
            </div>

            <div class="title">${p.name}</div>

            <div class="buttons">
                <div class="right">
                    <span class="price">${p.price}$</span>
                </div>
                <div class="left">
                    <div class="extend-btn">
                        <a class="b-text" href="#">Wish list</a>
                        <a class="b-icon"><i class="fa-regular fa-heart"></i></a>
                    </div>
                    <div class="extend-btn">
                        <a class="b-text" href="#">add to cart</a>
                        <a class="b-icon"><i class="fa-solid fa-bag-shopping"></i></a>
                    </div>
                </div>
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
            body: JSON.stringify({ product_id: productId })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Failed to add to cart");
            return;
        }

        alert("✅ Product added to cart!");
    } catch (err) {
        console.error("Add to cart error:", err);
        alert("❌ Something went wrong");
    }
}

document.addEventListener("click", (e) => {

    const addToCartLink = e.target.closest(
        ".extend-btn .b-text, .extend-btn .b-icon"
    );

    if (!addToCartLink) return;

    e.preventDefault(); // 🔴 THIS is what was missing

    const card = addToCartLink.closest(".shopping-card");
    if (!card) return;

    const productId = card.dataset.id;
    if (!productId) {
        console.error("Product ID missing");
        return;
    }

    addToCart(productId);
});

document.addEventListener("click", (e) => {

    const card = e.target.closest(".shopping-card");
    if (!card) return;

    // ❌ If user clicked on buttons (cart / wishlist), do nothing
    if (e.target.closest(".extend-btn")) return;

    const productId = card.dataset.id;
    if (!productId) return;

    // ✅ Navigate to product page
    window.location.href = `/flowershop/public/product.html?id=${productId}`;
});

