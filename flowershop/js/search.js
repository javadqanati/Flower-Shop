document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    setupSearch();
});

/* ================= CATEGORIES ================= */

async function loadCategories() {
    try {
        const res = await fetch("/flowershop/server/api/categories/list.php");
        const data = await res.json();

        if (!data.success) return;

        const grid = document.getElementById("categoryGrid");
        grid.innerHTML = "";

        data.categories.forEach(c => {
            const div = document.createElement("div");
            div.className = "col-lg-3 col-md-4 col-sm-6 col-xs-12";
            div.innerHTML = `
                <div class="category-card" data-id="${c.id}">
                    ${c.name}
                </div>
            `;
            grid.appendChild(div);
        });

    } catch (e) {
        console.error("Category load failed", e);
    }
}

/* ================= SEARCH ================= */

function setupSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");

    btn.addEventListener("click", () => {
        searchProducts(input.value);
    });

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") searchProducts(input.value);
    });
}

/* ================= SEARCH PRODUCTS ================= */

async function searchProducts(query) {
    if (!query) return;

    try {
        const res = await fetch(
            `/flowershop/server/api/products/search.php?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();

        if (!data.success) return;

        renderResults(data.products, `Search results for "${query}"`);

    } catch (e) {
        console.error("Search failed", e);
    }
}

/* ================= CATEGORY CLICK ================= */

document.addEventListener("click", async (e) => {

    const cat = e.target.closest(".category-card");
    if (!cat) return;

    const categoryId = cat.dataset.id;

    try {
        const res = await fetch(
            `/flowershop/server/api/products/by_category.php?id=${categoryId}`
        );
        const data = await res.json();

        if (!data.success) return;

        renderResults(data.products, "Category results");

    } catch (e) {
        console.error("Category filter failed", e);
    }
});

/* ================= RENDER RESULTS ================= */

function renderResults(products, title) {
    const grid = document.getElementById("resultsGrid");
    const heading = document.getElementById("resultsTitle");

    heading.textContent = title;
    grid.innerHTML = "";

    if (products.length === 0) {
        grid.innerHTML = `<p class="text-muted">No products found.</p>`;
        return;
    }

    products.forEach(p => {
        const col = document.createElement("div");
        col.className = "col-lg-3 col-md-4 col-sm-6 col-xs-12";
        col.innerHTML = shoppingCardHTML(p);
        grid.appendChild(col);
    });
}
