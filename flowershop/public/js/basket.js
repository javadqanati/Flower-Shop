document.addEventListener("DOMContentLoaded", loadBasket);

async function loadBasket() {
    const res = await fetch("/flowershop/server/api/cart/get.php", {
        credentials: "include"
    });
    const data = await res.json();

    const basket = document.getElementById("basketSection");

    if (!data.success || !Array.isArray(data.items) || data.items.length === 0) {
        basket.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Your basket is empty</p>
            </div>
        `;
        document.getElementById("summarySubtotal").textContent = "€0.00";
        document.getElementById("totalPrice").textContent = "€0.00";
        document.getElementById("checkoutSection").style.display = "none";
        return;
    }

    let total = 0;

    let table = `
        <table class="basket-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;

    data.items.forEach(item => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
            console.warn("Invalid cart item skipped:", item);
            return;
        }

        const subtotal = price * quantity;
        total += subtotal;

        table += `
            <tr data-id="${item.product_id}">
                <td>
                    <div class="basket-product">
                        <img src="${item.image_url || '/images/placeholder.jpg'}">
                        <div>
                            <div class="name">${item.name}</div>
                            <div class="price">€${price.toFixed(2)}</div>
                        </div>
                    </div>
                </td>

                <td>
                    <div class="qty">
                        <button class="qty-minus">−</button>
                        <span>${quantity}</span>
                        <button class="qty-plus">+</button>
                    </div>
                </td>

                <td class="subtotal">€${subtotal.toFixed(2)}</td>

                <td>
                    <button class="remove-btn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    table += `</tbody></table>`;
    basket.innerHTML = table;

    const safeTotal = Number.isFinite(total) ? total : 0;

    const summaryEl = document.getElementById("summarySubtotal");
    const totalEl = document.getElementById("totalPrice");
    const checkoutEl = document.getElementById("checkoutSection");

    if (summaryEl) summaryEl.textContent = `€${safeTotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `€${safeTotal.toFixed(2)}`;

}

/* ===== REMOVE / UPDATE ===== */
document.addEventListener("click", async (e) => {
    const removeBtn = e.target.closest(".remove-btn");
    if (removeBtn) {
        const row = removeBtn.closest("tr");
        await fetch("/flowershop/server/api/cart/remove.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: row.dataset.id })
        });
        loadBasket();
        return;
    }

    const plusBtn = e.target.closest(".qty-plus");
    const minusBtn = e.target.closest(".qty-minus");

    if (plusBtn || minusBtn) {
        const row = e.target.closest("tr");
        const productId = row.dataset.id;
        const currentQty = Number(row.querySelector(".qty span").textContent);
        const newQty = plusBtn ? currentQty + 1 : currentQty - 1;

        if (newQty <= 0) return;

        await fetch("/flowershop/server/api/cart/update.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, quantity: newQty })
        });

        loadBasket();
    }
});

document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    const checkoutEl = document.getElementById("checkoutSection");
    if (!checkoutEl) return;

    checkoutEl.style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});


document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.getElementById("checkoutForm");
    if (!checkoutForm) return;

    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // 🔑 stop browser reload

        console.log("PAY NOW CLICKED"); // debug proof

        const formData = new FormData(checkoutForm);

        try {
            const res = await fetch(
                "/flowershop/server/api/orders/create.php",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            const data = await res.json();

            if (data.success) {
                alert("✅ Order placed successfully!");
                window.location.href = "/flowershop/public/index.html";
            } else {
                alert(data.message || "❌ Order failed");
            }

        } catch (err) {
            console.error("Checkout error:", err);
            alert("❌ Checkout failed");
        }
    });
});

